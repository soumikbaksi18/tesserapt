export interface AptosPool {
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apyBase: number;
  apyReward: number | null;
  apy: number;
  rewardTokens: string[] | null;
  pool: string;
  apyPct1D: number;
  apyPct7D: number;
  apyPct30D: number;
  stablecoin: boolean;
  ilRisk: string;
  exposure: string;
  predictions: {
    predictedClass: string;
    predictedProbability: number;
    binnedConfidence: number;
  };
  poolMeta: string | null;
  mu: number;
  sigma: number;
  count: number;
  outlier: boolean;
  underlyingTokens: string[] | null;
  il7d: number | null;
  apyBase7d: number | null;
  apyMean30d: number;
  volumeUsd1d: number | null;
  volumeUsd7d: number | null;
  apyBaseInception: number | null;
}

export interface AptosPoolsResponse {
  count: number;
  results: AptosPool[];
}

const API_BASE_URL = 'https://fastapi-on-render-0s0u.onrender.com';

export const getAptosPools = async (
  limit: number = 5
): Promise<AptosPoolsResponse> => {
  const response = await fetch(`${API_BASE_URL}/llama/pools?chain=aptos&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Aptos pools: ${response.statusText}`);
  }

  return response.json();
};

export const getAptosPoolsLocal = async (
  limit: number = 5,
  localPort: number = 8000
): Promise<AptosPoolsResponse> => {
  const response = await fetch(`http://localhost:${localPort}/llama/pools?chain=aptos&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Aptos pools: ${response.statusText}`);
  }

  return response.json();
};
