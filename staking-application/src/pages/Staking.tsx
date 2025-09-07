import React from 'react';
import { Lock, Unlock, TrendingUp, Clock, Award } from 'lucide-react';

const Staking: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Staking</h1>
        <button className="px-4 py-2 text-sm font-medium text-black bg-yellow-400 hover:bg-yellow-300 rounded-lg transition-all duration-200 shadow-lg hover:shadow-yellow-400/25">
          Stake Assets
        </button>
      </div>

      {/* Staking Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-400/20 rounded-xl border border-blue-400/30">
              <Lock className="w-6 h-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white/70">Total Staked</p>
              <p className="text-2xl font-bold text-white">$0.00</p>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-400/20 rounded-xl border border-green-400/30">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white/70">Total Rewards</p>
              <p className="text-2xl font-bold text-white">$0.00</p>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-400/20 rounded-xl border border-yellow-400/30">
              <Award className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white/70">APY</p>
              <p className="text-2xl font-bold text-white">0.00%</p>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-orange-400/20 rounded-xl border border-orange-400/30">
              <Clock className="w-6 h-6 text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white/70">Lock Period</p>
              <p className="text-2xl font-bold text-white">0 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Staking Pools */}
      <div className="glass rounded-xl border border-white/10">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Available Pools</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8 text-white/50">
            <Lock className="w-16 h-16 mx-auto mb-4 text-white/30" />
            <p>No staking pools available</p>
            <p className="text-sm mt-2 text-white/40">Connect your wallet to view available pools</p>
          </div>
        </div>
      </div>

      {/* Active Stakes */}
      <div className="glass rounded-xl border border-white/10">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Active Stakes</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8 text-white/50">
            <Unlock className="w-16 h-16 mx-auto mb-4 text-white/30" />
            <p>No active stakes</p>
            <p className="text-sm mt-2 text-white/40">Stake your assets to start earning rewards</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staking; 