import React, { useState } from 'react';
import { X, Brain, TrendingUp, Target, Zap, ArrowRight, ExternalLink, Split, Layers } from 'lucide-react';
import { useLPRecommendations } from '../../../hooks/useLPRecommendations';
import { usePTYTOptimization } from '../../../hooks/usePTYTOptimization';
import { useAptosPools } from '../../../hooks/useAptosPools';
import AptosPoolsDisplay from '../AptosPoolsDisplay';
import type { LPRecommendationInputs, PTYTOptimizationInputs } from '../../../api';

// Design System Colors
const colors = {
  primary: '#F5F02C', // Yellow
  secondary: '#FF9450', // Orange
  dark: '#000000', // Black
  light: '#FFFFFF', // White
};

interface AiInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AiInvestmentModal: React.FC<AiInvestmentModalProps> = ({ isOpen, onClose }) => {
  const [strategyType, setStrategyType] = useState<'lp' | 'ptyt' | null>(null);
  const [riskProfile, setRiskProfile] = useState('moderate');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [timeHorizon, setTimeHorizon] = useState('9months');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  
  const { 
    recommendations, 
    loading, 
    error, 
    fetchRecommendations, 
    getTopRecommendations 
  } = useLPRecommendations();

  const {
    optimization,
    loading: ptytLoading,
    error: ptytError,
    fetchOptimization,
    getSplitPercentages,
    getPriceChange
  } = usePTYTOptimization();

  const { 
    pools: aptosPools, 
    loading: aptosPoolsLoading, 
    error: aptosPoolsError 
  } = useAptosPools(5);

  const riskProfiles = [
    { id: 'conservative', label: 'Conservative', value: 1, description: 'Low risk, stable returns' },
    { id: 'moderate', label: 'Moderate', value: 2, description: 'Balanced risk and return' },
    { id: 'aggressive', label: 'Aggressive', value: 3, description: 'High risk, high potential' }
  ];

  const timeHorizons = [
    { id: '0months', label: '0m', value: 0, description: 'No lockup' },
    { id: '3months', label: '3m', value: 3, description: '3 months' },
    { id: '6months', label: '6m', value: 6, description: '6 months' },
    { id: '9months', label: '9m', value: 9, description: '9 months' },
    { id: '1year', label: '1y', value: 12, description: '1 year' }
  ];

  const handleAnalyze = async () => {
    if (!investmentAmount || !strategyType) return;

    setIsAnalyzing(true);
    
    try {
      if (strategyType === 'lp') {
        const inputs: LPRecommendationInputs = {
          amountUsd: parseFloat(investmentAmount) || 0,
          horizonMonths: parseInt(timeHorizon.replace(/\D/g, '')),
          riskTolerance: riskProfile as 'conservative' | 'moderate' | 'aggressive',
          topN: 2,
          chain: 'aptos',
          includeNarrative: true
        };
        
        await fetchRecommendations(inputs);
      } else if (strategyType === 'ptyt') {
        const inputs: PTYTOptimizationInputs = {
          coin_id: 'aptos', // APT CoinGecko ID
          risk_profile: riskProfile === 'moderate' ? undefined : riskProfile as 'conservative' | 'aggressive'
        };
        
        await fetchOptimization(inputs);
      }
      
      setShowResults(true);
    } catch (err) {
      console.error('Failed to analyze:', err);
    } finally {
    setIsAnalyzing(false);
    }
  };

  // Drag functionality for sliders
  const handleMouseMove = (e: MouseEvent, sliderType: 'risk' | 'time', trackElement: HTMLElement) => {
    if (!isDragging || isDragging !== sliderType) return;
    
    const rect = trackElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    
    if (sliderType === 'risk') {
      const index = Math.round(percentage * (riskProfiles.length - 1));
      const selectedProfile = riskProfiles[index];
      setRiskProfile(selectedProfile.id);
    } else {
      const index = Math.round(percentage * (timeHorizons.length - 1));
      const selectedHorizon = timeHorizons[index];
      setTimeHorizon(selectedHorizon.id);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  // Add global mouse event listeners when dragging
  React.useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => setIsDragging(null);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mouseleave', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        document.removeEventListener('mouseleave', handleGlobalMouseUp);
      };
    }
  }, [isDragging]);



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative glass p-6 rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-xl w-full transition-all duration-300 ${
        showResults ? 'max-w-4xl h-[80vh]' : 'max-w-lg'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg border" style={{ backgroundColor: `${colors.primary}20`, borderColor: `${colors.primary}50` }}>
              <Brain className="w-6 h-6" style={{ color: colors.primary }} />
            </div>
            <h2 className="text-xl font-semibold" style={{ color: colors.light }}>AI Investment Advisor</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!strategyType ? (
          /* Strategy Selection */
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${colors.primary}20` }}>
                <Brain className="w-8 h-8" style={{ color: colors.primary }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: colors.light }}>Choose Your Investment Strategy</h3>
              <p className="text-white/60">Select the type of AI-powered recommendation you'd like</p>
            </div>

            <div className="space-y-4">
              {/* LP Recommendations Option */}
              <button
                onClick={() => setStrategyType('lp')}
                className="w-full p-6 glass-hover rounded-xl border border-white/10 transition-all duration-200 text-left group"
                style={{ 
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${colors.primary}50`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg border transition-colors" style={{ 
                    backgroundColor: `${colors.primary}20`, 
                    borderColor: `${colors.primary}50` 
                  }}>
                    <Layers className="w-6 h-6" style={{ color: colors.primary }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold mb-2" style={{ color: colors.light }}>LP Pool Recommendations</h4>
                    <p className="text-white/60 text-sm mb-3">
                      Get AI-powered recommendations for the best liquidity pools based on your risk profile, 
                      investment amount, and time horizon.
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-white/50">
                      <span>• Pool Analysis</span>
                      <span>• Risk Assessment</span>
                      <span>• APY Optimization</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/40 transition-colors group-hover:text-yellow-400" />
                </div>
              </button>

              {/* PT/YT Split Option */}
              <button
                onClick={() => setStrategyType('ptyt')}
                className="w-full p-6 glass-hover rounded-xl border border-white/10 transition-all duration-200 text-left group"
                style={{ 
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${colors.secondary}50`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg border transition-colors" style={{ 
                    backgroundColor: `${colors.secondary}20`, 
                    borderColor: `${colors.secondary}50` 
                  }}>
                    <Split className="w-6 h-6" style={{ color: colors.secondary }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold mb-2" style={{ color: colors.light }}>PT/YT Split Optimization</h4>
                    <p className="text-white/60 text-sm mb-3">
                      Use LSTM-based forecasting to get optimal Principal Token (PT) and Yield Token (YT) 
                      allocation based on price predictions.
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-white/50">
                      <span>• LSTM Forecasting</span>
                      <span>• Price Prediction</span>
                      <span>• Optimal Split</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/40 transition-colors" style={{ 
                    color: 'rgba(255, 255, 255, 0.4)' 
                  }} />
                </div>
              </button>
            </div>
          </div>
        ) : !showResults ? (
          <>
            {/* Back Button */}
            <button
              onClick={() => setStrategyType(null)}
              className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors mb-4"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span className="text-sm">Back to Strategy Selection</span>
            </button>

            {/* Investment Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/70 mb-2">Investment Amount (USD)</label>
              <div className="relative">
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full px-4 py-3 glass border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-white/50 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 text-sm">
                  USD
                </div>
              </div>
            </div>

            {/* Risk Profile Slider */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-white/70">Risk Profile</label>
                <div className="text-right">
                  <div className="text-white font-medium">{riskProfiles.find(p => p.id === riskProfile)?.label}</div>
                  <div className="text-xs text-white/60">
                    {riskProfiles.find(p => p.id === riskProfile)?.description}
                  </div>
                </div>
              </div>
              
              {/* Slider Track */}
              <div className="relative py-2">
                {/* Background Track */}
                <div className="w-full h-2 bg-white/20 rounded-full"></div>
                
                {/* Progress Track */}
                <div 
                  className="absolute top-2 left-0 h-2 rounded-full transition-all duration-200"
                  style={{ 
                    width: `${(riskProfiles.findIndex(p => p.id === riskProfile) / (riskProfiles.length - 1)) * 100}%`,
                    backgroundColor: colors.primary
                  }}
                />
                
                {/* Clickable Track Area */}
                <div 
                  className="absolute top-0 left-0 w-full h-6 cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = x / rect.width;
                    const index = Math.round(percentage * (riskProfiles.length - 1));
                    const selectedProfile = riskProfiles[Math.max(0, Math.min(index, riskProfiles.length - 1))];
                    setRiskProfile(selectedProfile.id);
                  }}
                  onMouseMove={(e) => {
                    const trackElement = e.currentTarget;
                    handleMouseMove(e.nativeEvent, 'risk', trackElement);
                  }}
                />
                
                {/* Slider Markers */}
                {riskProfiles.map((profile, index) => {
                  const selectedIndex = riskProfiles.findIndex(p => p.id === riskProfile);
                  const isSelected = riskProfile === profile.id;
                  const isFilled = index <= selectedIndex;
                  
                  return (
                    <button
                      key={profile.id}
                      onClick={() => setRiskProfile(profile.id)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIsDragging('risk');
                        setRiskProfile(profile.id);
                      }}
                      className={`absolute top-1 transform -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all duration-200 z-10 cursor-grab active:cursor-grabbing ${
                        isDragging === 'risk' && isSelected ? 'scale-150' : ''
                      }`}
                      style={{
                        backgroundColor: isSelected || isFilled ? colors.primary : colors.light,
                        borderColor: isSelected || isFilled ? colors.primary : 'rgba(255, 255, 255, 0.6)',
                        transform: `translateX(-50%) ${isSelected ? 'scale(1.25)' : ''}`,
                        boxShadow: isSelected ? '0 4px 12px rgba(245, 240, 44, 0.3)' : 'none',
                        left: `${(index / (riskProfiles.length - 1)) * 100}%`
                      }}
                    />
                  );
                })}
                
                {/* Slider Labels */}
                <div className="flex justify-between mt-4">
                {riskProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => setRiskProfile(profile.id)}
                      className="text-xs text-center cursor-pointer transition-colors"
                      style={{
                        color: riskProfile === profile.id ? colors.primary : 'rgba(255, 255, 255, 0.6)',
                        fontWeight: riskProfile === profile.id ? '500' : '400'
                      }}
                    >
                      {profile.label}
                  </button>
                ))}
                </div>
              </div>
            </div>

            {/* Time Horizon Slider - Only for LP Strategy */}
            {strategyType === 'lp' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-white/70">Investment Time Horizon</label>
                <div className="text-right">
                  <div className="text-white font-medium">{timeHorizons.find(h => h.id === timeHorizon)?.label}</div>
                  <div className="text-xs text-white/60">
                    Lockup Ends: {(() => {
                      const months = timeHorizons.find(h => h.id === timeHorizon)?.value || 0;
                      const date = new Date();
                      date.setMonth(date.getMonth() + months);
                      return date.toLocaleDateString('en-US', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      });
                    })()}
                  </div>
                </div>
              </div>
              
              {/* Slider Track */}
              <div className="relative py-2">
                {/* Background Track */}
                <div className="w-full h-2 bg-white/20 rounded-full"></div>
                
                {/* Progress Track */}
                <div 
                  className="absolute top-2 left-0 h-2 rounded-full transition-all duration-200"
                  style={{ 
                    width: `${((timeHorizons.findIndex(h => h.id === timeHorizon)) / (timeHorizons.length - 1)) * 100}%`,
                    backgroundColor: colors.secondary
                  }}
                />
                
                {/* Clickable Track Area */}
                <div 
                  className="absolute top-0 left-0 w-full h-6 cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = x / rect.width;
                    const index = Math.round(percentage * (timeHorizons.length - 1));
                    const selectedHorizon = timeHorizons[Math.max(0, Math.min(index, timeHorizons.length - 1))];
                    setTimeHorizon(selectedHorizon.id);
                  }}
                  onMouseMove={(e) => {
                    const trackElement = e.currentTarget;
                    handleMouseMove(e.nativeEvent, 'time', trackElement);
                  }}
                />
                
                {/* Slider Markers */}
                {timeHorizons.map((horizon, index) => {
                  const selectedIndex = timeHorizons.findIndex(h => h.id === timeHorizon);
                  const isSelected = timeHorizon === horizon.id;
                  const isFilled = index <= selectedIndex;
                  
                  return (
                    <button
                      key={horizon.id}
                      onClick={() => setTimeHorizon(horizon.id)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIsDragging('time');
                        setTimeHorizon(horizon.id);
                      }}
                      className={`absolute top-1 transform -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all duration-200 z-10 cursor-grab active:cursor-grabbing ${
                        isDragging === 'time' && isSelected ? 'scale-150' : ''
                      }`}
                      style={{
                        backgroundColor: isSelected || isFilled ? colors.secondary : colors.light,
                        borderColor: isSelected || isFilled ? colors.secondary : 'rgba(255, 255, 255, 0.6)',
                        transform: `translateX(-50%) ${isSelected ? 'scale(1.25)' : ''}`,
                        boxShadow: isSelected ? '0 4px 12px rgba(255, 148, 80, 0.3)' : 'none',
                        left: `${(index / (timeHorizons.length - 1)) * 100}%`
                      }}
                    />
                  );
                })}
                
                {/* Slider Labels */}
                <div className="flex justify-between mt-4">
                {timeHorizons.map((horizon) => (
                  <button
                    key={horizon.id}
                    onClick={() => setTimeHorizon(horizon.id)}
                      className="text-xs text-center cursor-pointer transition-colors"
                      style={{
                        color: timeHorizon === horizon.id ? colors.secondary : 'rgba(255, 255, 255, 0.6)',
                        fontWeight: timeHorizon === horizon.id ? '500' : '400'
                      }}
                    >
                      {horizon.label}
                  </button>
                ))}
                </div>
              </div>
            </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !investmentAmount || parseFloat(investmentAmount) <= 0}
              className="w-full py-3 font-medium rounded-lg disabled:bg-gray-600 disabled:text-gray-400 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
              style={{
                backgroundColor: isAnalyzing || !investmentAmount || parseFloat(investmentAmount) <= 0 ? '#4B5563' : colors.primary,
                color: isAnalyzing || !investmentAmount || parseFloat(investmentAmount) <= 0 ? '#9CA3AF' : colors.dark,
                boxShadow: `0 4px 12px ${colors.primary}25`
              }}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>AI Analyzing...</span>
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  <span>
                    {strategyType === 'lp' ? 'Get LP Recommendations' : 'Get PT/YT Split'}
                  </span>
                </>
              )}
            </button>
          </>
        ) : (
          /* Results State */
          <div className="flex flex-col h-full">
            <div className="flex-shrink-0 space-y-6 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Investment Recommendation</h3>
              <p className="text-white/60">Based on your profile and market conditions</p>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {/* Strategy Results */}
            {strategyType === 'lp' ? (
              /* LP Recommendations */
            <div className="glass p-4 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">Top LP Recommendations</h4>
                  <button
                    onClick={() => window.location.href = '/trading'}
                    className="flex items-center space-x-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <span>View More Pools</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
                
                {loading ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-purple-400/20 border-t-purple-400 rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-white/60">Analyzing pools...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                ) : recommendations?.topN && recommendations.topN.length > 0 ? (
              <div className="space-y-3">
                    {getTopRecommendations(2).map((pool) => (
                      <div key={pool.pool} className="p-3 glass-hover rounded-lg border border-white/10 cursor-pointer hover:border-purple-400/30 transition-all duration-200">
                        <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                            <span className="text-white font-medium">{pool.symbol}</span>
                            <span className="text-xs text-white/60">({pool.project})</span>
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">{pool.chain}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-green-400 font-medium">+{pool.periodReturnPct.toFixed(2)}%</div>
                            <div className="text-xs text-white/60">{pool.horizonMonths}mo</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-white/60">APY:</span>
                            <span className="text-white">{pool.apy_net_estimate.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Profit:</span>
                            <span className="text-green-400">${pool.profitUsd.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">TVL:</span>
                            <span className="text-white">${(pool.tvlUsd / 1000000).toFixed(1)}M</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Score:</span>
                            <span className="text-white">{pool.Score.toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Risk:</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              pool.ilRisk === 'no' ? 'bg-green-500/20 text-green-300' : 
                              pool.ilRisk === 'low' ? 'bg-yellow-500/20 text-yellow-300' : 
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {pool.ilRisk.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Exposure:</span>
                            <span className="text-white capitalize">{pool.exposure}</span>
                          </div>
                        </div>
                        
                        {/* AI Explanation */}
                        {recommendations?.explanations && (
                          <div className="mt-3 p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                            <p className="text-xs text-purple-200 leading-relaxed">
                              {recommendations.explanations.find(exp => exp.pool === pool.pool)?.text || 'No explanation available.'}
                            </p>
                          </div>
                        )}
                        
                        <button
                          onClick={() => window.location.href = '/trading/sample-pool'}
                          className="w-full mt-2 py-2 px-3 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-lg hover:bg-purple-500/30 transition-all duration-200 flex items-center justify-center space-x-1"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-white/60">
                    <p className="text-sm">No recommendations available</p>
                  </div>
                )}
              </div>
            ) : (
              /* PT/YT Split Results */
              <div className="glass p-4 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">Optimal PT/YT Split</h4>
                  <div className="text-xs text-white/60">LSTM Forecast</div>
                </div>
                
                {ptytLoading ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-white/60">Running LSTM analysis...</p>
                  </div>
                ) : ptytError ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-red-400">{ptytError}</p>
                  </div>
                ) : optimization ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Split Visualization */}
                    <div className="p-6 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white/70 text-sm">Recommended Allocation</span>
                        <span className="text-white/70 text-sm">Risk: {optimization.risk_profile}</span>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                            <span className="text-white font-medium">Principal Token (PT)</span>
                          </div>
                          <span className="text-green-400 font-bold text-2xl">
                            {getSplitPercentages()?.PT}%
                          </span>
                        </div>
                        
                      <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                            <span className="text-white font-medium">Yield Token (YT)</span>
                          </div>
                          <span className="text-yellow-400 font-bold text-2xl">
                            {getSplitPercentages()?.YT}%
                          </span>
                        </div>
                        
                        {/* Visual Split Bar */}
                        <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full flex">
                            <div 
                              className="bg-green-400 transition-all duration-500"
                              style={{ width: `${getSplitPercentages()?.PT}%` }}
                            />
                            <div 
                              className="bg-yellow-400 transition-all duration-500"
                              style={{ width: `${getSplitPercentages()?.YT}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Investment Breakdown */}
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-white/60">PT Investment:</span>
                              <span className="text-green-400 font-medium">
                                ${((parseFloat(investmentAmount) || 0) * (getSplitPercentages()?.PT || 0) / 100).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">YT Investment:</span>
                              <span className="text-yellow-400 font-medium">
                                ${((parseFloat(investmentAmount) || 0) * (getSplitPercentages()?.YT || 0) / 100).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price Prediction */}
                    {(() => {
                      const priceChange = getPriceChange();
                      return priceChange ? (
                        <div className="p-6 bg-white/5 rounded-lg">
                          <h5 className="text-white font-medium mb-4">AVAX Price Forecast</h5>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center p-4 bg-white/5 rounded-lg">
                                <span className="text-white/60 text-sm block mb-1">Current Price</span>
                                <div className="text-white font-bold text-xl">${priceChange.current.toFixed(2)}</div>
                              </div>
                              <div className="text-center p-4 bg-white/5 rounded-lg">
                                <span className="text-white/60 text-sm block mb-1">Predicted Price</span>
                                <div className={`font-bold text-xl ${priceChange.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                  ${priceChange.predicted.toFixed(2)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-center p-4 bg-white/5 rounded-lg">
                              <span className="text-white/60 text-sm block mb-1">Expected Change</span>
                              <div className={`font-bold text-2xl ${priceChange.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                {priceChange.isPositive ? '+' : ''}{priceChange.changePercent.toFixed(2)}%
              </div>
            </div>
                            
                            {/* Model Info */}
                            <div className="mt-4 pt-4 border-t border-white/10">
                              <div className="text-xs text-white/50 space-y-1">
                                <div className="flex justify-between">
                                  <span>Model Window:</span>
                                  <span>{optimization.prediction.window} days</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Coin ID:</span>
                                  <span>{optimization.coin_id}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-4 text-white/60">
                    <p className="text-sm">No optimization data available</p>
                  </div>
                )}
              </div>
            )}

            {/* Aptos Pools Display */}
            <AptosPoolsDisplay 
              pools={aptosPools} 
              loading={aptosPoolsLoading} 
              error={aptosPoolsError} 
            />

            {/* Investment Strategy */}
            <div className="glass p-4 rounded-lg border border-white/10">
              <h4 className="font-medium text-white mb-3">Strategy Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/60">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span>Risk Profile: {riskProfiles.find(p => p.id === riskProfile)?.label}</span>
                </div>
                  {strategyType === 'lp' && (
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span>Time Horizon: {timeHorizons.find(h => h.id === timeHorizon)?.label}</span>
                </div>
                  )}
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span>Investment: ${investmentAmount}</span>
                </div>
              </div>
            </div>

            </div>

        
          </div>
        )}
      </div>
    </div>
  );
};

export default AiInvestmentModal; 