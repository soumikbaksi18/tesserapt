import React, { useState } from 'react';
import { X, Scissors, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { usePetraWallet } from '@/contexts/PetraWalletContext';
import { useMaturities, useSplitTokens, useFormattedMaturities, usePreviewSplit, useCreateMaturity } from '@/hooks/contracts/useYieldTokenization';
import { useSYBalance } from '@/hooks/contracts/useStaking';
import { useTokenApprove } from '@/hooks/contracts/useTokens';
import { formatTokenAmount, parseTokenAmount } from '@/lib/viem/utils';
import { getContractAddress, AVALANCHE_FUJI_CHAIN_ID } from '@/lib/contracts/config';

interface SplitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SplitModal: React.FC<SplitModalProps> = ({ isOpen, onClose }) => {
  const { isConnected } = usePetraWallet();
  const [amount, setAmount] = useState('');
  const [selectedMaturity, setSelectedMaturity] = useState<bigint | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contract hooks
  const { data: maturities, isLoading: maturitiesLoading, refetch: refetchMaturities } = useFormattedMaturities();
  const syBalance = useSYBalance();
  const splitTokens = useSplitTokens();
  const createMaturity = useCreateMaturity();


  
  // Preview split
  const splitAmountBigInt = amount && selectedMaturity ? parseTokenAmount(amount) : BigInt(0);
  const previewSplit = usePreviewSplit(splitAmountBigInt, selectedMaturity || BigInt(0));
  
  // Approval hook
  const yieldTokenizationAddress = getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'yieldTokenization');
  const approveSY = useTokenApprove(getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'syWrapper'));

  const handleSplit = async () => {
    if (!amount || !selectedMaturity || !isConnected || !isCorrectNetwork) return;

    try {
      setError(null);
      const amountBigInt = parseTokenAmount(amount);
      
      // Check if user has sufficient SY balance
      const balance = typeof syBalance.data === 'bigint' ? syBalance.data : BigInt(0);
      if (balance < amountBigInt) {
        throw new Error(`Insufficient SY balance. You have ${formatTokenAmount(balance)} SY but need ${formatTokenAmount(amountBigInt)} SY`);
      }

      console.log('Split operation:', {
        amount: formatTokenAmount(amountBigInt),
        maturity: selectedMaturity.toString(),
        balance: formatTokenAmount(balance)
      });

      // First approve SY tokens
      console.log('Approving SY tokens for split...');
      await approveSY.mutateAsync({ spender: yieldTokenizationAddress, amount: amountBigInt });
      console.log('SY approval successful');

      // Wait a moment for approval to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Then split
      console.log('Calling split function...');
      await splitTokens.mutateAsync({ syAmount: amountBigInt, maturity: selectedMaturity });
      console.log('Split successful');

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setAmount('');
        setSelectedMaturity(null);
        setError(null);
      }, 2000);

    } catch (error: any) {
      console.error('Split error:', error);
      setError(error.message || 'Failed to split tokens');
    }
  };

  const formatMaturity = (maturity: bigint) => {
    const date = new Date(Number(maturity) * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeToMaturity = (maturity: bigint) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = Number(maturity) - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (24 * 60 * 60));
    const months = Math.floor(days / 30);
    
    if (months > 0) return `${months} month${months > 1 ? 's' : ''}`;
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  const setMaxAmount = () => {
    const balance = syBalance.data;
    if (balance && typeof balance === 'bigint' && balance > BigInt(0)) {
      setAmount(formatTokenAmount(balance));
    }
  };

  const handleCreateMaturity = async (months: number) => {
    if (!isConnected || !isCorrectNetwork) return;
    
    try {
      setError(null);
      const futureTimestamp = BigInt(Math.floor(Date.now() / 1000) + (months * 30 * 24 * 60 * 60));
      
      console.log(`Creating ${months}-month maturity:`, futureTimestamp.toString());
      
      await createMaturity.mutateAsync({ maturity: futureTimestamp });
      
      console.log('Maturity created successfully');
      
      // Refresh maturities list
      await refetchMaturities();
      
    } catch (error: any) {
      console.error('Create maturity failed:', error);
      setError(error.message || 'Failed to create maturity');
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
            <div className="p-2 bg-green-400/20 rounded-lg border border-green-400/30">
              <Scissors className="w-6 h-6 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Split Tokens</h2>
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
            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/70 mb-2">SY Amount to Split</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="flex-1 px-4 py-3 glass border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 text-white placeholder-white/50"
                />
                <button
                  onClick={setMaxAmount}
                  className="px-4 py-3 border border-white/20 text-white font-medium rounded-lg hover:bg-white/10 transition-all duration-200"
                >
                  MAX
                </button>
              </div>
              <div className="mt-2 text-sm text-white/60">
                Available: {syBalance.isLoading ? '...' : formatTokenAmount(typeof syBalance.data === 'bigint' ? syBalance.data : BigInt(0))} SY
              </div>
            </div>

            {/* Maturity Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white/70">Select Maturity</label>
                <button
                  onClick={() => refetchMaturities()}
                  disabled={maturitiesLoading}
                  className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded transition-colors"
                >
                  {maturitiesLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
              

              
              {maturitiesLoading ? (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
                </div>
              ) : maturities && Array.isArray(maturities) && maturities.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {maturities
                    .filter((maturity: any) => maturity.isActive)
                    .map((maturity: any) => (
                      <button
                        key={maturity.timestamp.toString()}
                        onClick={() => setSelectedMaturity(maturity.timestamp)}
                        className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                          selectedMaturity === maturity.timestamp
                            ? 'border-green-400 bg-green-400/10 text-green-300'
                            : 'border-white/20 glass-hover text-white/70 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{maturity.label}</div>
                            <div className="text-xs opacity-70">
                              Expires: {maturity.date}
                            </div>
                            <div className="text-xs opacity-70">
                              {maturity.timeToMaturity} remaining
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xs font-semibold ${maturity.isActive ? 'text-green-400' : 'text-red-400'}`}>
                              {maturity.isActive ? 'Active' : 'Expired'}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-4 text-white/60">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No maturities found on blockchain</p>
                    <p className="text-xs mt-1">This means no one has created maturity periods yet</p>
                  </div>
                  
                  {/* Create Maturity Buttons */}
                  <div className="p-4 bg-blue-400/10 border border-blue-400/20 rounded-lg">
                    <p className="text-blue-400 text-sm mb-3">Be the first to create maturities:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleCreateMaturity(3)}
                        disabled={createMaturity.isPending}
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm rounded-lg transition-colors flex items-center space-x-1"
                      >
                        {createMaturity.isPending ? (
                          <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : null}
                        <span>3 Months</span>
                      </button>
                      <button
                        onClick={() => handleCreateMaturity(6)}
                        disabled={createMaturity.isPending}
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm rounded-lg transition-colors flex items-center space-x-1"
                      >
                        {createMaturity.isPending ? (
                          <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : null}
                        <span>6 Months</span>
                      </button>
                      <button
                        onClick={() => handleCreateMaturity(12)}
                        disabled={createMaturity.isPending}
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm rounded-lg transition-colors flex items-center space-x-1"
                      >
                        {createMaturity.isPending ? (
                          <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : null}
                        <span>12 Months</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Split */}
            {amount && selectedMaturity && previewSplit.data && (
              <div className="mb-4 p-4 glass-hover rounded-lg border border-white/10">
                <p className="text-sm text-white/70 mb-2">You will receive:</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white">PT Tokens:</span>
                    <span className="text-green-400 font-semibold">
                      {formatTokenAmount(previewSplit.data.ptAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white">YT Tokens:</span>
                    <span className="text-purple-400 font-semibold">
                      {formatTokenAmount(previewSplit.data.ytAmount)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Network Check */}
            {!isConnected && (
              <div className="mb-4 p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                <div className="flex items-center space-x-2 text-yellow-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Please connect your wallet to split tokens</span>
                </div>
              </div>
            )}

            {isConnected && !isCorrectNetwork && (
              <div className="mb-4 p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                <div className="flex items-center space-x-2 text-yellow-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Please switch to Avalanche Fuji network</span>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-400/10 border border-red-400/20 rounded-lg">
                <div className="flex items-center space-x-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Split Button */}
            <button
              onClick={handleSplit}
              disabled={splitTokens.isPending || approveSY.isPending || !amount || !selectedMaturity || parseFloat(amount) <= 0 || !isConnected || !isCorrectNetwork}
              className="w-full py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-400 disabled:bg-gray-600 disabled:text-gray-400 transition-all duration-200 shadow-lg hover:shadow-green-400/25 flex items-center justify-center space-x-2"
            >
              {splitTokens.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Splitting...</span>
                </>
              ) : approveSY.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Approving...</span>
                </>
              ) : (
                <>
                  <Scissors className="w-5 h-5" />
                  <span>Split SY Tokens</span>
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
            <h3 className="text-lg font-semibold text-white mb-2">Tokens Split Successfully!</h3>
            <p className="text-white/60">
              Your {amount} SY tokens have been split into PT + YT tokens.
            </p>
            {selectedMaturity && (
              <p className="text-white/60 mt-2">
                Maturity: {formatMaturity(selectedMaturity)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitModal; 