import React, { useState } from 'react';
import { Package, TrendingUp, BarChart3, Coins, Brain } from 'lucide-react';
import { usePetraWallet } from '@/contexts/PetraWalletContext';
import { useNavigate } from 'react-router-dom';
import AiInvestmentModal from './modals/AiInvestmentModal';

const AptosQuickActions: React.FC = () => {
  const { walletAddress } = usePetraWallet();
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const actions = [
    {
      id: 'staking',
      title: 'Stake APT',
      description: 'Stake your APT tokens for rewards',
      icon: Package,
      testId: 'qa-staking',
      route: '/staking'
    },
    {
      id: 'ai-investment',
      title: 'AI Investment',
      description: 'Get AI-powered investment advice',
      icon: Brain,
      testId: 'qa-ai',
      modal: 'ai'
    },
    {
      id: 'trading',
      title: 'Trading',
      description: 'Trade APT and other tokens',
      icon: TrendingUp,
      testId: 'qa-trading',
      route: '/trading'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View your portfolio analytics',
      icon: BarChart3,
      testId: 'qa-analytics',
      route: '/analytics'
    },
    {
      id: 'faucet',
      title: 'Faucet',
      description: 'Get test tokens for development',
      icon: Coins,
      testId: 'qa-faucet',
      route: '/faucet'
    }
  ];

  const handleAction = (action: any) => {
    if (action.modal) {
      setActiveModal(action.modal);
    } else if (action.route) {
      navigate(action.route);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const isWalletConnected = !!walletAddress;

  return (
    <>
      <div className="glass p-6 rounded-xl border border-white/10">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h3>
        <div className="space-y-3">
          {actions.map((action) => (
            <button
              key={action.id}
              data-testid={action.testId}
              onClick={() => handleAction(action)}
              disabled={!isWalletConnected}
              className={`w-full text-left p-4 glass-hover border border-white/10 rounded-lg transition-all duration-200 group ${
                isWalletConnected 
                  ? 'hover:border-[var(--accent-cyan)]/40 cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  isWalletConnected 
                    ? 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]' 
                    : 'bg-white/5 text-white/30'
                }`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-sm text-[var(--text-muted)]">
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {!isWalletConnected && (
          <div className="mt-4 p-3 bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/30 rounded-lg">
            <p className="text-sm text-[var(--accent-cyan)] text-center">
              Connect your Petra wallet to use Quick Actions
            </p>
          </div>
        )}
      </div>

      {/* AI Investment Modal */}
      {activeModal === 'ai' && (
        <AiInvestmentModal isOpen={true} onClose={closeModal} />
      )}
    </>
  );
};

export default AptosQuickActions;
