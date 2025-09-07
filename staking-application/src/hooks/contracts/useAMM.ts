import type { Address } from 'viem';
import { usePetraWallet } from '@/contexts/PetraWalletContext';
import { useContractRead, useMultipleContractReads } from '../useContractRead';
import { useContractWrite } from '../useContractWrite';
import { getPTAMMContract, getYTAMMContract } from '@/lib/viem/contracts';
import { formatTokenAmount, calculatePriceImpact } from '@/lib/viem/utils';

// AMM reserves and info
export function useAMMInfo(ammType: 'pt' | 'yt') {
  return useMultipleContractReads(
    ['ammInfo', ammType],
    {
      tokenA: async () => {
        const contract = ammType === 'pt' ? getPTAMMContract() : getYTAMMContract();
        return await contract.read.tokenA();
      },
      tokenB: async () => {
        const contract = ammType === 'pt' ? getPTAMMContract() : getYTAMMContract();
        return await contract.read.tokenB();
      },
      reserves: async () => {
        const contract = ammType === 'pt' ? getPTAMMContract() : getYTAMMContract();
        const reserveA = await contract.read.reserveA();
        const reserveB = await contract.read.reserveB();
        return { reserveA, reserveB };
      },
    }
  );
}

// User's LP token balance - SimpleAMM doesn't have LP tokens, so return 0
export function useAMMLPBalance(ammType: 'pt' | 'yt') {
  const { walletAddress } = useWallet();

  return useContractRead(
    ['ammLPBalance', ammType, walletAddress],
    async () => {
      // SimpleAMM contract doesn't have LP tokens or balanceOf function
      // This is a simple AMM that just holds reserves
      return BigInt(0);
    },
    {
      enabled: !!walletAddress,
    }
  );
}

// Get swap amount out
export function useSwapAmountOut(ammType: 'pt' | 'yt', amountIn: bigint, isAtoB: boolean) {
  const ammInfo = useAMMInfo(ammType);
  
  return useContractRead(
    ['swapAmountOut', ammType, amountIn.toString(), isAtoB],
    async () => {
      if (amountIn === BigInt(0) || !ammInfo.data?.reserves) return BigInt(0);
      const contract = ammType === 'pt' ? getPTAMMContract() : getYTAMMContract();
      const { reserveA, reserveB } = ammInfo.data.reserves;
      
      // Calculate based on swap direction
      if (isAtoB) {
        return await contract.read.getAmountOut([amountIn, reserveA, reserveB]);
      } else {
        return await contract.read.getAmountOut([amountIn, reserveB, reserveA]);
      }
    },
    {
      enabled: amountIn > BigInt(0) && !!ammInfo.data?.reserves,
    }
  );
}

// Add liquidity to AMM
export function useAddLiquidity(ammType: 'pt' | 'yt') {
  const { walletClient } = useWallet();

  return useContractWrite(
    async (params: { amountA: bigint; amountB: bigint }) => {
      if (!walletClient) throw new Error('Wallet client not available');
      const contract = ammType === 'pt' ? getPTAMMContract(walletClient) : getYTAMMContract(walletClient);
      
      console.log('Add liquidity raw params:', params);
      
      const { amountA, amountB } = params;
      console.log('Add liquidity parameters received:', { 
        ammType, 
        amountA: amountA?.toString() || 'undefined', 
        amountB: amountB?.toString() || 'undefined',
        amountAType: typeof amountA,
        amountBType: typeof amountB
      });
      
      // Validate parameters
      if (!amountA || !amountB) {
        throw new Error(`Invalid amounts: amountA=${amountA}, amountB=${amountB}`);
      }
      
      // Try to estimate gas first
      try {
        console.log('Attempting gas estimation with params:', amountA, amountB);
        const gasEstimate = await contract.estimateGas.addLiquidity(amountA, amountB);
        console.log('Add liquidity gas estimate successful:', gasEstimate);
        
        // Add 20% buffer to gas estimate
        const gasLimit = gasEstimate + (gasEstimate / BigInt(5));
        console.log('Using gas limit for add liquidity:', gasLimit);
        
        return await contract.write.addLiquidity(amountA, amountB, { gas: gasLimit });
      } catch (gasError: any) {
        console.error('Add liquidity gas estimation failed:', gasError);
        console.log('Proceeding without gas estimation for add liquidity...');
        
        // Fallback: try without gas estimation
        return await contract.write.addLiquidity(amountA, amountB);
      }
    },
    {
      invalidateQueries: [
        ['ammInfo', ammType],
        ['ammLPBalance', ammType],
        ['allTokenBalances'],
      ],
    }
  );
}

// Remove liquidity from AMM
export function useRemoveLiquidity(ammType: 'pt' | 'yt') {
  const { walletClient } = useWallet();

  return useContractWrite(
    async ({ liquidity }: { liquidity: bigint }) => {
      if (!walletClient) throw new Error('Wallet client not available');
      const contract = ammType === 'pt' ? getPTAMMContract(walletClient) : getYTAMMContract(walletClient);
      return await contract.write.removeLiquidity([liquidity]);
    },
    {
      invalidateQueries: [
        ['ammInfo', ammType],
        ['ammLPBalance', ammType],
        ['allTokenBalances'],
      ],
    }
  );
}

// Swap tokens on AMM
export function useSwapTokens(ammType: 'pt' | 'yt') {
  const { walletClient } = useWallet();

  return useContractWrite(
    async ({ amountIn, isAtoB }: { amountIn: bigint; isAtoB: boolean }) => {
      if (!walletClient) throw new Error('Wallet client not available');
      const contract = ammType === 'pt' ? getPTAMMContract(walletClient) : getYTAMMContract(walletClient);
      // Use specific swap functions based on direction
      if (isAtoB) {
        return await contract.write.swapAforB([amountIn]);
      } else {
        return await contract.write.swapBforA([amountIn]);
      }
    },
    {
      invalidateQueries: [
        ['ammInfo', ammType],
        ['allTokenBalances'],
      ],
    }
  );
}

// Combined AMM dashboard data
export function useAMMDashboard() {
  const ptAMMInfo = useAMMInfo('pt');
  const ytAMMInfo = useAMMInfo('yt');
  const ptLPBalance = useAMMLPBalance('pt');
  const ytLPBalance = useAMMLPBalance('yt');

  const isLoading = ptAMMInfo.isLoading || ytAMMInfo.isLoading || ptLPBalance.isLoading || ytLPBalance.isLoading;
  const error = ptAMMInfo.error || ytAMMInfo.error || ptLPBalance.error || ytLPBalance.error;

  return {
    data: {
      ptAMM: {
        tokenA: ptAMMInfo.data?.tokenA,
        tokenB: ptAMMInfo.data?.tokenB,
        reserves: ptAMMInfo.data?.reserves,
        userLPBalance: ptLPBalance.data || BigInt(0),
        totalLiquidity: ptAMMInfo.data?.reserves ? 
          ptAMMInfo.data.reserves.reserveA + ptAMMInfo.data.reserves.reserveB : BigInt(0),
      },
      ytAMM: {
        tokenA: ytAMMInfo.data?.tokenA,
        tokenB: ytAMMInfo.data?.tokenB,
        reserves: ytAMMInfo.data?.reserves,
        userLPBalance: ytLPBalance.data || BigInt(0),
        totalLiquidity: ytAMMInfo.data?.reserves ? 
          ytAMMInfo.data.reserves.reserveA + ytAMMInfo.data.reserves.reserveB : BigInt(0),
      },
    },
    isLoading,
    error: error?.message,
    refetch: () => {
      ptAMMInfo.refetch();
      ytAMMInfo.refetch();
      ptLPBalance.refetch();
      ytLPBalance.refetch();
    },
  };
}

// Calculate optimal swap amounts and price impact
export function useSwapCalculation(
  ammType: 'pt' | 'yt',
  amountIn: bigint,
  isAtoB: boolean,
  slippageTolerance: number = 0.5 // 0.5%
) {
  const ammInfo = useAMMInfo(ammType);
  const amountOut = useSwapAmountOut(ammType, amountIn, isAtoB);

  const calculationData = {
    amountOut: amountOut.data || BigInt(0),
    priceImpact: 0,
    minimumAmountOut: BigInt(0),
    isValidSwap: false,
  };

  if (ammInfo.data?.reserves && amountIn > BigInt(0) && amountOut.data) {
    const { reserveA, reserveB } = ammInfo.data.reserves;
    
    // Determine which reserve corresponds to tokenIn
    const isTokenA = tokenIn === ammInfo.data.tokenA;
    const reserveIn = isTokenA ? reserveA : reserveB;
    const reserveOut = isTokenA ? reserveB : reserveA;
    
    calculationData.priceImpact = calculatePriceImpact(amountIn, reserveIn, reserveOut);
    calculationData.minimumAmountOut = (amountOut.data * BigInt(Math.floor((100 - slippageTolerance) * 100))) / BigInt(10000);
    calculationData.isValidSwap = amountOut.data > BigInt(0) && calculationData.priceImpact < 10; // Max 10% price impact
  }

  return {
    ...amountOut,
    data: calculationData,
  };
}

// Hook to get all AMM pairs with their current prices
export function useAllAMMPairs() {
  const ptAMM = useAMMInfo('pt');
  const ytAMM = useAMMInfo('yt');

  const isLoading = ptAMM.isLoading || ytAMM.isLoading;
  const error = ptAMM.error || ytAMM.error;

  const pairs = [];
  
  if (ptAMM.data?.reserves && ptAMM.data.reserves.reserveA > BigInt(0) && ptAMM.data.reserves.reserveB > BigInt(0)) {
    const price = Number(ptAMM.data.reserves.reserveB) / Number(ptAMM.data.reserves.reserveA);
    pairs.push({
      name: 'PT/USDC.e',
      type: 'pt' as const,
      tokenA: ptAMM.data.tokenA,
      tokenB: ptAMM.data.tokenB,
      reserves: ptAMM.data.reserves,
      price: price.toFixed(4),
      tvl: formatTokenAmount(ptAMM.data.reserves.reserveA + ptAMM.data.reserves.reserveB, 18, 2),
    });
  }

  if (ytAMM.data?.reserves && ytAMM.data.reserves.reserveA > BigInt(0) && ytAMM.data.reserves.reserveB > BigInt(0)) {
    const price = Number(ytAMM.data.reserves.reserveB) / Number(ytAMM.data.reserves.reserveA);
    pairs.push({
      name: 'YT/USDC.e',
      type: 'yt' as const,
      tokenA: ytAMM.data.tokenA,
      tokenB: ytAMM.data.tokenB,
      reserves: ytAMM.data.reserves,
      price: price.toFixed(4),
      tvl: formatTokenAmount(ytAMM.data.reserves.reserveA + ytAMM.data.reserves.reserveB, 18, 2),
    });
  }

  return {
    data: pairs,
    isLoading,
    error: error?.message,
    refetch: () => {
      ptAMM.refetch();
      ytAMM.refetch();
    },
  };
}