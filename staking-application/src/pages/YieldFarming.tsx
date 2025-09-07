import React from 'react';
import { Sprout, TrendingUp, Clock, Zap, Coins } from 'lucide-react';

const colors = {
  primary: '#00E6FF',   // Neon Cyan
  secondary: '#2D5BFF', // Royal Blue
  light: '#E6EDF7',     // Soft White-Blue
  muted: '#9BB0CE',     // Muted Blue-Gray
  border: '#1E2742',    // Subtle Navy Border
};

const YieldFarming: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ color: colors.light }}>Yield Farming</h1>
        <button
          className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-[rgba(0,230,255,0.35)]"
          style={{
            backgroundColor: colors.primary,
            color: '#04060F',
            border: `1px solid ${colors.primary}60`,
          }}
        >
          Start Farming
        </button>
      </div>

      {/* Yield Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* TVL */}
        <div className="glass p-6 rounded-xl border transition-all duration-200 hover:bg-white/10"
             style={{ borderColor: colors.border }}>
          <div className="flex items-center">
            <div
              className="p-3 rounded-xl border"
              style={{ backgroundColor: `${colors.primary}20`, borderColor: `${colors.primary}40` }}
            >
              <Sprout className="w-6 h-6" style={{ color: colors.primary }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: colors.muted }}>Total Value Locked</p>
              <p className="text-2xl font-bold" style={{ color: colors.light }}>$0.00</p>
            </div>
          </div>
        </div>

        {/* Total Rewards */}
        <div className="glass p-6 rounded-xl border transition-all duration-200 hover:bg-white/10"
             style={{ borderColor: colors.border }}>
          <div className="flex items-center">
            <div
              className="p-3 rounded-xl border"
              style={{ backgroundColor: `${colors.secondary}20`, borderColor: `${colors.secondary}40` }}
            >
              <TrendingUp className="w-6 h-6" style={{ color: colors.secondary }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: colors.muted }}>Total Rewards</p>
              <p className="text-2xl font-bold" style={{ color: colors.light }}>$0.00</p>
            </div>
          </div>
        </div>

        {/* APY */}
        <div className="glass p-6 rounded-xl border transition-all duration-200 hover:bg-white/10"
             style={{ borderColor: colors.border }}>
          <div className="flex items-center">
            <div
              className="p-3 rounded-xl border"
              style={{ backgroundColor: `#19F0A820`, borderColor: `#19F0A840` }}
            >
              <Zap className="w-6 h-6" style={{ color: '#19F0A8' }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: colors.muted }}>APY</p>
              <p className="text-2xl font-bold" style={{ color: colors.light }}>0.00%</p>
            </div>
          </div>
        </div>

        {/* Harvest Time */}
        <div className="glass p-6 rounded-xl border transition-all duration-200 hover:bg-white/10"
             style={{ borderColor: colors.border }}>
          <div className="flex items-center">
            <div
              className="p-3 rounded-xl border"
              style={{ backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}35` }}
            >
              <Clock className="w-6 h-6" style={{ color: colors.primary }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: colors.muted }}>Harvest Time</p>
              <p className="text-2xl font-bold" style={{ color: colors.light }}>0h 0m</p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Farms */}
      <div className="glass rounded-xl border" style={{ borderColor: colors.border }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: colors.border }}>
          <h3 className="text-lg font-semibold" style={{ color: colors.light }}>Available Farms</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <Sprout className="w-16 h-16 mx-auto mb-4" style={{ color: `${colors.light}4D` }} />
            <p style={{ color: colors.muted }}>No yield farming pools available</p>
            <p className="text-sm mt-2" style={{ color: `${colors.muted}CC` }}>
              Connect your wallet to view available farms
            </p>
          </div>
        </div>
      </div>

      {/* Active Positions */}
      <div className="glass rounded-xl border" style={{ borderColor: colors.border }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: colors.border }}>
          <h3 className="text-lg font-semibold" style={{ color: colors.light }}>Active Positions</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <Coins className="w-16 h-16 mx-auto mb-4" style={{ color: `${colors.light}4D` }} />
            <p style={{ color: colors.muted }}>No active farming positions</p>
            <p className="text-sm mt-2" style={{ color: `${colors.muted}CC` }}>Start farming to earn rewards</p>
          </div>
        </div>
      </div>

      {/* Rewards History */}
      <div className="glass p-6 rounded-xl border" style={{ borderColor: colors.border }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.light }}>Rewards History</h3>
        <div className="text-center py-8">
          <p style={{ color: colors.muted }}>Rewards history will be displayed here</p>
        </div>
      </div>
    </div>
  );
};

export default YieldFarming;
