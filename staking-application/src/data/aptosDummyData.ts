import type { LPRecommendationResponse } from '../api/lprecommendations';
import type { AptosPoolsResponse } from '../api/aptospools';

// Dummy LP Recommendations Data
export const dummyLPRecommendations: LPRecommendationResponse = {
  "inputs": {
    "amountUsd": 500.0,
    "horizonMonths": 6,
    "riskTolerance": "aggressive",
    "chain": "aptos",
    "project": null,
    "search": null,
    "limitFetch": 600,
    "topN": 5,
    "includeNarrative": true
  },
  "universeCount": 600,
  "tvlFloorUsed": 100000.0,
  "topN": [
    {
      "pool": "a34c8a80-0001-4fc3-9402-7d6ac3e5234a",
      "project": "hyperion",
      "chain": "Aptos",
      "symbol": "USDT-USDC",
      "url": null,
      "category": null,
      "tvlUsd": 36395975.0,
      "apy_now": 23.73187,
      "apy_net_estimate": 30.0034,
      "periodReturnPct": 15.9712,
      "downsidePeriod": 0.451106,
      "RAR": 0.354,
      "Score": 65.35,
      "throughput": 0,
      "conf": 0.7125,
      "amountStartUSD": 500.0,
      "amountEndUSD": 579.856194,
      "profitUsd": 79.856194,
      "horizonMonths": 6,
      "why": {
        "tvlScore": 0.756,
        "ilPenaltyPctPts": 0.0,
        "exposureBias": 0.02,
        "style": "stable"
      },
      "exposure": "multi",
      "ilRisk": "no",
      "underlyingTokens": [
        "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b",
        "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b"
      ],
      "topsisScore": 0.852999
    },
    {
      "pool": "490006e3-284b-4107-9bb9-99906b7880b2",
      "project": "amnis-finance",
      "chain": "Aptos",
      "symbol": "APT",
      "url": null,
      "category": null,
      "tvlUsd": 121244226.0,
      "apy_now": 10.33877,
      "apy_net_estimate": 10.1017,
      "periodReturnPct": 5.1583,
      "downsidePeriod": 0.049497,
      "RAR": 1.0421,
      "Score": 70.59,
      "throughput": 0,
      "conf": 0.8625,
      "amountStartUSD": 500.0,
      "amountEndUSD": 525.791638,
      "profitUsd": 25.791638,
      "horizonMonths": 6,
      "why": {
        "tvlScore": 0.808,
        "ilPenaltyPctPts": 0.0,
        "exposureBias": 0.0,
        "style": "volatile"
      },
      "exposure": "single",
      "ilRisk": "no",
      "underlyingTokens": null,
      "topsisScore": 0.356008
    },
    {
      "pool": "2b3e1182-54fe-4dcd-a9e0-31d734a852eb",
      "project": "thalaswap-v2",
      "chain": "Aptos",
      "symbol": "USDT-USDC",
      "url": null,
      "category": null,
      "tvlUsd": 23050506.0,
      "apy_now": 10.78777,
      "apy_net_estimate": 6.1107,
      "periodReturnPct": 3.0945,
      "downsidePeriod": 0.089103,
      "RAR": 0.3473,
      "Score": 46.68,
      "throughput": 0,
      "conf": 0.875,
      "amountStartUSD": 500.0,
      "amountEndUSD": 515.472443,
      "profitUsd": 15.472443,
      "horizonMonths": 6,
      "why": {
        "tvlScore": 0.736,
        "ilPenaltyPctPts": 0.0,
        "exposureBias": 0.02,
        "style": "stable"
      },
      "exposure": "multi",
      "ilRisk": "no",
      "underlyingTokens": [
        "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b",
        "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b"
      ],
      "topsisScore": 0.219887
    },
    {
      "pool": "dac8dcd9-fbb4-4161-bbb8-4550914b649c",
      "project": "echelon-market",
      "chain": "Aptos",
      "symbol": "SUSDE",
      "url": null,
      "category": null,
      "tvlUsd": 43890583.0,
      "apy_now": 11.69802,
      "apy_net_estimate": 5.1042,
      "periodReturnPct": 2.5794,
      "downsidePeriod": 0.082625,
      "RAR": 0.3122,
      "Score": 41.4,
      "throughput": 0,
      "conf": 0.6875,
      "amountStartUSD": 500.0,
      "amountEndUSD": 512.897023,
      "profitUsd": 12.897023,
      "horizonMonths": 6,
      "why": {
        "tvlScore": 0.764,
        "ilPenaltyPctPts": 0.0,
        "exposureBias": 0.0,
        "style": "stable"
      },
      "exposure": "single",
      "ilRisk": "no",
      "underlyingTokens": [
        "0xb30a694a344edee467d9f82330bbe7c3b89f440a1ecd2da1f3bca266560fce69"
      ],
      "topsisScore": 0.193615
    },
    {
      "pool": "2281d0f8-0d11-4270-a451-0eb7ca39639e",
      "project": "echelon-market",
      "chain": "Aptos",
      "symbol": "SBTC",
      "url": null,
      "category": null,
      "tvlUsd": 82678853.0,
      "apy_now": 0.0,
      "apy_net_estimate": 0.0,
      "periodReturnPct": 0.0,
      "downsidePeriod": 0.049497,
      "RAR": 0.0,
      "Score": 41.46,
      "throughput": 0,
      "conf": 0.5,
      "amountStartUSD": 500.0,
      "amountEndUSD": 500.0,
      "profitUsd": 0.0,
      "horizonMonths": 6,
      "why": {
        "tvlScore": 0.792,
        "ilPenaltyPctPts": 0.0,
        "exposureBias": 0.0,
        "style": "bluechip"
      },
      "exposure": "single",
      "ilRisk": "no",
      "underlyingTokens": [
        "0x5dee1d4b13fae338a1e1780f9ad2709a010e824388efd169171a26e3ea9029bb::stakestone_bitcoin::StakeStoneBitcoin"
      ],
      "topsisScore": 0.130815
    }
  ],
  "explanations": [
    {
      "pool": "a34c8a80-0001-4fc3-9402-7d6ac3e5234a",
      "project": "hyperion",
      "symbol": "USDT-USDC",
      "text": "The Hyperion USDT-USDC pool on Aptos aligns well with your aggressive risk tolerance and six-month investment horizon, offering a net APY of approximately 30.003%. The returns are primarily driven by trading fees and rewards from liquidity provision, but be aware of the risks associated with impermanent loss (IL) due to the dual asset nature of the pool and potential volatility in market conditions. With an expected profit of around $79.86 at maturity, this reflects a projected return of 15.97% on your $500 investment. However, it's important to note the pool's TVL of $36,395,975 and liquidity score of 0.000 indicate lower throughput and confidence in the pool, which could affect your investment's stability. Always consider these factors before deploying your capital. Not financial advice."
    },
    {
      "pool": "490006e3-284b-4107-9bb9-99906b7880b2",
      "project": "amnis-finance",
      "symbol": "APT",
      "text": "The amnis-finance pool on Aptos may suit your aggressive risk tolerance and six-month investment horizon, offering a net APY of 10.102%, which translates to an expected return of approximately $25.79 on your $500 capital. This return is primarily driven by transaction fees and rewards generated within the pool. However, as this pool has a single asset exposure to APT, you should be aware of the risks associated with price volatility and potential impermanent loss, though impermanent loss is less of a concern in single-asset pools. The confidence proxy of 0.863 indicates a relatively strong belief in the pool's stability, but the low liquidity/throughput score of 0.000 and the total value locked (TVL) of $121,244,226 suggest caution regarding market depth and potential slippage. Always consider these factors before investing. Not financial advice."
    },
    {
      "pool": "2b3e1182-54fe-4dcd-a9e0-31d734a852eb",
      "project": "thalaswap-v2",
      "symbol": "USDT-USDC",
      "text": "The thalaswap-v2 USDT-USDC pool could align well with your aggressive investment style and six-month horizon, offering a relatively stable option with a net APY of 6.111%. The expected return of approximately $15.47 reflects the pool's fee structure, where returns primarily come from transaction fees rather than rewards, though there's a risk of impermanent loss if the asset prices diverge significantly. While the pool boasts a substantial total value locked (TVL) of over $23 million, the liquidity/throughput score is low at 0.000, which may indicate limited trading activity and could affect your ability to exit the position efficiently. Additionally, the confidence proxy of 0.875 suggests a moderate level of reliability, but be mindful of the downside risk of 0.089 over your investment horizon. Always consider these factors before proceeding. Not financial advice."
    },
    {
      "pool": "dac8dcd9-fbb4-4161-bbb8-4550914b649c",
      "project": "echelon-market",
      "symbol": "SUSDE",
      "text": "The echelon-market pool offering SUSDE could align well with your aggressive risk tolerance and six-month investment horizon. With a current raw APY of 11.698%, the returns primarily stem from trading fees rather than rewards, which is typical for stable asset pools. However, the net APY is estimated at 5.104% after adjusting for risks, indicating a more conservative return profile. Over your investment period, you might expect a profit of approximately $12.90, reflecting a modest gain on your $500 capital. It's important to note that while the pool has a total value locked (TVL) of $43,890,583, the liquidity/throughput score is low at 0.000, which could indicate potential challenges in executing trades efficiently. Additionally, the confidence proxy of 0.688 suggests moderate reliability, and the downside risk is relatively low at 0.083. Proceed with caution given these factors. Not financial advice."
    },
    {
      "pool": "2281d0f8-0d11-4270-a451-0eb7ca39639e",
      "project": "echelon-market",
      "symbol": "SBTC",
      "text": "The echelon-market pool focusing on SBTC may align with your aggressive risk tolerance and six-month investment horizon, given its bluechip category. However, it's important to note that the current raw APY is 0.000%, and the net APY is also 0.000%, indicating no expected returns from fees or rewards during this period. Consequently, your expected profit at maturity would be approximately $0.00, reflecting a lack of incentives for liquidity provision. The main risks include impermanent loss (IL) if the pool were dual-sided, and potential volatility in the underlying asset. Additionally, the pool's total value locked (TVL) of $82,678,853 and a liquidity/throughput score of 0.000 suggest low confidence in transaction efficiency. Given these factors, it's crucial to approach this investment with caution. Not financial advice."
    }
  ]
};

// Dummy Aptos Pools Data
export const dummyAptosPools: AptosPoolsResponse = {
  "count": 10,
  "results": [
    {
      "chain": "Ethereum",
      "project": "lido",
      "symbol": "STETH",
      "tvlUsd": 37117761525,
      "apyBase": 2.616,
      "apyReward": null,
      "apy": 2.616,
      "rewardTokens": null,
      "pool": "747c1d2a-c668-4682-b9f9-296708a3dd90",
      "apyPct1D": -0.093,
      "apyPct7D": -0.016,
      "apyPct30D": -0.008,
      "stablecoin": false,
      "ilRisk": "no",
      "exposure": "single",
      "predictions": {
        "predictedClass": "Stable/Up",
        "predictedProbability": 76,
        "binnedConfidence": 3
      },
      "poolMeta": null,
      "mu": 3.72844,
      "sigma": 0.05242,
      "count": 1192,
      "outlier": false,
      "underlyingTokens": [
        "0x0000000000000000000000000000000000000000"
      ],
      "il7d": null,
      "apyBase7d": null,
      "apyMean30d": 2.70615,
      "volumeUsd1d": null,
      "volumeUsd7d": null,
      "apyBaseInception": null
    },
    {
      "chain": "Ethereum",
      "project": "binance-staked-eth",
      "symbol": "WBETH",
      "tvlUsd": 13278511981,
      "apyBase": 2.4539,
      "apyReward": null,
      "apy": 2.4539,
      "rewardTokens": null,
      "pool": "80b8bf92-b953-4c20-98ea-c9653ef2bb98",
      "apyPct1D": 0.06315,
      "apyPct7D": 0.03249,
      "apyPct30D": 0.00767,
      "stablecoin": false,
      "ilRisk": "no",
      "exposure": "single",
      "predictions": {
        "predictedClass": "Stable/Up",
        "predictedProbability": 57.99999999999999,
        "binnedConfidence": 1
      },
      "poolMeta": null,
      "mu": 3.12061,
      "sigma": 0.03145,
      "count": 813,
      "outlier": false,
      "underlyingTokens": [
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
      ],
      "il7d": null,
      "apyBase7d": null,
      "apyMean30d": 2.47429,
      "volumeUsd1d": null,
      "volumeUsd7d": null,
      "apyBaseInception": null
    },
    {
      "chain": "Ethereum",
      "project": "ether.fi-stake",
      "symbol": "WEETH",
      "tvlUsd": 11537972738,
      "apyBase": 3.114,
      "apyReward": 0.30537,
      "apy": 3.41937,
      "rewardTokens": [
        "0x8F08B70456eb22f6109F57b8fafE862ED28E6040"
      ],
      "pool": "46bd2bdf-6d92-4066-b482-e885ee172264",
      "apyPct1D": 0.14314,
      "apyPct7D": 0.2689,
      "apyPct30D": -0.27958,
      "stablecoin": false,
      "ilRisk": "no",
      "exposure": "single",
      "predictions": {
        "predictedClass": "Stable/Up",
        "predictedProbability": 66,
        "binnedConfidence": 2
      },
      "poolMeta": null,
      "mu": 3.35846,
      "sigma": 0.1112,
      "count": 460,
      "outlier": false,
      "underlyingTokens": [
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
      ],
      "il7d": null,
      "apyBase7d": 2.8425,
      "apyMean30d": 3.071,
      "volumeUsd1d": null,
      "volumeUsd7d": null,
      "apyBaseInception": null
    },
    {
      "chain": "Ethereum",
      "project": "aave-v3",
      "symbol": "WEETH",
      "tvlUsd": 8129942976,
      "apyBase": 0.00039,
      "apyReward": null,
      "apy": 0.00039,
      "rewardTokens": null,
      "pool": "db678df9-3281-4bc2-a8bb-01160ffd6d48",
      "apyPct1D": 0,
      "apyPct7D": 1e-05,
      "apyPct30D": 4e-05,
      "stablecoin": false,
      "ilRisk": "no",
      "exposure": "single",
      "predictions": {
        "predictedClass": "Stable/Up",
        "predictedProbability": 80,
        "binnedConfidence": 3
      },
      "poolMeta": null,
      "mu": 0.06883,
      "sigma": 0.00773,
      "count": 512,
      "outlier": false,
      "underlyingTokens": [
        "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee"
      ],
      "il7d": null,
      "apyBase7d": null,
      "apyMean30d": 0.00037,
      "volumeUsd1d": null,
      "volumeUsd7d": null,
      "apyBaseInception": null
    },
    {
      "chain": "Ethereum",
      "project": "rocket-pool",
      "symbol": "RETH",
      "tvlUsd": 5773396145,
      "apyBase": 2.34584,
      "apyReward": null,
      "apy": 2.34584,
      "rewardTokens": null,
      "pool": "d4b3c522-6127-4b89-bedf-83641cdcd2eb",
      "apyPct1D": -0.00636,
      "apyPct7D": -0.0488,
      "apyPct30D": -0.05902,
      "stablecoin": false,
      "ilRisk": "no",
      "exposure": "single",
      "predictions": {
        "predictedClass": "Stable/Up",
        "predictedProbability": 56.99999999999999,
        "binnedConfidence": 1
      },
      "poolMeta": null,
      "mu": 3.13165,
      "sigma": 0.03731,
      "count": 963,
      "outlier": false,
      "underlyingTokens": [
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
      ],
      "il7d": null,
      "apyBase7d": null,
      "apyMean30d": 2.45146,
      "volumeUsd1d": null,
      "volumeUsd7d": null,
      "apyBaseInception": null
    },
    {
      "chain": "Ethereum",
      "project": "ethena-usde",
      "symbol": "SUSDE",
      "tvlUsd": 5716328603,
      "apyBase": 5.32927,
      "apyReward": null,
      "apy": 5.32927,
      "rewardTokens": null,
      "pool": "66985a81-9c51-46ca-9977-42b4fe7bc6df",
      "apyPct1D": -3.98365,
      "apyPct7D": -4.1209,
      "apyPct30D": 0.49894,
      "stablecoin": true,
      "ilRisk": "no",
      "exposure": "single",
      "predictions": {
        "predictedClass": "Stable/Up",
        "predictedProbability": 77,
        "binnedConfidence": 3
      },
      "poolMeta": "7 days unstaking",
      "mu": 12.19854,
      "sigma": 0.4074,
      "count": 568,
      "outlier": false,
      "underlyingTokens": null,
      "il7d": null,
      "apyBase7d": null,
      "apyMean30d": 7.58232,
      "volumeUsd1d": null,
      "volumeUsd7d": null,
      "apyBaseInception": null
    },
    {
      "chain": "Ethereum",
      "project": "aave-v3",
      "symbol": "WSTETH",
      "tvlUsd": 4843938235,
      "apyBase": 0.04299,
      "apyReward": null,
      "apy": 0.04299,
      "rewardTokens": null,
      "pool": "e6435aae-cbe9-4d26-ab2c-a4d533db9972",
      "apyPct1D": 0.00065,
      "apyPct7D": -0.00337,
      "apyPct30D": 0.00418,
      "stablecoin": false,
      "ilRisk": "no",
      "exposure": "single",
      "predictions": {
        "predictedClass": "Stable/Up",
        "predictedProbability": 62,
        "binnedConfidence": 2
      },
      "poolMeta": null,
      "mu": 0.03421,
      "sigma": 0.0026,
      "count": 942,
      "outlier": false,
      "underlyingTokens": [
        "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0"
      ],
      "il7d": null,
      "apyBase7d": null,
      "apyMean30d": 0.04417,
      "volumeUsd1d": null,
      "volumeUsd7d": null,
      "apyBaseInception": null
    },
    {
      "chain": "Ethereum",
      "project": "aave-v3",
      "symbol": "WBTC",
      "tvlUsd": 4783671525,
      "apyBase": 0.00661,
      "apyReward": null,
      "apy": 0.00661,
      "rewardTokens": null,
      "pool": "7e382157-b1bc-406d-b17b-facba43b716e",
      "apyPct1D": -0.00104,
      "apyPct7D": -0.00969,
      "apyPct30D": 0.00343,
      "stablecoin": false,
      "ilRisk": "no",
      "exposure": "single",
      "predictions": {
        "predictedClass": "Stable/Up",
        "predictedProbability": 86,
        "binnedConfidence": 3
      },
      "poolMeta": null,
      "mu": 0.08894,
      "sigma": 0.00631,
      "count": 942,
      "outlier": false,
      "underlyingTokens": [
        "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"
      ],
      "il7d": null,
      "apyBase7d": null,
      "apyMean30d": 0.01012,
      "volumeUsd1d": null,
      "volumeUsd7d": null,
      "apyBaseInception": null
    },
    {
      "chain": "Ethereum",
      "project": "sparklend",
      "symbol": "WSTETH",
      "tvlUsd": 3129599195,
      "apyBase": 4e-05,
      "apyReward": null,
      "apy": 4e-05,
      "rewardTokens": null,
      "pool": "3b45941c-16cb-48c5-a490-16c6c4f1d86a",
      "apyPct1D": -1e-05,
      "apyPct7D": -0.00014,
      "apyPct30D": -9e-05,
      "stablecoin": false,
      "ilRisk": "no",
      "exposure": "single",
      "predictions": {
        "predictedClass": "Stable/Up",
        "predictedProbability": 62,
        "binnedConfidence": 2
      },
      "poolMeta": null,
      "mu": 0.00174,
      "sigma": 0.00032,
      "count": 849,
      "outlier": false,
      "underlyingTokens": [
        "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0"
      ],
      "il7d": null,
      "apyBase7d": null,
      "apyMean30d": 0.00017,
      "volumeUsd1d": null,
      "volumeUsd7d": null,
      "apyBaseInception": null
    },
    {
      "chain": "Solana",
      "project": "jito-liquid-staking",
      "symbol": "JITOSOL",
      "tvlUsd": 2975262574,
      "apyBase": 6.74,
      "apyReward": null,
      "apy": 6.74,
      "rewardTokens": null,
      "pool": "0e7d0722-9054-4907-8593-567b353c0900",
      "apyPct1D": 0.04,
      "apyPct7D": 0.44,
      "apyPct30D": -0.32,
      "stablecoin": false,
      "ilRisk": "no",
      "exposure": "single",
      "predictions": {
        "predictedClass": "Stable/Up",
        "predictedProbability": 76,
        "binnedConfidence": 3
      },
      "poolMeta": null,
      "mu": 7.50102,
      "sigma": 0.04218,
      "count": 166,
      "outlier": false,
      "underlyingTokens": [
        "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn"
      ],
      "il7d": null,
      "apyBase7d": null,
      "apyMean30d": 6.74205,
      "volumeUsd1d": null,
      "volumeUsd7d": null,
      "apyBaseInception": null
    }
  ]
};
