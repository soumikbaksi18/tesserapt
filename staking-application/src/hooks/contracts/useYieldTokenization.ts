import { parseEther } from 'viem';
import type { Address } from 'viem';
import { usePetraWallet } from '@/contexts/PetraWalletContext';
import { useContractRead, useMultipleContractReads } from '../useContractRead';
import { useContractWrite } from '../useContractWrite';
import { getYieldTokenizationContract, getSYWrapperContract, getERC20Contract } from '@/lib/viem/contracts';
import { formatTokenAmount, formatTimeToMaturity, timestampToDate } from '@/lib/viem/utils';

// Get all maturities
export function useMaturities() {
  return useContractRead(
    ['maturities'],
    async () => {
      const contract = getYieldTokenizationContract();
      return await contract.read.getMaturities();
    }
  );
}

// Get PT and YT token addresses for a maturity
export function useMaturityTokens(maturity: bigint) {
  return useMultipleContractReads(
    ['maturityTokens', maturity.toString()],
    {
      ptToken: async () => {
        const contract = getYieldTokenizationContract();
        return await contract.read.ptTokens([maturity]);
      },
      ytToken: async () => {
        const contract = getYieldTokenizationContract();
        return await contract.read.ytTokens([maturity]);
      },
    },
    {
      enabled: maturity > BigInt(0),
    }
  );
}

// Preview split operation (simplified - 1:1 ratio since no preview function exists)
export function usePreviewSplit(syAmount: bigint, maturity: bigint) {
  return {
    data: syAmount > BigInt(0) && maturity > BigInt(0) 
      ? { ptAmount: syAmount, ytAmount: syAmount } 
      : { ptAmount: BigInt(0), ytAmount: BigInt(0) },
    isLoading: false,
    error: null,
  };
}

// Split SY tokens into PT + YT
export function useSplitTokens() {
  const { walletClient } = useWallet();

  return useContractWrite(
    async ({ syAmount, maturity }: { syAmount: bigint; maturity: bigint }) => {
      if (!walletClient) throw new Error('Wallet client not available');
      const contract = getYieldTokenizationContract(walletClient);
      
      console.log('Split parameters:', { syAmount: syAmount.toString(), maturity: maturity.toString() });
      
      // Validate maturity is in the future
      const currentTime = Math.floor(Date.now() / 1000);
      if (Number(maturity) <= currentTime) {
        throw new Error(`Invalid maturity: ${maturity} is not in the future (current: ${currentTime})`);
      }
      
      // Check if maturity exists in the contract
      try {
        const maturities = await contract.read.getMaturities();
        const maturityExists = Array.isArray(maturities) && maturities.some((m: any) => BigInt(m) === maturity);
        if (!maturityExists) {
          console.warn('Maturity not found in contract maturities, but proceeding anyway');
        }
      } catch (maturityError) {
        console.log('Could not check maturity existence, proceeding anyway');
      }
      
      // Check if contract is paused (if it has a paused function)
      try {
        const isPaused = await (contract.read as any).paused?.();
        if (isPaused) {
          throw new Error('Yield tokenization contract is paused');
        }
      } catch (pauseError) {
        console.log('Contract does not have paused function or error checking pause status');
      }
      
      // Try to estimate gas first
      try {
        const gasEstimate = await (contract.estimateGas as any).split([syAmount, maturity]);
        console.log('Split gas estimate successful:', gasEstimate);
        
        // Add 20% buffer to gas estimate
        const gasLimit = gasEstimate + (gasEstimate / BigInt(5));
        console.log('Using gas limit for split:', gasLimit);
        
        return await contract.write.split([syAmount, maturity], { gas: gasLimit });
      } catch (gasError: any) {
        console.error('Split gas estimation failed:', gasError);
        console.log('Proceeding without gas estimation for split...');
        
        // Fallback: try without gas estimation
        return await contract.write.split([syAmount, maturity]);
      }
    },
    {
      invalidateQueries: [
        ['syBalance'],
        ['ptTokenBalance'],
        ['ytTokenBalance'],
        ['allTokenBalances'],
      ],
    }
  );
}

// Combine PT + YT tokens back to SY (using redeem function)
export function useCombineTokens() {
  const { walletClient } = useWallet();

  return useContractWrite(
    async ({ amount, maturity }: { amount: bigint; maturity: bigint }) => {
      if (!walletClient) throw new Error('Wallet client not available');
      const contract = getYieldTokenizationContract(walletClient);
      // Note: redeem function takes amount and maturity - user must have equal PT+YT amounts
      return await contract.write.redeem([amount, maturity]);
    },
    {
      invalidateQueries: [
        ['syBalance'],
        ['ptTokenBalance'],
        ['ytTokenBalance'],
        ['allTokenBalances'],
      ],
    }
  );
}

// Create new maturity
export function useCreateMaturity() {
  const { walletClient } = useWallet();

  return useContractWrite(
    async ({ maturity }: { maturity: bigint }) => {
      if (!walletClient) throw new Error('Wallet client not available');
      const contract = getYieldTokenizationContract(walletClient);
      return await contract.write.createMaturity([maturity]);
    },
    {
      invalidateQueries: [['maturities']],
    }
  );
}

// Get formatted maturity data for UI
export function useFormattedMaturities() {
  const maturitiesQuery = useMaturities();

  const formattedData = (Array.isArray(maturitiesQuery.data) ? maturitiesQuery.data : []).map((maturity: bigint) => ({
    timestamp: maturity,
    date: timestampToDate(maturity),
    timeToMaturity: formatTimeToMaturity(maturity),
    isActive: maturity > BigInt(Math.floor(Date.now() / 1000)),
    label: maturity > BigInt(Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60)) ? '6-month' : '3-month',
  })) || [];

  return {
    ...maturitiesQuery,
    data: formattedData,
  };
}

// Combined yield tokenization dashboard data
export function useYieldTokenizationDashboard() {
  const { walletAddress } = useWallet();
  const maturities = useMaturities();
  const syBalance = useContractRead(
    ['syBalance', walletAddress],
    async () => {
      if (!walletAddress) return BigInt(0);
      const contract = getSYWrapperContract();
      return await contract.read.balanceOf([walletAddress]);
    },
    {
      enabled: !!walletAddress,
    }
  );

  const isLoading = maturities.isLoading || syBalance.isLoading;
  const error = maturities.error || syBalance.error;

  return {
    data: {
      availableSY: syBalance.data || BigInt(0),
      maturities: maturities.data || [],
      activeMaturities: (Array.isArray(maturities.data) ? maturities.data : []).filter((m: bigint) => m > BigInt(Math.floor(Date.now() / 1000))),
    },
    isLoading,
    error: error?.message,
    refetch: () => {
      maturities.refetch();
      syBalance.refetch();
    },
  };
}

// Hook to get split pool data for a specific maturity
export function useSplitPoolData(maturity: bigint) {
  const { walletAddress } = useWallet();
  const maturityTokens = useMaturityTokens(maturity);
  
  const poolData = useMultipleContractReads(
    ['splitPoolData', maturity.toString(), walletAddress],
    {
      ptBalance: async () => {
        if (!walletAddress || !maturityTokens.data?.ptToken) return BigInt(0);
        const contract = getERC20Contract(maturityTokens.data.ptToken as Address);
        return await contract.read.balanceOf([walletAddress]);
      },
      ytBalance: async () => {
        if (!walletAddress || !maturityTokens.data?.ytToken) return BigInt(0);
        const contract = getERC20Contract(maturityTokens.data.ytToken as Address);
        return await contract.read.balanceOf([walletAddress]);
      },
    },
    {
      enabled: !!walletAddress && !!maturityTokens.data,
    }
  );

  const isLoading = maturityTokens.isLoading || poolData.isLoading;
  const error = maturityTokens.error || poolData.error;

  return {
    data: {
      maturity,
      ptToken: maturityTokens.data?.ptToken,
      ytToken: maturityTokens.data?.ytToken,
      ptBalance: poolData.data?.ptBalance || BigInt(0),
      ytBalance: poolData.data?.ytBalance || BigInt(0),
      timeToMaturity: formatTimeToMaturity(maturity),
      isActive: maturity > BigInt(Math.floor(Date.now() / 1000)),
    },
    isLoading,
    error: error?.message,
    refetch: () => {
      maturityTokens.refetch();
      poolData.refetch();
    },
  };
}

// Check yield tokenization contract status
export function useYieldTokenizationStatus() {
  return useContractRead(
    ['yieldTokenizationStatus'],
    async () => {
      const contract = getYieldTokenizationContract();
      
      try {
        const [
          syTokenAddress,
          maturities
        ] = await Promise.all([
          contract.read.syToken(),
          contract.read.getMaturities()
        ]);
        
        return {
          syTokenAddress,
          maturities: Array.isArray(maturities) ? maturities : [],
          maturityCount: Array.isArray(maturities) ? maturities.length : 0
        };
      } catch (error) {
        console.error('Error fetching yield tokenization status:', error);
        return {
          syTokenAddress: '0x0000000000000000000000000000000000000000',
          maturities: [],
          maturityCount: 0
        };
      }
    }
  );
}