import React from 'react';
import { usePetraWallet } from '@/contexts/PetraWalletContext';
import { useAptosTokenBalances } from '@/hooks/contracts/useAptosTokens';

// Design System Colors
const colors = {
  primary: '#00E6FF',   // Neon Cyan
  secondary: '#2D5BFF', // Royal Blue
  dark: '#04060F',      // Rich Black
  light: '#E6EDF7',     // Soft White-Blue
  muted: '#9BB0CE',     // Muted Blue-Gray
  border: '#1E2742',    // Subtle Navy Border
};

// CoinGecko token images for Aptos tokens
const tokenImages = {
  APT: 'https://assets.coingecko.com/coins/images/26455/small/aptos_round.png',
  USDC: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
  USDT: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
};

const AptosBalanceCards: React.FC = () => {
  const { walletAddress } = usePetraWallet();
  
  // Aptos token data hooks
  const { data: balances, isLoading, error } = useAptosTokenBalances();

  // Get APY data for Aptos tokens
  const getAPYData = () => {
    return {
      APT: 0.05,    // 5% APY for APT
      USDC: 0.03,   // 3% APY for USDC
      USDT: 0.03,   // 3% APY for USDT
    };
  };

  const apyData = getAPYData();

  const formatBalance = (balance: any) => {
    if (!balance || !walletAddress) return '0.0000';
    if (typeof balance === 'string') {
      return parseFloat(balance).toFixed(4);
    }
    return parseFloat(balance.toString()).toFixed(4);
  };

  const formatAPY = (apy: number) => {
    return (apy * 100).toFixed(2);
  };

  const cards = [
    {
      id: 'apt-tokens',
      title: 'APT Tokens',
      subtitle: 'Aptos Native Token',
      balances: {
        APT: balances?.APT || '0'
      },
      apy: {
        APT: apyData.APT
      },
      color: colors.primary,
      icon: 'APT'
    },
    {
      id: 'stablecoins',
      title: 'Stablecoins',
      subtitle: 'USDC + USDT Portfolio',
      balances: {
        USDC: balances?.USDC || '0',
        USDT: balances?.USDT || '0'
      },
      apy: {
        USDC: apyData.USDC,
        USDT: apyData.USDT
      },
      color: colors.secondary,
      icon: 'USDC'
    }
  ];

  if (!walletAddress) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cards.map((card) => (
          <div key={card.id} className="glass rounded-2xl p-6 border border-[var(--border-glass)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{card.subtitle}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <img 
                  src={tokenImages[card.icon as keyof typeof tokenImages]} 
                  alt={card.icon}
                  className="w-8 h-8 rounded-full"
                />
              </div>
            </div>
            <div className="text-center py-8">
              <p className="text-[var(--text-muted)]">Connect your Petra wallet to view balances</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cards.map((card) => (
          <div key={card.id} className="glass rounded-2xl p-6 border border-[var(--border-glass)] animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="h-5 bg-white/10 rounded w-32 mb-2"></div>
                <div className="h-4 bg-white/5 rounded w-24"></div>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/5"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-white/10 rounded w-full"></div>
              <div className="h-4 bg-white/5 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-6 border border-red-500/30">
        <div className="text-center">
          <p className="text-red-400 mb-2">Error loading balances</p>
          <p className="text-sm text-[var(--text-muted)]">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {cards.map((card) => (
        <div key={card.id} className="glass rounded-2xl p-6 border border-[var(--border-glass)] hover:border-[var(--accent-cyan)]/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">{card.title}</h3>
              <p className="text-sm text-[var(--text-muted)]">{card.subtitle}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <img 
                src={tokenImages[card.icon as keyof typeof tokenImages]} 
                alt={card.icon}
                className="w-8 h-8 rounded-full"
              />
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(card.balances).map(([token, balance]) => (
              <div key={token} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img 
                    src={tokenImages[token as keyof typeof tokenImages]} 
                    alt={token}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm font-medium text-white">{token}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">
                    {formatBalance(balance)}
                  </div>
                  <div className="text-xs text-green-400">
                    +{formatAPY(card.apy[token as keyof typeof card.apy])}% APY
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--border-glass)]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-muted)]">Total Value</span>
              <span className="font-semibold text-white">
                ${Object.entries(card.balances).reduce((total, [token, balance]) => {
                  const value = parseFloat(formatBalance(balance));
                  // Mock USD values - in real app, you'd fetch from price API
                  const mockPrices = { APT: 8.50, USDC: 1.00, USDT: 1.00 };
                  return total + (value * mockPrices[token as keyof typeof mockPrices]);
                }, 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AptosBalanceCards;
