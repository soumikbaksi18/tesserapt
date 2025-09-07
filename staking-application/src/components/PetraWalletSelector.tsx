import React from 'react';
import { Wallet } from 'lucide-react';
import { usePetraWallet } from '../contexts/PetraWalletContext';

interface PetraWalletSelectorProps {
  className?: string;
}

const PetraWalletSelector: React.FC<PetraWalletSelectorProps> = ({ className = '' }) => {
  const { 
    isConnected, 
    walletAddress, 
    isLoading, 
    error,
    connectWallet, 
    disconnectWallet 
  } = usePetraWallet();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 5)}...${addr.slice(-3)}`;
  };

  if (isConnected) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="flex items-center space-x-2 glass px-3 py-2 rounded-lg border border-[var(--border-glass)]">
          <Wallet className="w-4 h-4 text-[var(--accent-cyan)]" />
          <span className="text-sm font-medium text-[var(--text-primary)] font-mono">
            {formatAddress(walletAddress || '')}
          </span>
          <span className="text-xs text-[var(--text-muted)] bg-orange-500/20 px-2 py-1 rounded">
            Petra
          </span>
        </div>
        <button
          onClick={disconnectWallet}
          className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] glass 
                     hover:bg-white/5 rounded-lg transition-all duration-200 border border-[var(--border-glass)]"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={connectWallet}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-black 
                   bg-[var(--accent-cyan)] hover:bg-[var(--accent-cyan-hover)] 
                   rounded-lg transition-all duration-200 flex items-center space-x-2 
                   shadow-lg hover:shadow-[rgba(0,230,255,0.35)] disabled:opacity-50"
      >
        <Wallet className="w-4 h-4" />
        <span>{isLoading ? 'Connecting...' : 'Connect Petra Wallet'}</span>
      </button>

      {error && (
        <div className="absolute top-full left-0 mt-2 w-64 glass rounded-lg border border-red-500/30 
                        shadow-lg z-50 backdrop-blur-sm p-3">
          <div className="text-sm text-red-400">
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default PetraWalletSelector;
