import React from 'react';
import AptosBalanceCards from '@/components/dashboard/AptosBalanceCards';
import AptosQuickActions from '@/components/dashboard/AptosQuickActions';

// Design System Colors
const colors = {
  primary: '#F5F02C', // Yellow
  secondary: '#FF9450', // Orange
  dark: '#000000', // Black
  light: '#FFFFFF', // White
};

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ color: colors.light }}>Dashboard</h1>
        <div className="text-sm text-white/60">Last updated: Just now</div>
      </div>

      {/* Balance Cards */}
      <AptosBalanceCards />

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-xl border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="text-center py-8 text-white/50">
            <p>No recent activity</p>
          </div>
        </div>

        <AptosQuickActions />
      </div>
    </div>
  );
};

export default Dashboard; 