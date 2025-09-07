import React, { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Brain, ArrowRight, Target, ExternalLink, RefreshCw } from 'lucide-react';
import { useAptosTrading } from '../hooks/useAptosTrading';
import { useNavigate } from 'react-router-dom';

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

const Trading: React.FC = () => {
  const [activeTab, setActiveTab] = useState('live-markets');
  const navigate = useNavigate();
  const { 
    recommendations, 
    pools, 
    loading, 
    error, 
    isLiveData,
    fetchTradingData, 
    getTopRecommendations, 
    getTopPools 
  } = useAptosTrading();

  const formatTVL = (tvl: number) => {
    if (tvl >= 1e9) return `$${(tvl / 1e9).toFixed(1)}B`;
    if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(1)}M`;
    if (tvl >= 1e3) return `$${(tvl / 1e3).toFixed(1)}K`;
    return `$${tvl.toFixed(0)}`;
  };

  const formatAPY = (apy: number) => {
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

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="p-3 rounded-2xl border"
            style={{
              backgroundColor: `${colors.primary}20`,
              borderColor: `${colors.primary}50`
            }}
          >
            <TrendingUp className="w-8 h-8" style={{ color: colors.primary }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: colors.light }}>Trading Hub</h1>
            <p className="text-sm text-white/70">
              Discover AI-powered investment opportunities and trade on live markets
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => fetchTradingData()}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] rounded-lg hover:bg-[var(--accent-cyan)]/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
          <div className="flex items-center space-x-2 text-sm" style={{ color: colors.primary }}>
            <div className={`w-2 h-2 rounded-full ${isLiveData ? 'animate-pulse' : ''}`} style={{ backgroundColor: colors.primary }}></div>
            <span className="font-medium">
              {isLiveData ? 'Live Aptos Data' : 'Sample Aptos Data'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Trading Interface - Equal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Recommendations - Left Side */}
        <div className="space-y-6">
          {/* AI Recommendations Panel */}
          <div className="glass p-6 rounded-xl border border-white/10">
            <div className="flex items-center space-x-3 mb-6">
              <div 
                className="p-2 rounded-lg border"
                style={{
                  backgroundColor: `${colors.secondary}20`,
                  borderColor: `${colors.secondary}50`
                }}
              >
                <Brain className="w-5 h-5" style={{ color: colors.secondary }} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">AI Recommendations</h2>
                <p className="text-sm text-white/60">Personalized investment insights</p>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-[var(--accent-cyan)]/20 border-t-[var(--accent-cyan)] rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-sm text-white/60">Loading Aptos recommendations...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-sm text-red-400 mb-4">{error}</p>
                  <button
                    onClick={() => fetchTradingData()}
                    className="px-4 py-2 bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] rounded-lg hover:bg-[var(--accent-cyan)]/30 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : getTopRecommendations(3).map((rec) => (
                <div key={rec.pool} className="p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200" style={{
                  backgroundColor: rec.periodReturnPct > 0 ? '#10B98110' : '#ffffff05'
                }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <img 
                          src={tokenImages[rec.symbol.split('-')[0] as keyof typeof tokenImages] || tokenImages.USDC} 
                          alt={rec.symbol}
                          className="w-6 h-6 rounded-full"
                          onError={(e) => {
                            e.currentTarget.src = tokenImages.USDC;
                          }}
                        />
                        <div>
                          <div className="font-semibold text-white text-sm">{rec.symbol}</div>
                          <div className="text-xs text-white/60 capitalize">{rec.project}</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getTrendColor(rec.periodReturnPct)}`}>
                        {rec.periodReturnPct > 0 ? '+' : ''}{rec.periodReturnPct.toFixed(2)}%
                      </div>
                      <div className="text-xs text-white/60">{rec.horizonMonths}mo</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">APY:</span>
                      <span className="text-white font-medium">{formatAPY(rec.apy_net_estimate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Profit:</span>
                      <span className="text-green-400 font-medium">${rec.profitUsd.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">TVL:</span>
                      <span className="text-white font-medium">{formatTVL(rec.tvlUsd)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Score:</span>
                      <span className="text-white font-medium">{rec.Score.toFixed(0)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className={`text-xs px-2 py-1 rounded-full ${getRiskColor(rec.ilRisk)}`}>
                      {rec.ilRisk.toUpperCase()} Risk
                    </div>
                    <button 
                      onClick={() => navigate(`/lp-details/${rec.pool}`)}
                      className="text-xs font-medium px-3 py-1 rounded-lg transition-all duration-200"
                      style={{
                        backgroundColor: `${colors.primary}20`,
                        color: colors.primary,
                        border: `1px solid ${colors.primary}50`
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Get More Recommendations */}
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full py-3 mt-4 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
              style={{
                backgroundColor: colors.primary,
                color: colors.dark
              }}
            >
              <Brain className="w-5 h-5" />
              <span>Get AI Analysis</span>
            </button>
          </div>
        </div>

        {/* Live Markets - Right Side */}
        <div>
          <div className="glass p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div 
                  className="p-2 rounded-lg border"
                  style={{
                    backgroundColor: `${colors.primary}20`,
                    borderColor: `${colors.primary}50`
                  }}
                >
                  <BarChart3 className="w-5 h-5" style={{ color: colors.primary }} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Live Markets</h2>
                  <p className="text-sm text-white/60">Real-time trading pairs</p>
                </div>
              </div>
              <div className="flex space-x-0.5">
                {['live-markets', 'order-book', 'trade-history'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === tab
                        ? 'shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    style={{
                      backgroundColor: activeTab === tab ? colors.primary : 'transparent',
                      color: activeTab === tab ? colors.dark : undefined
                    }}
                  >
                    {tab === 'live-markets' && 'Live Markets'}
             
                    {tab === 'trade-history' && 'Trade History'}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'live-markets' && (
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-[var(--accent-cyan)]/20 border-t-[var(--accent-cyan)] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-white/60">Loading Aptos pools...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-red-400 mb-4">{error}</p>
                    <button
                      onClick={() => fetchTradingData()}
                      className="px-4 py-2 bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] rounded-lg hover:bg-[var(--accent-cyan)]/30 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : getTopPools(5).map((pool) => (
                  <div key={pool.pool} className="p-4 rounded-xl border border-white/10 hover:border-white/20 cursor-pointer transition-all duration-200" style={{
                    backgroundColor: pool.apyPct1D > 0 ? '#10B98108' : '#EF444408'
                  }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Token Images */}
                        <div className="flex items-center -space-x-2">
                          <img 
                            src={tokenImages[pool.symbol.split('-')[0] as keyof typeof tokenImages] || tokenImages.USDC} 
                            alt={pool.symbol}
                            className="w-8 h-8 rounded-full border-2 border-white/20"
                            onError={(e) => {
                              e.currentTarget.src = tokenImages.USDC;
                            }}
                          />
                          <img 
                            src={tokenImages.USDC} 
                            alt="USDC"
                            className="w-8 h-8 rounded-full border-2 border-white/20"
                            onError={(e) => {
                              e.currentTarget.src = tokenImages.USDC;
                            }}
                          />
                        </div>
                        
                        {/* Market Info */}
                        <div>
                          <div className="font-semibold text-white">{pool.symbol}</div>
                          <div className="text-sm text-white/60 capitalize">{pool.project} • {pool.chain}</div>
                        </div>
                      </div>

                      {/* Price and Stats */}
                      <div className="text-right space-y-1">
                        <div className="font-semibold text-white text-lg">{formatAPY(pool.apy)}</div>
                        <div className={`text-sm flex items-center justify-end space-x-1 ${getTrendColor(pool.apyPct1D)}`}>
                          {getTrendIcon(pool.apyPct1D)}
                          <span>{pool.apyPct1D > 0 ? '+' : ''}{pool.apyPct1D.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Market Data */}
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-white/60">TVL</div>
                          <div className="text-white font-medium">{formatTVL(pool.tvlUsd)}</div>
                        </div>
                        <div>
                          <div className="text-white/60">Risk</div>
                          <div className={`font-medium ${getRiskColor(pool.ilRisk)}`}>{pool.ilRisk.toUpperCase()}</div>
                        </div>
                        <div className="text-right">
                          <button 
                            onClick={() => navigate(`/lp-details/${pool.pool}`)}
                            className="text-xs font-medium px-3 py-1 rounded-lg transition-all duration-200"
                            style={{
                              backgroundColor: `${colors.primary}20`,
                              color: colors.primary,
                              border: `1px solid ${colors.primary}50`
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'order-book' && (
              <div className="space-y-4">
                <div className="text-center py-12 text-white/60">
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl border flex items-center justify-center"
                    style={{
                      backgroundColor: `${colors.primary}10`,
                      borderColor: `${colors.primary}30`
                    }}
                  >
                    <BarChart3 className="w-8 h-8" style={{ color: colors.primary }} />
                  </div>
                
                  <p className="text-sm">Real-time order book data will be displayed here</p>
                </div>
              </div>
            )}

            {activeTab === 'trade-history' && (
              <div className="space-y-4">
                <div className="text-center py-12 text-white/60">
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl border flex items-center justify-center"
                    style={{
                      backgroundColor: `${colors.secondary}10`,
                      borderColor: `${colors.secondary}30`
                    }}
                  >
                    <TrendingUp className="w-8 h-8" style={{ color: colors.secondary }} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Trade History</h3>
                  <p className="text-sm">Recent trading activity will be displayed here</p>
                </div>
              </div>
            )}

            {/* View All Markets Button */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <button 
                className="w-full py-3 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                style={{
                  backgroundColor: `${colors.secondary}20`,
                  color: colors.secondary,
                  border: `1px solid ${colors.secondary}50`
                }}
              >
                <Target className="w-5 h-5" />
                <span>Explore All Markets</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trading; 