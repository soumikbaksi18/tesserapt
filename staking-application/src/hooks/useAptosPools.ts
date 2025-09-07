import { useState, useEffect } from 'react';
import { getAptosPools } from '../api/aptospools';
import type { AptosPool, AptosPoolsResponse } from '../api/aptospools';

export const useAptosPools = (limit: number = 5) => {
  const [pools, setPools] = useState<AptosPool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPools = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result: AptosPoolsResponse = await getAptosPools(limit);
      setPools(result.results);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch Aptos pools';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTopPools = () => {
    return pools
      .sort((a, b) => b.tvlUsd - a.tvlUsd)
      .slice(0, limit);
  };

  const getHighestAPYPools = () => {
    return pools
      .sort((a, b) => b.apy - a.apy)
      .slice(0, limit);
  };

  const getStablecoinPools = () => {
    return pools.filter(pool => pool.stablecoin);
  };

  const getNonStablecoinPools = () => {
    return pools.filter(pool => !pool.stablecoin);
  };

  const getPoolsByProject = (project: string) => {
    return pools.filter(pool => pool.project === project);
  };

  const getTotalTVL = () => {
    return pools.reduce((total, pool) => total + pool.tvlUsd, 0);
  };

  const getAverageAPY = () => {
    if (pools.length === 0) return 0;
    return pools.reduce((total, pool) => total + pool.apy, 0) / pools.length;
  };

  useEffect(() => {
    fetchPools();
  }, [limit]);

  return {
    pools,
    loading,
    error,
    fetchPools,
    getTopPools,
    getHighestAPYPools,
    getStablecoinPools,
    getNonStablecoinPools,
    getPoolsByProject,
    getTotalTVL,
    getAverageAPY
  };
};
