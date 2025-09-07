"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';
import { PetraWallet } from 'petra-plugin-wallet-adapter';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';

interface PetraWalletContextType {
  isConnected: boolean;
  walletAddress: string;
  isLoading: boolean;
  error: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signMessage: (message: string) => Promise<string>;
  signTransaction: (transaction: any) => Promise<any>;
  account: any;
}

const PetraWalletContext = createContext<PetraWalletContextType | undefined>(undefined);

export const usePetraWallet = () => {
  const context = useContext(PetraWalletContext);
  if (context === undefined) {
    throw new Error('usePetraWallet must be used within a PetraWalletProvider');
  }
  return context;
};

interface PetraWalletProviderProps {
  children: ReactNode;
}

export const PetraWalletProvider: React.FC<PetraWalletProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Use the Aptos wallet hook
  const aptosWallet = useAptosWallet();
  const { connect, account, disconnect, signMessage: aptosSignMessage, signAndSubmitTransaction } = aptosWallet;
  
  // Monitor account changes
  useEffect(() => {
    if (account) {
      console.log('PetraWallet: Account connected:', account.address);
    }
  }, [account]);

  // Update connection state when account changes
  useEffect(() => {
    if (account) {
      setIsConnected(true);
      setWalletAddress(account.address);
    } else {
      setIsConnected(false);
      setWalletAddress('');
    }
  }, [account]);

  const connectWallet = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Try direct Petra wallet connection first
      if (typeof window !== 'undefined' && (window as any).petra) {
        const petra = (window as any).petra;
        
        if (petra.connect) {
          const result = await petra.connect();
          
          if (result && result.address) {
            setIsConnected(true);
            setWalletAddress(result.address);
            return;
          }
        }
      }
      
      // Fallback to adapter connection
      if (typeof connect !== 'function') {
        throw new Error('Connect function is not available');
      }
      
      await connect();
      
      // Wait a bit for the account to be updated
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (!account) {
        throw new Error('Connection failed. Please check if you approved the connection in Petra wallet.');
      }
    } catch (err: any) {
      console.error('PetraWallet: Connection failed:', err);
      setError(err.message || 'Failed to connect Petra wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      // Try direct Petra wallet disconnection first
      if (typeof window !== 'undefined' && (window as any).petra) {
        const petra = (window as any).petra;
        if (petra.disconnect) {
          await petra.disconnect();
        }
      }
      
      // Also try adapter disconnection
      if (typeof disconnect === 'function') {
        await disconnect();
      }
      
      // Reset local state
      setIsConnected(false);
      setWalletAddress('');
      setError('');
    } catch (err: any) {
      console.error('Error disconnecting Petra wallet:', err);
      // Even if there's an error, reset the local state
      setIsConnected(false);
      setWalletAddress('');
      setError('');
    }
  };

  const signMessage = async (message: string): Promise<string> => {
    if (!account) {
      throw new Error('No wallet connected');
    }

    try {
      const result = await aptosSignMessage({
        message: message,
        nonce: Date.now().toString(),
      });
      return result.signature;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to sign message');
    }
  };

  const signTransaction = async (transaction: any): Promise<any> => {
    if (!account) {
      throw new Error('No wallet connected');
    }

    try {
      const result = await signAndSubmitTransaction(transaction);
      return result;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to sign transaction');
    }
  };

  const value: PetraWalletContextType = {
    isConnected,
    walletAddress,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    signMessage,
    signTransaction,
    account,
  };

  return (
    <PetraWalletContext.Provider value={value}>
      {children}
    </PetraWalletContext.Provider>
  );
};

// Main provider that wraps the Aptos wallet adapter
export const PetraWalletAdapterWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const wallets = [new PetraWallet()];

  return (
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={false}>
      <PetraWalletProvider>
        {children}
      </PetraWalletProvider>
    </AptosWalletAdapterProvider>
  );
};
