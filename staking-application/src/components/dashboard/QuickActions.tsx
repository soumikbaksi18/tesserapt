import React, { useState } from 'react';
import { Package, Scissors, Brain, Droplets } from 'lucide-react';
import { usePetraWallet } from '@/contexts/PetraWalletContext';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../ErrorBoundary';

const QuickActions: React.FC = () => {
  const { walletAddress } = usePetraWallet();
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const actions = [
    {
      id: 'wrap',
      title: 'Wrap Tokens',
      description: 'Wrap tokens into standardized format',
      icon: Package,
      testId: 'qa-wrap',
      modal: 'wrap'
    },
    {
      id: 'split',
      title: 'Split Tokens',
      description: 'Split SY tokens into PT + YT',
      icon: Scissors,
      testId: 'qa-split',
      modal: 'split'
    },
    {
      id: 'ai',
      title: 'AI Investment',
      description: 'Get AI-powered investment advice',
      icon: Brain,
      testId: 'qa-ai',
      modal: 'ai'
    },
    {
      id: 'faucet',
      title: 'Faucet',
      description: 'Get test tokens for development',
      icon: Droplets,
      testId: 'qa-faucet',
      action: 'navigate'
    }
  ];

  const openModal = (action: any) => {
    if (action.action === 'navigate') {
      navigate('/faucet');
    } else if (action.modal) {
      setActiveModal(action.modal);
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
              onClick={() => openModal(action)}
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
                    ? 'bg-white/10 group-hover:bg-[var(--accent-cyan)]/20' 
                    : 'bg-white/5'
                }`}>
                  <action.icon className={`w-5 h-5 ${
                    isWalletConnected 
                      ? 'text-[var(--accent-cyan)] group-hover:text-[var(--accent-cyan)]' 
                      : 'text-white/50'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${
                    isWalletConnected 
                      ? 'text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)]' 
                      : 'text-[var(--text-secondary)]'
                  }`}>
                    {action.title}
                  </div>
                  <div className={`text-sm ${
                    isWalletConnected 
                      ? 'text-[var(--text-muted)]' 
                      : 'text-[var(--text-muted)]/70'
                  }`}>
                    {action.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        {!isWalletConnected && (
          <div className="mt-4 p-3 bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/30 rounded-lg">
            <p className="text-sm text-[var(--accent-cyan)] text-center">
              Connect your wallet to use Quick Actions
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {activeModal === 'wrap' && (
        <WrapModal isOpen={true} onClose={closeModal} />
      )}
      
      {activeModal === 'split' && (
        <ErrorBoundary>
          <SplitModal isOpen={true} onClose={closeModal} />
        </ErrorBoundary>
      )}
      
      {activeModal === 'ai' && (
        <AiInvestmentModal isOpen={true} onClose={closeModal} />
      )}
    </>
  );
};

export default QuickActions;
