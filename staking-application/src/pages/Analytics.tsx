import React from 'react';
import { BarChart3, TrendingUp, PieChart, Activity, Target } from 'lucide-react';

const colors = {
  primary: '#00E6FF',   // Neon Cyan
  secondary: '#2D5BFF', // Royal Blue
  light: '#E6EDF7',     // Soft White-Blue
  muted: '#9BB0CE',     // Muted Blue-Gray
  border: '#1E2742',    // Subtle Navy Border
};

const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ color: colors.light }}>Analytics</h1>
        <div className="flex space-x-2">
          {['7D', '30D', '1Y'].map((label) => (
            <button
              key={label}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 glass"
              style={{
                color: colors.muted,
                border: `1px solid ${colors.border}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Return */}
        <div className="glass p-6 rounded-xl border transition-all duration-200 hover:bg-white/5"
             style={{ borderColor: colors.border }}>
          <div className="flex items-center">
            <div
              className="p-3 rounded-xl border"
              style={{ backgroundColor: `${colors.primary}20`, borderColor: `${colors.primary}40` }}
            >
              <TrendingUp className="w-6 h-6" style={{ color: colors.primary }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: colors.muted }}>Total Return</p>
              <p className="text-2xl font-bold" style={{ color: colors.light }}>0.00%</p>
            </div>
          </div>
        </div>

        {/* Sharpe Ratio */}
        <div className="glass p-6 rounded-xl border transition-all duration-200 hover:bg-white/5"
             style={{ borderColor: colors.border }}>
          <div className="flex items-center">
            <div
              className="p-3 rounded-xl border"
              style={{ backgroundColor: `${colors.secondary}20`, borderColor: `${colors.secondary}40` }}
            >
              <Target className="w-6 h-6" style={{ color: colors.secondary }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: colors.muted }}>Sharpe Ratio</p>
              <p className="text-2xl font-bold" style={{ color: colors.light }}>0.00</p>
            </div>
          </div>
        </div>

        {/* Volatility */}
        <div className="glass p-6 rounded-xl border transition-all duration-200 hover:bg-white/5"
             style={{ borderColor: colors.border }}>
          <div className="flex items-center">
            <div
              className="p-3 rounded-xl border"
              style={{ backgroundColor: '#19F0A820', borderColor: '#19F0A840' }}
            >
              <Activity className="w-6 h-6" style={{ color: '#19F0A8' }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: colors.muted }}>Volatility</p>
              <p className="text-2xl font-bold" style={{ color: colors.light }}>0.00%</p>
            </div>
          </div>
        </div>

        {/* Max Drawdown */}
        <div className="glass p-6 rounded-xl border transition-all duration-200 hover:bg-white/5"
             style={{ borderColor: colors.border }}>
          <div className="flex items-center">
            <div
              className="p-3 rounded-xl border"
              style={{ backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}35` }}
            >
              <BarChart3 className="w-6 h-6" style={{ color: colors.primary }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: colors.muted }}>Max Drawdown</p>
              <p className="text-2xl font-bold" style={{ color: colors.light }}>0.00%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="glass p-6 rounded-xl border" style={{ borderColor: colors.border }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.light }}>Performance Over Time</h3>
        <div className="text-center py-16">
          <BarChart3 className="w-16 h-16 mx-auto mb-4" style={{ color: `${colors.light}4D` }} />
          <p style={{ color: colors.muted }}>Performance chart will be displayed here</p>
        </div>
      </div>

      {/* Asset Allocation & Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-xl border" style={{ borderColor: colors.border }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.light }}>Asset Allocation</h3>
          <div className="text-center py-8">
            <PieChart className="w-16 h-16 mx-auto mb-4" style={{ color: `${colors.light}4D` }} />
            <p style={{ color: colors.muted }}>Asset allocation chart will be displayed here</p>
          </div>
        </div>

        <div className="glass p-6 rounded-xl border" style={{ borderColor: colors.border }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.light }}>Risk Analysis</h3>
          <div className="text-center py-8">
            <Target className="w-16 h-16 mx-auto mb-4" style={{ color: `${colors.light}4D` }} />
            <p style={{ color: colors.muted }}>Risk analysis will be displayed here</p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="glass rounded-xl border" style={{ borderColor: colors.border }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: colors.border }}>
          <h3 className="text-lg font-semibold" style={{ color: colors.light }}>Transaction History</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <Activity className="w-16 h-16 mx-auto mb-4" style={{ color: `${colors.light}4D` }} />
            <p style={{ color: colors.muted }}>No transactions found</p>
            <p className="text-sm mt-2" style={{ color: `${colors.muted}CC` }}>Connect your wallet to view transaction history</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
