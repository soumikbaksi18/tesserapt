import { createPublicClient, createWalletClient, custom, http } from 'viem';
import type { PublicClient, WalletClient, Chain } from 'viem';
import { avalancheFuji } from 'viem/chains';
import { AVALANCHE_FUJI_CHAIN_ID } from '../contracts/config';

// Custom Avalanche Fuji chain configuration
export const avalancheFujiTestnet: Chain = {
  id: AVALANCHE_FUJI_CHAIN_ID,
  name: 'Avalanche Fuji Testnet',
  nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
  rpcUrls: {
    default: { 
      http: [
        'https://api.avax-test.network/ext/bc/C/rpc',
        'https://avalanche-fuji-c-chain-rpc.publicnode.com',
        'https://rpc.ankr.com/avalanche_fuji',
        'https://avalanche-fuji.drpc.org'
      ] 
    },
    public: { 
      http: [
        'https://api.avax-test.network/ext/bc/C/rpc',
        'https://avalanche-fuji-c-chain-rpc.publicnode.com',
        'https://rpc.ankr.com/avalanche_fuji'
      ] 
    },
  },
  blockExplorers: {
    default: { name: 'Snowtrace', url: 'https://testnet.snowtrace.io' },
  },
  testnet: true,
};

// Public client for reading blockchain data
export const publicClient: PublicClient = createPublicClient({
  chain: avalancheFujiTestnet,
  transport: http(),
});

// Create wallet client when window.ethereum is available
export function createWalletClientFromWindow(): WalletClient | null {
  if (typeof window !== 'undefined' && window.ethereum) {
    return createWalletClient({
      chain: avalancheFujiTestnet,
      transport: custom(window.ethereum),
    });
  }
  return null;
}

// Get the current wallet client
export function getWalletClient(): WalletClient | null {
  return createWalletClientFromWindow();
}

// Check if the current chain is supported
export function isSupportedChain(chainId: number): boolean {
  return chainId === AVALANCHE_FUJI_CHAIN_ID;
}

// Switch to Avalanche Fuji network
export async function switchToAvalancheFuji(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return false;
  }

  try {
    // Try to switch to the network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${AVALANCHE_FUJI_CHAIN_ID.toString(16)}` }],
    });
    return true;
  } catch (switchError: any) {
    // If the network is not added, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${AVALANCHE_FUJI_CHAIN_ID.toString(16)}`,
              chainName: 'Avalanche Fuji Testnet',
              rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
              nativeCurrency: {
                name: 'AVAX',
                symbol: 'AVAX',
                decimals: 18,
              },
              blockExplorerUrls: ['https://testnet.snowtrace.io/'],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Failed to add network:', addError);
        return false;
      }
    } else {
      console.error('Failed to switch network:', switchError);
      return false;
    }
  }
}