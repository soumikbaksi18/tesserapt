import { formatEther, parseEther } from 'viem';
import type { Address } from 'viem';
import { usePetraWallet } from '@/contexts/PetraWalletContext';
import { useContractRead, useMultipleContractReads } from '../useContractRead';
import { useContractWrite } from '../useContractWrite';
import { 
  getMockStAVAXContract, 
  getMockUSDCEContract, 
  getPTTokenContract, 
  getYTTokenContract,
  getERC20Contract 
} from '@/lib/viem/contracts';
import { formatTokenAmount, calculateAPY } from '@/lib/viem/utils';

// Token balance hook
export function useTokenBalance(tokenAddress: Address) {
  const { walletAddress, walletClient } = useWallet();

  return useContractRead(
    ['tokenBalance', tokenAddress, walletAddress],
    async () => {
      if (!walletAddress) return BigInt(0);
      const contract = getERC20Contract(tokenAddress);
      return await contract.read.balanceOf([walletAddress]);
    },
    {
      enabled: !!walletAddress,
    }
  );
}

// Token info hook
export function useTokenInfo(tokenAddress: Address) {
  return useMultipleContractReads(
    ['tokenInfo', tokenAddress],
    {
      name: async () => {
        const contract = getERC20Contract(tokenAddress);
        return await contract.read.name();
      },
      symbol: async () => {
        const contract = getERC20Contract(tokenAddress);
        return await contract.read.symbol();
      },
      decimals: async () => {
        const contract = getERC20Contract(tokenAddress);
        return await contract.read.decimals();
      },
      totalSupply: async () => {
        const contract = getERC20Contract(tokenAddress);
        return await contract.read.totalSupply();
      },
    }
  );
}

// Mock stAVAX specific hooks
export function useStAVAXBalance() {
  const { walletAddress } = useWallet();

  return useContractRead(
    ['stAVAXBalance', walletAddress],
    async () => {
      if (!walletAddress) return BigInt(0);
      const contract = getMockStAVAXContract();
      return await contract.read.balanceOf([walletAddress]);
    },
    {
      enabled: !!walletAddress,
    }
  );
}

export function useStAVAXInfo() {
  return useMultipleContractReads(
    ['stAVAXInfo'],
    {
      name: async () => {
        const contract = getMockStAVAXContract();
        return await contract.read.name();
      },
      symbol: async () => {
        const contract = getMockStAVAXContract();
        return await contract.read.symbol();
      },
      yieldRateBps: async () => {
        const contract = getMockStAVAXContract();
        return await contract.read.yieldRateBps();
      },
      totalSupply: async () => {
        const contract = getMockStAVAXContract();
        return await contract.read.totalSupply();
      },
    }
  );
}

// Mock USDC.e specific hooks
export function useUSDCEBalance() {
  const { walletAddress } = useWallet();

  return useContractRead(
    ['usdceBalance', walletAddress],
    async () => {
      if (!walletAddress) return BigInt(0);
      const contract = getMockUSDCEContract();
      return await contract.read.balanceOf([walletAddress]);
    },
    {
      enabled: !!walletAddress,
    }
  );
}

export function useUSDCEInfo() {
  return useMultipleContractReads(
    ['usdceInfo'],
    {
      name: async () => {
        const contract = getMockUSDCEContract();
        return await contract.read.name();
      },
      symbol: async () => {
        const contract = getMockUSDCEContract();
        return await contract.read.symbol();
      },
      yieldRateBps: async () => {
        const contract = getMockUSDCEContract();
        return await contract.read.yieldRateBps();
      },
      totalSupply: async () => {
        const contract = getMockUSDCEContract();
        return await contract.read.totalSupply();
      },
    }
  );
}

// PT Token hooks
export function usePTTokenBalance() {
  const { walletAddress } = useWallet();

  return useContractRead(
    ['ptTokenBalance', walletAddress],
    async () => {
      if (!walletAddress) return BigInt(0);
      const contract = getPTTokenContract();
      return await contract.read.balanceOf([walletAddress]);
    },
    {
      enabled: !!walletAddress,
    }
  );
}

// YT Token hooks
export function useYTTokenBalance() {
  const { walletAddress } = useWallet();

  return useContractRead(
    ['ytTokenBalance', walletAddress],
    async () => {
      if (!walletAddress) return BigInt(0);
      const contract = getYTTokenContract();
      return await contract.read.balanceOf([walletAddress]);
    },
    {
      enabled: !!walletAddress,
    }
  );
}

// Token approval hook
export function useTokenAllowance(tokenAddress: Address, spenderAddress: Address) {
  const { walletAddress } = useWallet();

  return useContractRead(
    ['tokenAllowance', tokenAddress, walletAddress, spenderAddress],
    async () => {
      if (!walletAddress) return BigInt(0);
      const contract = getERC20Contract(tokenAddress);
      return await contract.read.allowance([walletAddress, spenderAddress]);
    },
    {
      enabled: !!walletAddress && !!spenderAddress,
    }
  );
}

// Token approve hook
export function useTokenApprove(tokenAddress: Address) {
  const { walletClient } = useWallet();

  return useContractWrite(
    async ({ spender, amount }: { spender: Address; amount: bigint }) => {
      if (!walletClient) throw new Error('Wallet client not available');
      const contract = getERC20Contract(tokenAddress, walletClient);
      
      console.log('Approve parameters:', { 
        tokenAddress, 
        spender, 
        amount: amount.toString() 
      });
      
      // Try to estimate gas first
      try {
        const gasEstimate = await (contract.estimateGas as any).approve([spender, amount]);
        console.log('Approve gas estimate successful:', gasEstimate);
        
        // Add 20% buffer to gas estimate
        const gasLimit = gasEstimate + (gasEstimate / BigInt(5));
        console.log('Using gas limit for approve:', gasLimit);
        
        return await contract.write.approve([spender, amount], { gas: gasLimit });
      } catch (gasError: any) {
        console.error('Approve gas estimation failed:', gasError);
        console.log('Proceeding without gas estimation for approve...');
        
        // Fallback: try without gas estimation
        return await contract.write.approve([spender, amount]);
      }
    },
    {
      invalidateQueries: [['tokenAllowance', tokenAddress]],
    }
  );
}

// Mint tokens hook (for testing)
export function useMintTokens(tokenAddress: Address) {
  const { walletClient, walletAddress } = useWallet();

  return useContractWrite(
    async ({ amount }: { amount: bigint }) => {
      if (!walletClient || !walletAddress) throw new Error('Wallet not available');
      const contract = getERC20Contract(tokenAddress, walletClient);
      return await contract.write.mint([walletAddress, amount]);
    },
    {
      invalidateQueries: [['tokenBalance', tokenAddress]],
    }
  );
}

// Combined token data hook for dashboard
export function useAllTokenBalances() {
  const { walletAddress } = useWallet();

  return useMultipleContractReads(
    ['allTokenBalances', walletAddress],
    {
      stAVAX: async () => {
        if (!walletAddress) return BigInt(0);
        const contract = getMockStAVAXContract();
        return await contract.read.balanceOf([walletAddress]);
      },
      usdce: async () => {
        if (!walletAddress) return BigInt(0);
        const contract = getMockUSDCEContract();
        return await contract.read.balanceOf([walletAddress]);
      },
      ptToken: async () => {
        if (!walletAddress) return BigInt(0);
        const contract = getPTTokenContract();
        return await contract.read.balanceOf([walletAddress]);
      },
      ytToken: async () => {
        if (!walletAddress) return BigInt(0);
        const contract = getYTTokenContract();
        return await contract.read.balanceOf([walletAddress]);
      },
    },
    {
      enabled: !!walletAddress,
    }
  );
}

// Helper function to format token data for UI
export function formatTokenData(balance: bigint, info: any) {
  return {
    balance: formatTokenAmount(balance),
    balanceRaw: balance,
    name: info?.name || '',
    symbol: info?.symbol || '',
    apy: info?.yieldRateBps ? calculateAPY(info.yieldRateBps) : 0,
  };
}