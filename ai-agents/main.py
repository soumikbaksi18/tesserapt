# main.py
import os
import asyncio
import time
from enum import Enum
from typing import Optional, Tuple, Literal, Dict, Any, List

import numpy as np
import httpx
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from lstm import (
    train_from_prices,
    predict_next_price,
)
from defillama import router as llama_router

# ============================================================
# Env / Config  (loads .env locally; on Render use env vars)
# ============================================================
load_dotenv()  # <-- loads .env for local dev

# Model / endpoints config
WINDOW = int(os.getenv("MODEL_WINDOW", "30"))
DEFAULT_DAYS = int(os.getenv("MODEL_DEFAULT_DAYS", "120"))

USER_AGENT = os.getenv("USER_AGENT", "BitmaxAI/1.0 (+https://fastapi-on-render)")
PUBLIC_ORIGIN = os.getenv("PUBLIC_ORIGIN", "").strip()

# ---------------- DeFiLlama (no API key required) ----------------
LLAMA_PRICES_BASE = "https://coins.llama.fi"
LLAMA_TIMEOUT = float(os.getenv("LLAMA_TIMEOUT", "30"))

#
COIN_MAP: Dict[str, Dict[str, str]] = {
    "bitcoin": {"llama_key": "coingecko:bitcoin"},
    "ethereum": {"llama_key": "coingecko:ethereum"},
    "avalanche-2": {"llama_key": "coingecko:avalanche-2"},
    "usd-coin": {"llama_key": "coingecko:usd-coin"},
}

# ============================================================
# FastAPI App
# ============================================================
app = FastAPI(title="AvaHacks AI API (DeFiLlama-backed)", version="0.3.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(llama_router)

class AppState:
    model = None
    window = WINDOW

state = AppState()

# ============================================================
# HTTP client + tiny cache
# ============================================================
_llama_client: Optional[httpx.AsyncClient] = None

def _llama_headers() -> dict:
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    if USER_AGENT:
        headers["User-Agent"] = USER_AGENT
    if PUBLIC_ORIGIN:
        headers["Referer"] = PUBLIC_ORIGIN
    return headers

def _get_llama_client() -> httpx.AsyncClient:
    global _llama_client
    if _llama_client is None:
        _llama_client = httpx.AsyncClient(timeout=LLAMA_TIMEOUT, headers=_llama_headers())
    return _llama_client

# small in-memory cache
_cache: Dict[str, Tuple[float, Any]] = {}

def cache_get(key: str, ttl: int) -> Optional[Any]:
    row = _cache.get(key)
    if not row:
        return None
    ts, val = row
    if time.time() - ts > ttl:
        _cache.pop(key, None)
        return None
    return val

def cache_set(key: str, val: Any):
    _cache[key] = (time.time(), val)

# ============================================================
# Helpers
# ============================================================
def _coin_to_llama_key(coin_id: str) -> str:
    if coin_id not in COIN_MAP:
        raise HTTPException(404, f"No DeFiLlama mapping for coin_id '{coin_id}'. Add it to COIN_MAP.")
    return COIN_MAP[coin_id]["llama_key"]

def _safe_pct_change(new: Optional[float], old: Optional[float]) -> Optional[float]:
    if new is None or old is None:
        return None
    if old == 0:
        return None
    return ((new - old) / (old + 1e-9)) * 100.0

# ============================================================
# DeFiLlama price endpoints
#   - Current: /prices/current/{coins}
#   - Historical by timestamp (unix seconds): /prices/historical/{ts}/{coins}
#   (Both support multiple comma-separated coins)
# ============================================================
async def llama_current_prices(coin_keys: List[str]) -> Dict[str, Any]:
    """
    Returns { 'coins': { '<key>': {'price': float, 'symbol': str, ... }, ... } }
    """
    key = f"llama:current:{','.join(coin_keys)}"
    cached = cache_get(key, ttl=15)
    if cached is not None:
        return cached

    client = _get_llama_client()
    url = f"{LLAMA_PRICES_BASE}/prices/current/{','.join(coin_keys)}"
    r = await client.get(url)
    r.raise_for_status()
    js = r.json()
    cache_set(key, js)
    return js

async def llama_price_at(ts_sec: int, coin_key: str) -> Optional[float]:
    """
    Price at a given unix seconds timestamp.
    Returns float or None if not available.
    """
    key = f"llama:historical:{coin_key}:{ts_sec}"
    cached = cache_get(key, ttl=600)
    if cached is not None:
        return cached

    client = _get_llama_client()
    url = f"{LLAMA_PRICES_BASE}/prices/historical/{ts_sec}/{coin_key}"
    r = await client.get(url)
    if r.status_code == 404:
        cache_set(key, None)
        return None
    r.raise_for_status()
    js = r.json()
    price_obj = (js.get("coins") or {}).get(coin_key) or {}
    price = price_obj.get("price")
    price_f = float(price) if price is not None else None
    cache_set(key, price_f)
    return price_f

async def llama_daily_history(coin_id: str, days: int) -> List[Tuple[int, float]]:
    """
    Build daily history by sampling price once per day at UTC midnight.
    (N requests = days; free but multiple calls.)
    Returns list of (timestamp_ms, price).
    """
    if days < 1:
        raise HTTPException(400, "days must be >= 1")
    from datetime import datetime, timedelta, timezone

    coin_key = _coin_to_llama_key(coin_id)
    pairs: List[Tuple[int, float]] = []

    # today UTC midnight (exclusive end)
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    # fetch each day price at midnight (unix seconds)
    for i in range(days, 0, -1):
        ts = int((today - timedelta(days=i)).timestamp())
        price = await llama_price_at(ts, coin_key)
        if price is not None:
            pairs.append((ts * 1000, float(price)))

    if not pairs:
        raise HTTPException(404, f"No historical prices available for {coin_id} from DeFiLlama")

    return pairs

# ============================================================
# Price helpers (DeFiLlama-backed; same external shapes as before)
# ============================================================
async def get_coin_history(coin_id: str, days: int):
    """
    Return {"prices": [[ts_ms, price], ...]} built from DeFiLlama daily samples.
    """
    pairs = await llama_daily_history(coin_id, days=days)
    pairs = sorted(set(pairs), key=lambda x: x[0])
    return {"prices": [[t, p] for t, p in pairs]}

async def get_coin_data(coin_id: str):
    """
    Snapshot using DeFiLlama current + derived % changes by sampling historical points.
    - current price from /prices/current
    - 1h/24h/7d computed via /prices/historical at corresponding timestamps
    """
    from datetime import datetime, timedelta, timezone

    coin_key = _coin_to_llama_key(coin_id)

    # current
    js_now = await llama_current_prices([coin_key])
    now_price = ((js_now.get("coins") or {}).get(coin_key) or {}).get("price")
    current = float(now_price) if now_price is not None else None

    # historical anchors
    now = datetime.now(timezone.utc)
    ts_1h = int((now - timedelta(hours=1)).timestamp())
    ts_24h = int((now - timedelta(days=1)).timestamp())
    ts_7d = int((now - timedelta(days=7)).timestamp())

    p_1h = await llama_price_at(ts_1h, coin_key)
    p_24h = await llama_price_at(ts_24h, coin_key)
    p_7d = await llama_price_at(ts_7d, coin_key)

    return {
        "id": coin_id,
        "current_price": current,
        "price_change_percentage_1h_in_currency": _safe_pct_change(current, p_1h),
        "price_change_percentage_24h_in_currency": _safe_pct_change(current, p_24h),
        "price_change_percentage_7d_in_currency": _safe_pct_change(current, p_7d),
        "source": "defillama",
    }

# ============================================================
# Optimizer (unchanged logic)
# ============================================================
class RiskProfile(str, Enum):
    aggressive = "aggressive"
    conservative = "conservative"
    moderate = "moderate"

def recommend_split(prices: List[float], risk_profile: Optional[RiskProfile] = None):
    arr = np.asarray(prices[-state.window-1:], dtype=float)
    if arr.size < 3:
        return 0.5, 0.5
    ret = np.diff(np.log(arr + 1e-9))
    vol = float(np.std(ret))

    pt = float(np.clip(0.2 + (vol / 0.05), 0.2, 0.8))
    yt = 1.0 - pt

    if risk_profile == RiskProfile.conservative:
        pt = min(0.9, pt + 0.1); yt = 1.0 - pt
    elif risk_profile == RiskProfile.aggressive:
        yt = min(0.9, yt + 0.1); pt = 1.0 - yt

    return round(pt, 3), round(yt, 3)

def adjust_for_maturity(
    pt: float,
    yt: float,
    maturity_months: int,
    risk_profile: Optional[RiskProfile],
    trend: Optional[float] = None,
) -> Tuple[float, float]:
    maturity_scale = {3: 0.0, 6: 0.33, 9: 0.66, 12: 1.0}.get(maturity_months, 0.0)
    MAX_TILT = 0.08
    tilt = MAX_TILT * maturity_scale

    if risk_profile == RiskProfile.conservative:
        pt = pt + tilt; yt = 1.0 - pt
    elif risk_profile == RiskProfile.aggressive:
        yt = yt + tilt; pt = 1.0 - yt
    else:
        if trend is not None:
            if trend > 0:
                yt = yt + 0.5 * tilt; pt = 1.0 - yt
            elif trend < 0:
                pt = pt + 0.5 * tilt; yt = 1.0 - pt

    pt = float(np.clip(pt, 0.1, 0.9))
    yt = float(np.clip(1.0 - pt, 0.1, 0.9))
    return round(pt, 3), round(yt, 3)

class OptimizeRequest(BaseModel):
    coin_id: str = "bitcoin"
    risk_profile: Optional[RiskProfile] = None
    maturity_months: Literal[3, 6, 9, 12] = 6

# ============================================================
# Lifecycle
# ============================================================
@app.on_event("startup")
async def startup():
    try:
        hist = await get_coin_history("bitcoin", max(DEFAULT_DAYS, WINDOW + 25))
        prices = [p[1] for p in hist["prices"]]
        if len(prices) < WINDOW + 6:
            raise RuntimeError("Insufficient history to train model")
        state.model = train_from_prices(np.asarray(prices, dtype=float), window=WINDOW)
        print("[startup] sklearn (returns) model trained and ready")
    except Exception as e:
        print(f"[startup] Model init failed: {e}")

@app.on_event("shutdown")
async def shutdown():
    global _llama_client
    try:
        if _llama_client is not None:
            await _llama_client.aclose()
            _llama_client = None
    except Exception:
        pass

# ============================================================
# Routes
# ============================================================
@app.get("/health")
async def health():
    return {
        "ok": True,
        "model_ready": state.model is not None,
        "window": state.window,
        "price_source": "defillama",
        "uses_api_key": False,
    }

@app.get("/coins/{coin_id}")
async def coin_data(coin_id: str):
    return await get_coin_data(coin_id)

@app.get("/coins/{coin_id}/history")
async def coin_history(coin_id: str, days: int = DEFAULT_DAYS):
    if days < 1:
        raise HTTPException(400, "days must be >= 1")
    return await get_coin_history(coin_id, days)

@app.post("/optimize")
async def optimize(req: OptimizeRequest = Body(...)):
    if not state.model:
        raise HTTPException(503, "Model not ready; try again shortly")

    hist = await get_coin_history(req.coin_id, max(DEFAULT_DAYS, WINDOW + 6))
    prices = [p[1] for p in hist["prices"]]
    if len(prices) < state.window + 1:
        raise HTTPException(422, "Insufficient history for prediction")

    last_prices = np.asarray(prices[-(state.window + 1):], dtype=float)
    try:
        pred_next = predict_next_price(state.model, last_prices, window=state.window)
    except Exception as e:
        raise HTTPException(500, f"Prediction failed: {e}")

    pt, yt = recommend_split(prices, req.risk_profile)

    last_price = float(last_prices[-1])
    trend = (float(pred_next) - last_price) / (last_price + 1e-9)

    pt, yt = adjust_for_maturity(pt, yt, req.maturity_months, req.risk_profile, trend=trend)

    return {
        "coin_id": req.coin_id,
        "risk_profile": (req.risk_profile.value if req.risk_profile else "unspecified"),
        "maturity_months": req.maturity_months,
        "recommended_split": {"PT": pt, "YT": yt},
        "prediction": {
            "window": state.window,
            "last_price": float(last_price),
            "predicted_next_price": float(pred_next),
            "trend_estimate": round(trend, 6),
            "target": "log-return",
        },
        "notes": {
            "logic": "Model predicts next log-return and converts to price.",
            "safety_clip_log_return": "[-0.3, 0.3]",
            "data_source": "DeFiLlama (coins.llama.fi)",
        },
    }
