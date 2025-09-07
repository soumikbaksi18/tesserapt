import React, { useState } from 'react';
import { Coins, Zap, RefreshCw, CheckCircle, AlertCircle, Wallet } from 'lucide-react';
import { usePetraWallet } from '@/contexts/PetraWalletContext';
import { useAllTokenBalances, useStAVAXInfo, useUSDCEInfo, useMintTokens } from '@/hooks/contracts/useTokens';
import { formatTokenAmount, formatBasisPoints, parseTokenAmount } from '@/lib/viem/utils';
import { getContractAddress, AVALANCHE_FUJI_CHAIN_ID } from '@/lib/contracts/config';

// Design System Colors
const colors = {
  primary: '#00E6FF',   // Neon Cyan (main accent)
  secondary: '#2D5BFF', // Royal Blue (secondary accent)
  dark: '#04060F',      // Rich Black / Base background
  light: '#E6EDF7',     // Soft White-Blue (text & highlights)
  muted: '#9BB0CE',     // Muted secondary text
  border: '#1E2742',    // Subtle navy border
};

const Faucet: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState('stAVAX');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastMint, setLastMint] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Wallet and contract hooks
  const { isConnected, walletAddress } = usePetraWallet();
  const { data: tokenBalances, isLoading: balancesLoading } = useAllTokenBalances();
  const { data: stAVAXInfo } = useStAVAXInfo();
  const { data: usdceInfo } = useUSDCEInfo();

  const availableTokens = [
    { 
      symbol: 'stAVAX', 
      name: 'Staked AVAX', 
      icon: '🟡', 
      balance: tokenBalances?.stAVAX && typeof tokenBalances.stAVAX === 'bigint' ? formatTokenAmount(tokenBalances.stAVAX, 18, 4) : '0.0000',
      maxMint: '1000',
      apy: stAVAXInfo?.yieldRateBps && typeof stAVAXInfo.yieldRateBps === 'bigint' ? `${formatBasisPoints(stAVAXInfo.yieldRateBps)}%` : '8.00%',
      available: true
    },
    { 
      symbol: 'USDCE', 
      name: 'USD Coin', 
      icon: '💙', 
      balance: tokenBalances?.usdce && typeof tokenBalances.usdce === 'bigint' ? formatTokenAmount(tokenBalances.usdce, 6, 4) : '0.0000',
      maxMint: '10000',
      apy: usdceInfo?.yieldRateBps && typeof usdceInfo.yieldRateBps === 'bigint' ? `${formatBasisPoints(usdceInfo.yieldRateBps)}%` : '5.00%',
      available: true
    },
  ];

  // Get contract addresses
  const stAVAXAddress = getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'mockStAVAX');
  const usdceAddress = getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'mockUSDCE');

  // Minting hooks
  const { mutateAsync: mintStAVAX } = useMintTokens(stAVAXAddress);
  const { mutateAsync: mintUSDCE } = useMintTokens(usdceAddress);

  const handleMint = async () => {
    if (!amount || parseFloat(amount) <= 0 || !isConnected || !isCorrectNetwork) return;
    
    const selectedTokenInfo = getTokenInfo(selectedToken);
    if (!selectedTokenInfo?.available) return;

    setIsLoading(true);
    setTxHash(null);
    
    try {
      let hash: string;
      
      if (selectedToken === 'stAVAX') {
        const amountBigInt = parseTokenAmount(amount, 18);
        hash = await mintStAVAX({ amount: amountBigInt });
      } else if (selectedToken === 'USDCE') {
        const amountBigInt = parseTokenAmount(amount, 6); // USDC has 6 decimals
        hash = await mintUSDCE({ amount: amountBigInt });
      } else {
        throw new Error('Token minting not available');
      }
      
      setTxHash(hash);
      setLastMint(`${amount} ${selectedToken}`);
      setAmount('');
    } catch (error) {
      console.error('Minting failed:', error);
      // Handle error - you might want to show an error message
    } finally {
      setIsLoading(false);
    }
  };

  const getTokenInfo = (symbol: string) => {
    return availableTokens.find(token => token.symbol === symbol);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <div 
            className="p-3 rounded-2xl border"
            style={{
              backgroundColor: `${colors.primary}20`,
              borderColor: `${colors.primary}50`
            }}
          >
            <Coins className="w-8 h-8" style={{ color: colors.primary }} />
          </div>
          <h1 className="text-4xl font-bold" style={{ color: colors.light }}>Token Faucet</h1>
        </div>
        <p className="text-lg text-white/70 max-w-2xl mx-auto">
          Get testnet tokens instantly to start using our DeFi protocols on Avalanche Fuji
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm" style={{ color: colors.primary }}>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }}></div>
          <span className="font-medium">Avalanche Fuji Testnet</span>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Wallet Connection Status */}
        <div className={`glass p-4 rounded-xl border transition-all duration-200 ${
          isConnected 
            ? 'border-green-500/30 bg-green-500/10' 
            : 'border-red-500/30 bg-red-500/10'
        }`}>
          <div className="flex items-center space-x-3">
            <Wallet className={`w-5 h-5 ${isConnected ? 'text-green-400' : 'text-red-400'}`} />
            <div className="flex-1">
              <div className={`font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? 'Wallet Connected' : 'Wallet Not Connected'}
              </div>
              <div className="text-xs text-white/60">
                {isConnected ? `${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}` : 'Connect to mint tokens'}
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          </div>
        </div>

        {/* Network Status */}
        <div className={`glass p-4 rounded-xl border transition-all duration-200 ${
          isConnected && isCorrectNetwork 
            ? 'border-green-500/30 bg-green-500/10' 
            : 'border-yellow-500/30 bg-yellow-500/10'
        }`}>
          <div className="flex items-center space-x-3">
            <AlertCircle className={`w-5 h-5 ${
              isConnected && isCorrectNetwork ? 'text-green-400' : 'text-yellow-400'
            }`} />
            <div className="flex-1">
              <div className={`font-medium ${
                isConnected && isCorrectNetwork ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {isConnected && isCorrectNetwork ? 'Correct Network' : 'Network Check'}
              </div>
              <div className="text-xs text-white/60">
                {isConnected && isCorrectNetwork ? 'Avalanche Fuji' : 'Switch to Fuji testnet'}
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              isConnected && isCorrectNetwork ? 'bg-green-400' : 'bg-yellow-400'
            }`}></div>
          </div>
        </div>
      </div>

      {/* Main Minting Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Minting Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section Header */}
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 rounded-lg border"
              style={{
                backgroundColor: `${colors.primary}20`,
                borderColor: `${colors.primary}50`
              }}
            >
              <Zap className="w-5 h-5" style={{ color: colors.primary }} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Mint Tokens</h2>
              <p className="text-sm text-white/60">Select a token and amount to mint</p>
            </div>
          </div>

          {/* Minting Form */}
          <div className="glass p-6 rounded-xl border border-white/10 space-y-6">
            {/* Token Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-white/70">Choose Token</label>
                <span className="text-xs text-white/50">Available tokens only</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {availableTokens.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => token.available && setSelectedToken(token.symbol)}
                    disabled={!token.available}
                    className={`p-4 rounded-xl border transition-all duration-200 relative group ${
                      selectedToken === token.symbol
                        ? 'border-2 shadow-lg'
                        : token.available 
                          ? 'border-white/20 hover:border-white/40 hover:bg-white/5'
                          : 'border-white/10 bg-white/5 opacity-50 cursor-not-allowed'
                    }`}
                    style={{
                      borderColor: selectedToken === token.symbol ? colors.primary : undefined,
                      backgroundColor: selectedToken === token.symbol ? `${colors.primary}10` : undefined,
                      boxShadow: selectedToken === token.symbol ? `0 0 20px ${colors.primary}30` : undefined
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Token Icon & Info */}
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="text-2xl">{token.icon}</div>
                        <div className="text-left">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-white">{token.symbol}</span>
                            {selectedToken === token.symbol && (
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }}></div>
                            )}
                          </div>
                          <div className="text-sm text-white/60">{token.name}</div>
                        </div>
                      </div>

                      {/* Token Stats */}
                      <div className="text-right space-y-1">
                        {token.available ? (
                          <>
                            <div className="text-sm font-medium" style={{ color: colors.primary }}>
                              {token.apy} APY
                            </div>
                            <div className="text-xs text-white/50">
                              Max: {token.maxMint}
                            </div>
                          </>
                        ) : (
                          <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-medium">
                            Not Available
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-white/70">Amount to Mint</label>
                <button
                  onClick={() => setAmount(getTokenInfo(selectedToken)?.maxMint || '0')}
                  className="text-xs font-medium px-2 py-1 rounded transition-colors"
                  style={{ 
                    color: colors.primary,
                    backgroundColor: `${colors.primary}20`
                  }}
                >
                  Max: {getTokenInfo(selectedToken)?.maxMint}
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount..."
                  className="w-full px-4 py-4 glass border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:border-2 text-white placeholder-white/50 text-lg font-medium focus:ring-yellow-400 focus:border-yellow-400"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <span className="text-white/70 font-medium">{selectedToken}</span>
                </div>
              </div>
              {amount && parseFloat(amount) > 0 && (
                <div className="mt-2 text-sm text-white/60">
                  You will receive <span className="font-medium text-white">{amount} {selectedToken}</span>
                </div>
              )}
            </div>

            {/* Mint Button */}
            <div className="pt-2">
              <button
                onClick={handleMint}
                disabled={isLoading || !amount || parseFloat(amount) <= 0 || !isConnected || !isCorrectNetwork || !getTokenInfo(selectedToken)?.available}
                className="w-full py-4 font-semibold text-lg rounded-xl disabled:bg-gray-600 disabled:text-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 group"
                style={{
                  backgroundColor: isLoading || !amount || parseFloat(amount) <= 0 || !isConnected || !isCorrectNetwork || !getTokenInfo(selectedToken)?.available 
                    ? '#4B5563' 
                    : colors.primary,
                  color: isLoading || !amount || parseFloat(amount) <= 0 || !isConnected || !isCorrectNetwork || !getTokenInfo(selectedToken)?.available 
                    ? '#9CA3AF' 
                    : colors.dark,
                  boxShadow: `0 4px 20px ${colors.primary}30`
                }}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span>Minting {selectedToken}...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span>Mint {amount || '0'} {selectedToken}</span>
                  </>
                )}
              </button>
            </div>

            {/* Success Message */}
            {lastMint && (
              <div className="space-y-4 p-4 rounded-xl border" style={{ 
                backgroundColor: '#10B98120', 
                borderColor: '#10B98150' 
              }}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-green-500/20">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-green-400">Mint Successful!</div>
                    <div className="text-sm text-green-300">Successfully minted {lastMint}</div>
                  </div>
                </div>
                {txHash && (
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="text-sm text-white/70">Transaction Hash:</div>
                    <a 
                      href={`https://testnet.snowtrace.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline font-mono text-sm flex items-center space-x-1"
                    >
                      <span>{txHash.slice(0, 8)}...{txHash.slice(-6)}</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Token Info Sidebar */}
        <div className="space-y-6">
          {/* Selected Token Overview */}
          <div className="glass p-6 rounded-xl border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <div 
                className="p-2 rounded-lg border"
                style={{
                  backgroundColor: `${colors.secondary}20`,
                  borderColor: `${colors.secondary}50`
                }}
              >
                <Coins className="w-5 h-5" style={{ color: colors.secondary }} />
              </div>
              <h3 className="text-lg font-semibold text-white">Token Details</h3>
            </div>
            
            {getTokenInfo(selectedToken) && (
              <div className="space-y-4">
                {/* Token Header */}
                <div className="text-center p-4 rounded-xl border border-white/10" style={{
                  backgroundColor: getTokenInfo(selectedToken)?.available ? `${colors.primary}10` : '#ffffff05'
                }}>
                  <div className="text-4xl mb-3">{getTokenInfo(selectedToken)?.icon}</div>
                  <div className="text-xl font-bold text-white">{getTokenInfo(selectedToken)?.symbol}</div>
                  <div className="text-sm text-white/60 mb-2">{getTokenInfo(selectedToken)?.name}</div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    getTokenInfo(selectedToken)?.available 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {getTokenInfo(selectedToken)?.available ? '✓ Available' : '✗ Not Available'}
                  </div>
                </div>
                
                {/* Token Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-white/70 text-sm">Your Balance</span>
                    <span className="text-white font-medium">
                      {balancesLoading ? (
                        <div className="w-16 h-4 bg-white/10 rounded animate-pulse"></div>
                      ) : (
                        getTokenInfo(selectedToken)?.balance
                      )}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-white/70 text-sm">Max Mint</span>
                    <span className="text-white font-medium">{getTokenInfo(selectedToken)?.maxMint}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-white/70 text-sm">APY Rate</span>
                    <span style={{ color: colors.primary }} className="font-medium">
                      {getTokenInfo(selectedToken)?.apy}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-white/70 text-sm">Network</span>
                    <span className="text-green-400 font-medium">Fuji Testnet</span>
                  </div>
                </div>
              </div>
            )}
          </div>

      
        </div>
      </div>

      {/* Information Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* How It Works */}
        <div className="glass p-6 rounded-xl border border-white/10">
          <div className="flex items-center space-x-3 mb-4">
            <div 
              className="p-2 rounded-lg border"
              style={{
                backgroundColor: `${colors.primary}20`,
                borderColor: `${colors.primary}50`
              }}
            >
              <svg className="w-5 h-5" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">How It Works</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black mt-0.5" style={{ backgroundColor: colors.primary }}>
                1
              </div>
              <div>
                <h4 className="font-medium text-white">Connect Wallet</h4>
                <p className="text-sm text-white/60">Connect your MetaMask to Avalanche Fuji testnet</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black mt-0.5" style={{ backgroundColor: colors.primary }}>
                2
              </div>
              <div>
                <h4 className="font-medium text-white">Select Token</h4>
                <p className="text-sm text-white/60">Choose between stAVAX or USDC.e tokens</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black mt-0.5" style={{ backgroundColor: colors.primary }}>
                3
              </div>
              <div>
                <h4 className="font-medium text-white">Mint Tokens</h4>
                <p className="text-sm text-white/60">Enter amount and mint real testnet tokens instantly</p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="glass p-6 rounded-xl border border-white/10">
          <div className="flex items-center space-x-3 mb-4">
            <div 
              className="p-2 rounded-lg border"
              style={{
                backgroundColor: `${colors.secondary}20`,
                borderColor: `${colors.secondary}50`
              }}
            >
              <AlertCircle className="w-5 h-5" style={{ color: colors.secondary }} />
            </div>
            <h3 className="text-lg font-semibold text-white">Important Notes</h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <h4 className="font-medium text-blue-400">Testnet Only</h4>
              </div>
              <p className="text-sm text-blue-300">Tokens have no real monetary value</p>
            </div>
            
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <h4 className="font-medium text-green-400">Real Contracts</h4>
              </div>
              <p className="text-sm text-green-300">Mints actual ERC-20 tokens on blockchain</p>
            </div>
            
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <h4 className="font-medium text-purple-400">DeFi Ready</h4>
              </div>
              <p className="text-sm text-purple-300">Use tokens in our DeFi protocols immediately</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faucet; 