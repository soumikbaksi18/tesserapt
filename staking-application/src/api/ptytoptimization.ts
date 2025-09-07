export interface PTYTOptimizationInputs {
  coin_id: string;
  risk_profile?: 'conservative' | 'aggressive';
}

export interface PTYTSplit {
  PT: number;
  YT: number;
}

export interface PTYTPrediction {
  window: number;
  last_price: number;
  predicted_next_price: number;
}

export interface PTYTOptimizationResponse {
  coin_id: string;
  risk_profile: string;
  recommended_split: PTYTSplit;
  prediction: PTYTPrediction;
}

const API_BASE_URL = 'https://fastapi-on-render-0s0u.onrender.com';

export const getPTYTOptimization = async (
  inputs: PTYTOptimizationInputs
): Promise<PTYTOptimizationResponse> => {
  const requestBody = {
    coin_id: inputs.coin_id,
    ...(inputs.risk_profile && { risk_profile: inputs.risk_profile })
  };

  const response = await fetch(`${API_BASE_URL}/optimize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    if (response.status === 503) {
      throw new Error('Model not initialized. Please try again in a moment.');
    } else if (response.status === 422) {
      throw new Error('Insufficient historical data to make a prediction.');
    } else if (response.status === 500) {
      throw new Error('Internal prediction error. Please try again.');
    } else {
      throw new Error(`Failed to get PT/YT optimization: ${response.statusText}`);
    }
  }

  return response.json();
};

export const getPTYTOptimizationLocal = async (
  inputs: PTYTOptimizationInputs,
  localPort: number = 8000
): Promise<PTYTOptimizationResponse> => {
  const requestBody = {
    coin_id: inputs.coin_id,
    ...(inputs.risk_profile && { risk_profile: inputs.risk_profile })
  };

  const response = await fetch(`http://localhost:${localPort}/optimize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    if (response.status === 503) {
      throw new Error('Model not initialized. Please try again in a moment.');
    } else if (response.status === 422) {
      throw new Error('Insufficient historical data to make a prediction.');
    } else if (response.status === 500) {
      throw new Error('Internal prediction error. Please try again.');
    } else {
      throw new Error(`Failed to get PT/YT optimization: ${response.statusText}`);
    }
  }

  return response.json();
};