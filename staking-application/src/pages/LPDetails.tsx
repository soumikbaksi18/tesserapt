import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  BarChart3, 
  Shield, 
  Zap, 
  Target, 
  Clock,
  DollarSign,
  Percent,
  Activity,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useAptosTrading } from '../hooks/useAptosTrading';

// Design System Colors
const colors = {
  primary: '#00E6FF',   // Neon Cyan
  secondary: '#2D5BFF', // Royal Blue
  dark: '#04060F',      // Rich Black
  light: '#E6EDF7',     // Soft White-Blue
  muted: '#9BB0CE',     // Muted Blue-Gray
  border: '#1E2742',    // Subtle Navy Border
};

// Token Images from CoinGecko
const tokenImages = {
  APT: 'https://assets.coingecko.com/coins/images/26455/small/aptos_round.png',
  USDC: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
  USDT: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
  SUSDE: 'https://via.placeholder.com/32/10B981/FFFFFF?text=SUSDE',
  SBTC: 'https://via.placeholder.com/32/F59E0B/FFFFFF?text=SBTC',
  USDCE: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
};

const LPDetails: React.FC = () => {
  const navigate = useNavigate();
  const { poolId } = useParams<{ poolId: string }>();
  const [isInvesting, setIsInvesting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [componentError, setComponentError] = useState<string | null>(null);

  // Error boundary for component
  if (componentError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/trading')}
            className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Trading</span>
          </button>
        </div>
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">Component Error</p>
          <p className="text-white/60 mb-4">{componentError}</p>
          <button
            onClick={() => setComponentError(null)}
            className="px-4 py-2 bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] rounded-lg hover:bg-[var(--accent-cyan)]/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  const { 
    recommendations, 
    pools, 
    loading, 
    error, 
    isLiveData,
    fetchTradingData, 
    getRecommendationById, 
    getPoolById,
    getExplanationByPoolId
  } = useAptosTrading();

  // Get pool data from either recommendations or pools
  let pool, explanation;
  try {
    pool = poolId ? (getRecommendationById(poolId) || getPoolById(poolId)) : null;
    explanation = poolId ? getExplanationByPoolId(poolId) : null;
  } catch (error) {
    console.error('Error getting pool data:', error);
    setComponentError('Failed to load pool data');
    return null;
  }

  // Debug logging (can be removed in production)
  // console.log('LPDetails Debug:', { poolId, pool, explanation, recommendations: recommendations?.topN?.length, pools: pools?.results?.length, loading, error });

  const formatTVL = (tvl: number) => {
    if (!tvl || isNaN(tvl)) return '$0';
    if (tvl >= 1e9) return `$${(tvl / 1e9).toFixed(2)}B`;
    if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(2)}M`;
    if (tvl >= 1e3) return `$${(tvl / 1e3).toFixed(2)}K`;
    return `$${tvl.toFixed(0)}`;
  };

  const formatAPY = (apy: number) => {
    if (!apy || isNaN(apy)) return '0.00%';
    return `${apy.toFixed(2)}%`;
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

  const getTrendIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />;
  };

  const getTrendColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  // Remove automatic fetching - use dummy data by default
  // useEffect(() => {
  //   if (!pool && !loading) {
  //     fetchTradingData();
  //   }
  // }, [poolId, pool, loading, fetchTradingData]);

  // Error boundary effect
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Component error:', error);
      setComponentError('An error occurred while loading the page');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Component mount effect (can be removed in production)
  // useEffect(() => {
  //   console.log('LPDetails component mounted with poolId:', poolId);
  // }, [poolId]);

  // Mock transaction simulation
  const handleInvest = async () => {
    setIsInvesting(true);
    
    // Simulate transaction processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate mock transaction hash
    const mockTxHash = '0x' + Math.random().toString(16).substring(2, 66);
    setTxHash(mockTxHash);
    setShowSuccess(true);
    setIsInvesting(false);
  };

  const resetTransaction = () => {
    setTxHash(null);
    setShowSuccess(false);
  };



  const formatCurrency = (value: number) => {
    if (!value || isNaN(value)) return '$0.00';
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'text-green-400';
    if (conf >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/trading')}
            className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Trading</span>
          </button>
        </div>
        <div className="text-center py-12">
          <div className="w-12 h-12 border-2 border-[var(--accent-cyan)]/20 border-t-[var(--accent-cyan)] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading pool details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/trading')}
            className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Trading</span>
          </button>
        </div>
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => fetchTradingData()}
            className="px-4 py-2 bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] rounded-lg hover:bg-[var(--accent-cyan)]/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If no poolId provided, redirect to trading
  if (!poolId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/trading')}
            className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Trading</span>
          </button>
        </div>
        <div className="text-center py-12">
          <p className="text-white/60 mb-4">No pool ID provided</p>
          <button
            onClick={() => navigate('/trading')}
            className="px-4 py-2 bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] rounded-lg hover:bg-[var(--accent-cyan)]/30 transition-colors"
          >
            Go to Trading
          </button>
        </div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/trading')}
            className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Trading</span>
          </button>
        </div>
        <div className="text-center py-12">
          <p className="text-white/60 mb-4">Pool not found</p>
          <p className="text-white/40 text-sm mb-4">Pool ID: {poolId}</p>
          <button
            onClick={() => fetchTradingData()}
            className="px-4 py-2 bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] rounded-lg hover:bg-[var(--accent-cyan)]/30 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/trading')}
          className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Trading</span>
        </button>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => fetchTradingData()}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] rounded-lg hover:bg-[var(--accent-cyan)]/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
          <div className="flex items-center space-x-2 text-sm text-[var(--accent-cyan)]">
            <div className={`w-2 h-2 rounded-full ${isLiveData ? 'animate-pulse' : ''}`} style={{ backgroundColor: 'var(--accent-cyan)' }}></div>
            <span className="font-medium">
              {isLiveData ? 'Live Data' : 'Sample Data'}
            </span>
          </div>
        </div>
      </div>

      {/* Pool Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src={tokenImages[pool.symbol.split('-')[0] as keyof typeof tokenImages] || tokenImages.USDC} 
            alt={pool.symbol}
            className="w-12 h-12 rounded-full border-2 border-white/20"
            onError={(e) => {
              e.currentTarget.src = tokenImages.USDC;
            }}
          />
          <div>
            <h1 className="text-3xl font-bold" style={{ color: colors.light }}>{pool.symbol}</h1>
            <p className="text-white/60">{pool.project} • {pool.chain}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Pool Overview */}
        <div className="xl:col-span-2 space-y-6">
          {/* AI Explanation */}
          {explanation && (
            <div className="glass p-6 rounded-xl border border-white/10">
              <div className="flex items-center space-x-3 mb-4">
                <div 
                  className="p-2 rounded-lg border"
                  style={{
                    backgroundColor: `${colors.secondary}20`,
                    borderColor: `${colors.secondary}50`
                  }}
                >
                  <TrendingUp className="w-5 h-5" style={{ color: colors.secondary }} />
                </div>
                <h2 className="text-xl font-semibold text-white">AI Analysis</h2>
              </div>
              <p className="text-white/80 leading-relaxed">{explanation?.text || 'No explanation available'}</p>
            </div>
          )}

          {/* Pool Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div 
                  className="p-2 rounded-lg border"
                  style={{
                    backgroundColor: '#10B98120',
                    borderColor: '#10B98150'
                  }}
                >
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Expected Return</p>
                  <p className="text-xl font-bold text-green-400">+{(pool.periodReturnPct || 0).toFixed(2)}%</p>
                </div>
              </div>
            </div>

            <div className="glass p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div 
                  className="p-2 rounded-lg border"
                  style={{
                    backgroundColor: `${colors.primary}20`,
                    borderColor: `${colors.primary}50`
                  }}
                >
                  <Percent className="w-5 h-5" style={{ color: colors.primary }} />
                </div>
                <div>
                  <p className="text-sm text-white/60">Net APY</p>
                  <p className="text-xl font-bold" style={{ color: colors.primary }}>{(pool.apy_net_estimate || 0).toFixed(2)}%</p>
                </div>
              </div>
            </div>

            <div className="glass p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div 
                  className="p-2 rounded-lg border"
                  style={{
                    backgroundColor: `${colors.secondary}20`,
                    borderColor: `${colors.secondary}50`
                  }}
                >
                  <DollarSign className="w-5 h-5" style={{ color: colors.secondary }} />
                </div>
                <div>
                  <p className="text-sm text-white/60">Expected Profit</p>
                  <p className="text-xl font-bold" style={{ color: colors.secondary }}>{formatCurrency(pool.profitUsd)}</p>
                </div>
              </div>
            </div>

            <div className="glass p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div 
                  className="p-2 rounded-lg border"
                  style={{
                    backgroundColor: '#3B82F620',
                    borderColor: '#3B82F650'
                  }}
                >
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Pool Score</p>
                  <p className={`text-xl font-bold ${getScoreColor(pool.Score || 0)}`}>{(pool.Score || 0).toFixed(0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="glass p-6 rounded-xl border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Pool Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Total Value Locked</span>
                  <span className="text-white font-medium">{formatCurrency(pool.tvlUsd)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Current APY</span>
                  <span className="text-white font-medium">{(pool.apy_now || 0).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Risk-Adjusted Return</span>
                  <span className="text-white font-medium">{(pool.RAR || 0).toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">TOPSIS Score</span>
                  <span className="text-white font-medium">{((pool.topsisScore || 0) * 100).toFixed(2)}%</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Investment Amount</span>
                  <span className="text-white font-medium">${pool.amountStartUSD?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Expected Value</span>
                  <span className="text-white font-medium">${pool.amountEndUSD?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Downside Risk</span>
                  <span className="text-white font-medium">{((pool.downsidePeriod || 0) * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Confidence</span>
                  <span className={`font-medium ${getConfidenceColor(pool.conf || 0)}`}>
                    {((pool.conf || 0) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Analysis */}
          <div className="glass p-6 rounded-xl border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Risk Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">Exposure Type</p>
                    <p className="text-white/60 capitalize">{pool.exposure}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium">Impermanent Loss Risk</p>
                    <p className="text-white/60 capitalize">{pool.ilRisk}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">Style</p>
                    <p className="text-white/60 capitalize">{pool.why.style}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-white font-medium">TVL Score</p>
                    <p className="text-white/60">{((pool.why?.tvlScore || 0) * 100).toFixed(1)}%</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-white font-medium">IL Penalty</p>
                    <p className="text-white/60">{(pool.why?.ilPenaltyPctPts || 0).toFixed(2)}%</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">Time Horizon</p>
                    <p className="text-white/60">{pool.horizonMonths} months</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

            {/* Investment Status */}
            {isInvesting && (
              <div 
                className="glass p-6 rounded-xl border"
                style={{
                  borderColor: `${colors.primary}30`,
                  backgroundColor: `${colors.primary}10`
                }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div 
                    className="w-6 h-6 border-2 rounded-full animate-spin"
                    style={{
                      borderColor: `${colors.primary}20`,
                      borderTopColor: colors.primary
                    }}
                  ></div>
                  <h2 className="text-xl font-semibold" style={{ color: colors.primary }}>Processing Investment</h2>
                </div>
                <div className="space-y-3 text-white/80">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span style={{ color: colors.primary }}>Confirming on Avalanche</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pool:</span>
                    <span>{pool.symbol} ({pool.project})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected APY:</span>
                    <span className="text-green-400">{(pool.apy_net_estimate || 0).toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full animate-pulse" 
                      style={{ 
                        width: '60%',
                        backgroundColor: colors.primary
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-white/60 text-center">
                    This is a demo transaction. In production, this would interact with real smart contracts.
                  </p>
                </div>
              </div>
            )}
        </div>

        {/* Right Column - Actions & Info */}
        <div className="xl:col-span-1 space-y-6">
          {/* Quick Actions */}
          <div className="glass p-6 rounded-xl border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            
            {!showSuccess ? (
              <div className="space-y-3">
                <button 
                  onClick={handleInvest}
                  disabled={isInvesting}
                  className="w-full py-3 font-semibold rounded-xl disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                  style={{
                    backgroundColor: isInvesting ? '#4B5563' : colors.primary,
                    color: isInvesting ? '#9CA3AF' : colors.dark
                  }}
                >
                  {isInvesting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Invest in Pool</span>
                    </>
                  )}
                </button>
                <button 
                  className="w-full py-3 border font-medium rounded-xl transition-all duration-200"
                  style={{
                    borderColor: `${colors.secondary}50`,
                    color: colors.secondary,
                    backgroundColor: `${colors.secondary}10`
                  }}
                >
                  Add to Watchlist
                </button>
                <button className="w-full py-3 border border-white/20 text-white font-medium rounded-xl hover:bg-white/10 transition-all duration-200">
                  Share Pool
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center p-4 border rounded-xl" style={{
                  backgroundColor: '#10B98120',
                  borderColor: '#10B98150'
                }}>
                  <div className="text-green-400 text-2xl mb-2">✅</div>
                  <div className="text-green-400 font-medium mb-2">Investment Successful!</div>
                  <div className="text-white/60 text-sm mb-3">
                    You've successfully invested in the {pool.symbol} pool
                  </div>
                  <div className="bg-black/20 p-3 rounded-lg text-xs font-mono text-white/60 break-all border border-white/10">
                    {txHash}
                  </div>
                  <div className="mt-2 flex items-center justify-center space-x-2">
                    <p className="text-xs text-white/40">
                      Demo transaction hash
                    </p>
                    <ExternalLink className="w-3 h-3 text-white/40" />
                  </div>
                </div>
                <button 
                  onClick={resetTransaction}
                  className="w-full py-3 font-semibold rounded-xl transition-all duration-200"
                  style={{
                    backgroundColor: colors.secondary,
                    color: colors.dark
                  }}
                >
                  Make Another Investment
                </button>
              </div>
            )}
          </div>

          {/* Pool Information */}
          <div className="glass p-6 rounded-xl border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Pool Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Chain</span>
                <span className="text-white">{pool.chain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Protocol</span>
                <span className="text-white">{pool.project}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Token Symbol</span>
                <span className="text-white">{pool.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Pool ID</span>
                <span className="text-white font-mono text-xs">{pool.pool.slice(0, 8)}...</span>
              </div>
            </div>
          </div>

          {/* Underlying Tokens */}
          <div className="glass p-6 rounded-xl border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Underlying Tokens</h3>
            <div className="space-y-2">
              {pool.underlyingTokens.map((token: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 glass-hover rounded-lg">
                  <span className="text-white/60 text-sm">Token {index + 1}</span>
                  <span className="text-white font-mono text-xs">{token.slice(0, 10)}...</span>
                </div>
              ))}
            </div>
          </div>

          {/* Market Data */}
          <div className="glass p-6 rounded-xl border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Market Data</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Chain</span>
                <span className="text-white">{pool.chain || 'Aptos'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Throughput</span>
                <span className="text-white">{(pool.throughput || 0).toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Exposure</span>
                <span className="text-white">{pool.exposure || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LPDetails; 