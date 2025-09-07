import { useState, useEffect } from 'react';
import { getLPRecommendations } from '../api/lprecommendations';
import { getAptosPools } from '../api/aptospools';
import { dummyLPRecommendations, dummyAptosPools } from '../data/aptosDummyData';
import type { LPRecommendationInputs, LPRecommendationResponse } from '../api/lprecommendations';
import type { AptosPoolsResponse } from '../api/aptospools';

export interface AptosTradingData {
  recommendations: LPRecommendationResponse | null;
  pools: AptosPoolsResponse | null;
  loading: boolean;
  error: string | null;
  isLiveData: boolean;
}

export const useAptosTrading = () => {
  const [data, setData] = useState<AptosTradingData>({
    recommendations: dummyLPRecommendations,
    pools: dummyAptosPools,
    loading: false,
    error: null,
    isLiveData: false
  });

  // Debug logging (can be removed in production)
  // console.log('useAptosTrading initialized with:', { recommendationsCount: data.recommendations?.topN?.length, poolsCount: data.pools?.results?.length, isLiveData: data.isLiveData });

  const fetchTradingData = async (amountUsd: number = 500, riskTolerance: 'conservative' | 'moderate' | 'aggressive' = 'moderate') => {
    setData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Fetch LP recommendations
      const recommendationsInput: LPRecommendationInputs = {
        amountUsd,
        horizonMonths: 6,
        riskTolerance,
        topN: 5,
        chain: 'aptos',
        includeNarrative: true
      };

      const [recommendations, pools] = await Promise.all([
        getLPRecommendations(recommendationsInput),
        getAptosPools(10)
      ]);

      setData({
        recommendations,
        pools,
        loading: false,
        error: null,
        isLiveData: true
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch trading data';
      setData(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  };

  const getTopRecommendations = (count: number = 5) => {
    if (!data.recommendations?.topN) return [];
    return data.recommendations.topN.slice(0, count);
  };

  const getTopPools = (count: number = 10) => {
    if (!data.pools?.results) return [];
    return data.pools.results.slice(0, count);
  };

  const getRecommendationById = (poolId: string) => {
    if (!data.recommendations?.topN) {
      return null;
    }
    return data.recommendations.topN.find(pool => pool.pool === poolId);
  };

  const getPoolById = (poolId: string) => {
    if (!data.pools?.results) return null;
    return data.pools.results.find(pool => pool.pool === poolId);
  };

  const getExplanationByPoolId = (poolId: string) => {
    if (!data.recommendations?.explanations) return null;
    return data.recommendations.explanations.find(exp => exp.pool === poolId);
  };

  // Remove automatic fetching on mount - use dummy data by default
  // useEffect(() => {
  //   fetchTradingData();
  // }, []);

  return {
    ...data,
    fetchTradingData,
    getTopRecommendations,
    getTopPools,
    getRecommendationById,
    getPoolById,
    getExplanationByPoolId
  };
};
