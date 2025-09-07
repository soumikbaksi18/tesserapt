import React from 'react';
import { PieChart, TrendingUp, Eye } from 'lucide-react';

const Portfolio: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Portfolio</h1>
        <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white/80 glass hover:bg-white/10 rounded-lg transition-all duration-200 border border-white/20">
          <Eye className="w-4 h-4" />
          <span>Hide Balances</span>
        </button>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6 rounded-xl border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Portfolio Value</h3>
          <div className="text-center py-8">
            <div className="text-4xl font-bold text-white mb-2">$0.00</div>
            <div className="flex items-center justify-center space-x-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400">+0.00%</span>
              <span className="text-white/60">24h</span>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Allocation</h3>
          <div className="text-center py-8 text-white/50">
            <PieChart className="w-16 h-16 mx-auto mb-4 text-white/30" />
            <p>No assets in portfolio</p>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="glass rounded-xl border border-white/10">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Assets</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8 text-white/50">
            <p>No assets found</p>
            <p className="text-sm mt-2 text-white/40">Connect your wallet to view your portfolio</p>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="glass p-6 rounded-xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
        <div className="text-center py-8 text-white/50">
          <p>Performance chart will be displayed here</p>
        </div>
      </div>
    </div>
  );
};

export default Portfolio; 