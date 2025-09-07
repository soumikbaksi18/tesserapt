# lstm.py
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingRegressor

def _make_supervised_from_returns(returns: np.ndarray, window: int):
    """
    Supervised dataset on STATIONARY log-returns.
      X[i] = [r_{i-window}, ..., r_{i-1}]
      y[i] = r_i
    where r_t = log(P_t / P_{t-1})
    """
    r = np.asarray(returns, dtype=float).flatten()
    if r.ndim != 1:
        raise ValueError("returns must be 1D")
    if len(r) <= window:
        raise ValueError("not enough returns for chosen window")

    X, y = [], []
    for i in range(window, len(r)):
        X.append(r[i - window:i])
        y.append(r[i])
    return np.asarray(X), np.asarray(y)

def _prices_to_returns(prices: np.ndarray) -> np.ndarray:
    p = np.asarray(prices, dtype=float).flatten()
    if p.ndim != 1 or len(p) < 2:
        raise ValueError("need at least 2 prices to compute returns")
    # log-returns are more stable than simple pct changes
    return np.diff(np.log(p + 1e-12))

def train_from_prices(prices: np.ndarray, window: int = 30) -> Pipeline:

    returns = _prices_to_returns(prices)
    X, y = _make_supervised_from_returns(returns, window)

    model = Pipeline(steps=[
        ("scaler", StandardScaler()),  # helpful for non-tree models; harmless here
        ("gbr", GradientBoostingRegressor(
            n_estimators=400,
            max_depth=3,
            learning_rate=0.05,
            random_state=42,
            subsample=0.9
        )),
    ])
    model.fit(X, y)
    return model

def predict_next_price(model: Pipeline, last_window_prices: np.ndarray, window: int = 30) -> float:

    p = np.asarray(last_window_prices, dtype=float).flatten()
    if len(p) < window + 1:
        raise ValueError(f"need at least {window+1} prices, got {len(p)}")

    last_price = float(p[-1])
    r_window = _prices_to_returns(p)  # length == window
    X = r_window.reshape(1, -1)

    r_hat = float(model.predict(X)[0])

    # Safety clip to avoid wild outliers from the regressor (≈ ±30% move in log terms)
    r_hat = float(np.clip(r_hat, -0.3, 0.3))

    next_price = last_price * float(np.exp(r_hat))
    return next_price
