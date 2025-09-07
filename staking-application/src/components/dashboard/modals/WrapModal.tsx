import React, { useState } from 'react';
import { X, Package, CheckCircle, Wallet } from 'lucide-react';
import { usePetraWallet } from '@/contexts/PetraWalletContext';
import { useTokenBalance, useStAVAXBalance, useUSDCEBalance, useTokenApprove } from '@/hooks/contracts/useTokens';
import { useSYBalance, useWrapTokens } from '@/hooks/contracts/useStaking';
import { formatTokenAmount, parseTokenAmount } from '@/lib/viem/utils';
import { getContractAddress, AVALANCHE_FUJI_CHAIN_ID } from '@/lib/contracts/config';
import { useActivityLogs } from '@/hooks/useActivityLogs';

interface WrapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WrapModal: React.FC<WrapModalProps> = ({ isOpen, onClose }) => {
  const { isConnected } = usePetraWallet();
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('stAVAX');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real contract hooks
  const stAVAXBalance = useStAVAXBalance();
  const usdceBalance = useUSDCEBalance();
  const syBalance = useSYBalance();
  const wrapTokens = useWrapTokens();

  // Approval hooks
  const syWrapperAddress = getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'syWrapper');
  const stAVAXAddress = getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'mockStAVAX');
  const usdceAddress = getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'mockUSDCE');
  
  const approveStAVAX = useTokenApprove(stAVAXAddress);
  const approveUSDCE = useTokenApprove(usdceAddress);

  // Activity logging
  const { trackTransaction, trackSuccess, trackFailure } = useActivityLogs();

  // Available tokens for wrapping
  const availableTokens = [
    { 
      symbol: 'stAVAX', 
      name: 'Staked AVAX', 
      balance: stAVAXBalance.data,
      isLoading: stAVAXBalance.isLoading
    },
    { 
      symbol: 'USDC.e', 
      name: 'USD Coin', 
      balance: usdceBalance.data,
      isLoading: usdceBalance.isLoading
    }
  ];

  const selectedTokenData = availableTokens.find(t => t.symbol === selectedToken);

  const handleWrap = async () => {
    if (!amount || !selectedTokenData || !isConnected || !isCorrectNetwork) return;

    try {
      setError(null);
      const amountBigInt = parseTokenAmount(amount);
      
      // Check if user has sufficient balance
      const balance = typeof selectedTokenData.balance === 'bigint' ? selectedTokenData.balance : BigInt(0);
      if (balance < amountBigInt) {
        throw new Error(`Insufficient ${selectedToken} balance. You have ${formatTokenAmount(balance)} but need ${formatTokenAmount(amountBigInt)}`);
      }

      // Track the wrap transaction
      const logId = trackTransaction(
        'wrap',
        `Wrap ${formatTokenAmount(amountBigInt)} ${selectedToken}`,
        `Wrapping ${formatTokenAmount(amountBigInt)} ${selectedToken} to SY tokens`,
        {
          token: selectedToken,
          amount: formatTokenAmount(amountBigInt),
          balance: formatTokenAmount(balance)
        }
      );

      console.log('Wrapping tokens:', {
        token: selectedToken,
        amount: formatTokenAmount(amountBigInt),
        balance: formatTokenAmount(balance)
      });

      // First approve the token for the SY wrapper contract
      console.log('Approving tokens for wrapping...');
      const approveHook = selectedToken === 'stAVAX' ? approveStAVAX : approveUSDCE;
      
      // Track approval transaction
      const approvalLogId = trackTransaction(
        'approval',
        `Approve ${formatTokenAmount(amountBigInt)} ${selectedToken}`,
        `Approving ${selectedToken} spending for SY wrapper contract`,
        {
          token: selectedToken,
          amount: formatTokenAmount(amountBigInt),
          spender: syWrapperAddress
        }
      );

      await approveHook.mutateAsync({ 
        spender: syWrapperAddress, 
        amount: amountBigInt 
      });
      console.log('Token approval successful');

      // Track approval success
      trackSuccess(approvalLogId, 'Approval successful', 0, BigInt(0));

      // Wait a moment for approval to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Then wrap the tokens
      console.log('Calling wrap function...');
      const tokenIndex = selectedToken === 'stAVAX' ? 0 : 1; // stAVAX is index 0, USDC.e is index 1
      const wrapResult = await wrapTokens.mutateAsync({
        amount: amountBigInt,
        tokenIndex
      });
      console.log('Wrap successful');

      // Track wrap success
      if (wrapResult?.hash) {
        trackSuccess(logId, wrapResult.hash, 0, BigInt(0));
      }

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setAmount('');
        setError(null);
      }, 2000);
      
    } catch (error: any) {
      console.error('Wrap error:', error);
      const errorMessage = error.message || 'Failed to wrap tokens';
      setError(errorMessage);
      
      // Track the error
      trackTransaction(
        'error',
        'Wrap Transaction Failed',
        errorMessage,
        {
          token: selectedToken,
          amount: amount,
          error: errorMessage
        }
      );
    }
  };

  const formatBalance = (balance: any) => {
    if (!balance) return '0.0000';
    if (typeof balance === 'bigint') {
      return formatTokenAmount(balance, 18, 4);
    }
    return '0.0000';
  };

  const setMaxAmount = () => {
    const balance = selectedTokenData?.balance;
    if (balance && typeof balance === 'bigint' && balance > BigInt(0)) {
      setAmount(formatTokenAmount(balance));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative glass p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-400/20 rounded-lg border border-yellow-400/30">
              <Package className="w-6 h-6 text-yellow-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Wrap Tokens</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSuccess ? (
          <>
            {/* Token Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/70 mb-2">Select Token</label>
              <div className="grid grid-cols-2 gap-2">
                {availableTokens.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => setSelectedToken(token.symbol)}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      selectedToken === token.symbol
                        ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300'
                        : 'border-white/20 glass-hover text-white/70 hover:text-white'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-medium">{token.symbol}</div>
                      <div className="text-xs opacity-70">{token.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/70 mb-2">Amount to Wrap</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="flex-1 px-4 py-3 glass border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-white/50"
                />
                <button
                  onClick={setMaxAmount}
                  className="px-4 py-3 border border-white/20 text-white font-medium rounded-lg hover:bg-white/10 transition-all duration-200"
                >
                  MAX
                </button>
              </div>
              <div className="mt-2 text-sm text-white/60">
                Available: {selectedTokenData?.isLoading ? '...' : formatBalance(selectedTokenData?.balance)} {selectedToken}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-400/10 border border-red-400/20 rounded-lg">
                <div className="flex items-center space-x-2 text-red-400">
                  <X className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Network Check */}
            {!isConnected && (
              <div className="mb-4 p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                <div className="flex items-center space-x-2 text-yellow-400">
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm">Please connect your wallet to wrap tokens</span>
                </div>
              </div>
            )}

            {isConnected && !isCorrectNetwork && (
              <div className="mb-4 p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                <div className="flex items-center space-x-2 text-yellow-400">
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm">Please switch to Avalanche Fuji network</span>
                </div>
              </div>
            )}

            {/* Wrap Button */}
            <button
              onClick={handleWrap}
              disabled={wrapTokens.isPending || approveStAVAX.isPending || approveUSDCE.isPending || !amount || parseFloat(amount) <= 0 || !isConnected || !isCorrectNetwork}
              className="w-full py-3 bg-yellow-400 text-black font-medium rounded-lg hover:bg-yellow-300 disabled:bg-gray-600 disabled:text-gray-400 transition-all duration-200 shadow-lg hover:shadow-yellow-400/25 flex items-center justify-center space-x-2"
            >
              {wrapTokens.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  <span>Wrapping...</span>
                </>
              ) : (approveStAVAX.isPending || approveUSDCE.isPending) ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  <span>Approving...</span>
                </>
              ) : (
                <>
                  <Package className="w-5 h-5" />
                  <span>Wrap to SY</span>
                </>
              )}
            </button>
          </>
        ) : (
          /* Success State */
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Tokens Wrapped Successfully!</h3>
            <p className="text-white/60">Your {amount} {selectedToken} has been wrapped into SY tokens.</p>
            <div className="mt-4 p-3 bg-green-400/10 border border-green-400/20 rounded-lg">
              <p className="text-sm text-green-400">
                SY tokens can now be split into PT + YT tokens for yield tokenization.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WrapModal; 