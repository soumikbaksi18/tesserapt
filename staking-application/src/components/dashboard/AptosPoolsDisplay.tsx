import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Shield, AlertTriangle } from 'lucide-react';
import type { AptosPool } from '../../api/aptospools';

interface AptosPoolsDisplayProps {
  pools: AptosPool[];
  loading: boolean;
  error: string | null;
}

const AptosPoolsDisplay: React.FC<AptosPoolsDisplayProps> = ({ pools, loading, error }) => {
  const formatTVL = (tvl: number) => {
    if (tvl >= 1e9) return `$${(tvl / 1e9).toFixed(2)}B`;
    if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(2)}M`;
    if (tvl >= 1e3) return `$${(tvl / 1e3).toFixed(2)}K`;
    return `$${tvl.toFixed(2)}`;
  };

  const formatAPY = (apy: number) => {
    return `${apy.toFixed(2)}%`;
  };

  const getAPYChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <div className="w-4 h-4" />;
  };

  const getAPYChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getRiskColor = (ilRisk: string) => {
    switch (ilRisk.toLowerCase()) {
      case 'no': return 'text-green-400';
      case 'low': return 'text-yellow-400';
      case 'medium': return 'text-orange-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getPredictionColor = (probability: number) => {
    if (probability >= 70) return 'text-green-400';
    if (probability >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">🪙 Top Aptos Pools</h3>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass p-4 rounded-lg border border-white/10 animate-pulse">
              <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">🪙 Top Aptos Pools</h3>
        <div className="glass p-4 rounded-lg border border-red-500/30 bg-red-500/10">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Error loading pools</span>
          </div>
          <p className="text-red-300 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (pools.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">🪙 Top Aptos Pools</h3>
        <div className="glass p-4 rounded-lg border border-white/10">
          <p className="text-gray-400 text-center">No pools data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">🪙 Top Aptos Pools</h3>
      <div className="grid gap-4">
        {pools.slice(0, 5).map((pool, index) => (
          <div key={pool.pool} className="glass p-4 rounded-lg border border-white/10 hover:border-[var(--accent-cyan)]/40 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">#{index + 1}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">{pool.symbol}</h4>
                  <p className="text-sm text-gray-400 capitalize">{pool.project}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-[var(--accent-cyan)]">
                  {formatAPY(pool.apy)}
                </div>
                <div className="text-xs text-gray-400">APY</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-white">{formatTVL(pool.tvlUsd)}</div>
                  <div className="text-xs text-gray-400">TVL</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <div>
                  <div className={`text-sm font-medium ${getRiskColor(pool.ilRisk)}`}>
                    {pool.ilRisk.toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-400">IL Risk</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center">
                <div className={`text-xs font-medium ${getAPYChangeColor(pool.apyPct1D)}`}>
                  {pool.apyPct1D > 0 ? '+' : ''}{pool.apyPct1D.toFixed(2)}%
                </div>
                <div className="text-xs text-gray-400">1D</div>
              </div>
              <div className="text-center">
                <div className={`text-xs font-medium ${getAPYChangeColor(pool.apyPct7D)}`}>
                  {pool.apyPct7D > 0 ? '+' : ''}{pool.apyPct7D.toFixed(2)}%
                </div>
                <div className="text-xs text-gray-400">7D</div>
              </div>
              <div className="text-center">
                <div className={`text-xs font-medium ${getAPYChangeColor(pool.apyPct30D)}`}>
                  {pool.apyPct30D > 0 ? '+' : ''}{pool.apyPct30D.toFixed(2)}%
                </div>
                <div className="text-xs text-gray-400">30D</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Prediction:</span>
                <span className={`text-xs font-medium ${getPredictionColor(pool.predictions.predictedProbability)}`}>
                  {pool.predictions.predictedClass}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                {pool.predictions.predictedProbability}% confidence
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AptosPoolsDisplay;
