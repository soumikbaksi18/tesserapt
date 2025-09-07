import React, { useState } from 'react';
import { usePetraWallet } from '../contexts/PetraWalletContext';
import { Wallet, Zap, MessageSquare, Send } from 'lucide-react';

const WalletDemo: React.FC = () => {
  const { 
    isConnected, 
    walletAddress, 
    isLoading, 
    error,
    signMessage,
    signTransaction 
  } = usePetraWallet();
  
  const [message, setMessage] = useState('Hello from Aptos!');
  const [signature, setSignature] = useState<string>('');
  const [isSigning, setIsSigning] = useState(false);

  const handleSignMessage = async () => {
    if (!isConnected) {
      alert('Please connect a wallet first');
      return;
    }

    setIsSigning(true);
    try {
      const sig = await signMessage(message);
      setSignature(sig);
    } catch (error: any) {
      alert(`Error signing message: ${error.message}`);
    } finally {
      setIsSigning(false);
    }
  };

  const getWalletIcon = () => {
    if (isConnected) {
      return <Zap className="w-6 h-6 text-orange-500" />;
    }
    return <Wallet className="w-6 h-6 text-gray-500" />;
  };

  const getWalletName = () => {
    if (isConnected) {
      return 'Petra Wallet (Aptos)';
    }
    return 'No Wallet';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#04060F] via-[#0A0F1C] to-[#04060F] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass rounded-2xl p-8 border border-[var(--border-glass)]">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Multi-Chain Wallet Integration Demo
          </h1>

          {/* Wallet Status */}
          <div className="glass rounded-xl p-6 mb-8 border border-[var(--border-glass)]">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              {getWalletIcon()}
              <span>Wallet Status</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-[var(--text-muted)]">Connection Status</div>
                <div className={`text-lg font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-[var(--text-muted)]">Wallet Type</div>
                <div className="text-lg font-medium text-white">
                  {getWalletName()}
                </div>
              </div>
              
              {walletAddress && (
                <div className="space-y-2 md:col-span-2">
                  <div className="text-sm text-[var(--text-muted)]">Address</div>
                  <div className="text-lg font-mono text-[var(--accent-cyan)] break-all">
                    {walletAddress}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="text-red-400 text-sm">{error}</div>
              </div>
            )}
          </div>

          {/* Message Signing Demo */}
          {isConnected && (
            <div className="glass rounded-xl p-6 mb-8 border border-[var(--border-glass)]">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-[var(--accent-cyan)]" />
                <span>Message Signing Demo</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">
                    Message to Sign
                  </label>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-[var(--border-glass)] rounded-lg 
                               text-white placeholder-[var(--text-muted)] focus:outline-none 
                               focus:ring-2 focus:ring-[var(--accent-cyan)]"
                    placeholder="Enter message to sign"
                  />
                </div>
                
                <button
                  onClick={handleSignMessage}
                  disabled={isSigning || !message.trim()}
                  className="px-6 py-2 bg-[var(--accent-cyan)] hover:bg-[var(--accent-cyan-hover)] 
                             text-black font-medium rounded-lg transition-all duration-200 
                             disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSigning ? 'Signing...' : 'Sign Message'}</span>
                </button>
                
                {signature && (
                  <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="text-sm text-[var(--text-muted)] mb-2">Signature:</div>
                    <div className="text-sm font-mono text-green-400 break-all">
                      {signature}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="glass rounded-xl p-6 border border-[var(--border-glass)]">
            <h2 className="text-xl font-semibold text-white mb-4">How to Test</h2>
            <div className="space-y-3 text-[var(--text-muted)]">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[var(--accent-cyan)] text-black rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <strong className="text-white">Install Petra Wallet:</strong> Download and install the Petra Wallet browser extension from the Chrome Web Store.
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[var(--accent-cyan)] text-black rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <strong className="text-white">Connect Wallet:</strong> Click the "Connect Wallet" button in the navbar and select "Aptos Wallets" to connect your Petra wallet.
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[var(--accent-cyan)] text-black rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <strong className="text-white">Test Features:</strong> Once connected, you can test message signing functionality above.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletDemo;
