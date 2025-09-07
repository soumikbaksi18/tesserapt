import { parseEther } from 'viem';
import type { Address } from 'viem';
import { usePetraWallet } from '@/contexts/PetraWalletContext';
import { useContractRead, useMultipleContractReads } from '../useContractRead';
import { useContractWrite } from '../useContractWrite';
import { getSYWrapperContract, getStakingDappContract } from '@/lib/viem/contracts';
import { getContractAddress, AVALANCHE_FUJI_CHAIN_ID } from '@/lib/contracts/config';
import { formatTokenAmount, calculateAPY } from '@/lib/viem/utils';
import { useStAVAXBalance, useStAVAXInfo } from './useTokens';

// SY Wrapper hooks for stAVAX wrapping
export function useSYWrapperInfo() {
  return useMultipleContractReads(
    ['syWrapperInfo'],
    {
      name: async () => {
        const contract = getSYWrapperContract();
        return await contract.read.name();
      },
      symbol: async () => {
        const contract = getSYWrapperContract();
        return await contract.read.symbol();
      },
      totalSupply: async () => {
        const contract = getSYWrapperContract();
        return await contract.read.totalSupply();
      },
      underlyingTokens: async () => {
        const contract = getSYWrapperContract();
        return await contract.read.getUnderlyingTokens();
      },
    }
  );
}

export function useSYBalance() {
  const { walletAddress } = useWallet();

  return useContractRead(
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
}

// Get token count and setup info
export function useTokenSetup() {
  return useContractRead(
    ['tokenSetup'],
    async () => {
      const contract = getSYWrapperContract();
      const tokenCount = await contract.read.tokenCount();
      
      const tokens = [];
      for (let i = 0; i < Number(tokenCount); i++) {
        const tokenInfo = await contract.read.tokens([BigInt(i)]) as [string, bigint, boolean];
        tokens.push({
          index: i,
          address: tokenInfo[0],
          ratio: tokenInfo[1],
          isEnabled: tokenInfo[2]
        });
      }
      
      return { tokenCount, tokens };
    }
  );
}

// Check wrapper contract status
export function useWrapperStatus() {
  return useContractRead(
    ['wrapperStatus'],
    async () => {
      const contract = getSYWrapperContract();
      
      const [
        isPaused,
        yieldRate,
        name,
        symbol,
        totalSupply
      ] = await Promise.all([
        contract.read.paused(),
        contract.read.yieldRateBps(),
        contract.read.name(),
        contract.read.symbol(),
        contract.read.totalSupply()
      ]);
      
      return {
        isPaused,
        yieldRate,
        name,
        symbol,
        totalSupply
      };
    }
  );
}

// Wrap stAVAX to SY tokens
export function useWrapTokens() {
  const { walletClient } = useWallet();

  return useContractWrite(
    async ({ amount, tokenIndex = 0 }: { amount: bigint; tokenIndex?: number }) => {
      if (!walletClient) throw new Error('Wallet client not available');
      const contract = getSYWrapperContract(walletClient);
      
      // Get token count to create amounts array
      const tokenCount = await contract.read.tokenCount();
      console.log('Token count:', tokenCount);
      
      // Check if contract is paused
      const isPaused = await contract.read.paused();
      if (isPaused) {
        throw new Error('Wrapper contract is paused');
      }
      
      // Verify token at index is enabled
      const tokenInfo = await contract.read.tokens([BigInt(tokenIndex)]) as [string, bigint, boolean];
      console.log('Token info at index', tokenIndex, ':', tokenInfo);
      
      if (!tokenInfo[2]) {
        throw new Error(`Token at index ${tokenIndex} is not enabled`);
      }
      
      const amounts = new Array(Number(tokenCount)).fill(BigInt(0));
      amounts[tokenIndex] = amount;
      
      console.log('Calling wrap with amounts:', amounts);
      
      // Try to estimate gas first to see if there are any issues
      try {
        const gasEstimate = await (contract.estimateGas as any).wrap([amounts]);
        console.log('Gas estimate successful:', gasEstimate);
        
        // Add 20% buffer to gas estimate
        const gasLimit = gasEstimate + (gasEstimate / BigInt(5));
        console.log('Using gas limit:', gasLimit);
        
        return await contract.write.wrap([amounts], { gas: gasLimit });
      } catch (gasError: any) {
        console.error('Gas estimation failed:', gasError);
        console.log('Proceeding without gas estimation...');
        
        // Fallback: try without gas estimation
        return await contract.write.wrap([amounts]);
      }
    },
    {
      invalidateQueries: [
        ['syBalance'],
        ['tokenBalance', getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'mockStAVAX')],
      ],
    }
  );
}

// Unwrap SY tokens to stAVAX
export function useUnwrapTokens() {
  const { walletClient } = useWallet();

  return useContractWrite(
    async ({ syAmount }: { syAmount: bigint }) => {
      if (!walletClient) throw new Error('Wallet client not available');
      const contract = getSYWrapperContract(walletClient);
      // Note: unwrap function only takes amount, not tokenIndex
      return await contract.write.unwrap([syAmount]);
    },
    {
      invalidateQueries: [
        ['syBalance'],
        ['tokenBalance', getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'mockStAVAX')],
      ],
    }
  );
}

// Preview wrap operation (simplified - no preview function in ABI)
export function usePreviewWrap(amount: bigint) {
  return useContractRead(
    ['previewWrap', amount.toString()],
    async () => {
      if (amount === BigInt(0)) return BigInt(0);
      // Since there's no previewWrap function in the ABI, we'll use a simple 1:1 ratio
      // In a real implementation, this would use the token ratios from the contract
      return amount;
    },
    {
      enabled: amount > BigInt(0),
    }
  );
}

// Preview unwrap operation (simplified - no preview function in ABI)
export function usePreviewUnwrap(syAmount: bigint) {
  return useContractRead(
    ['previewUnwrap', syAmount.toString()],
    async () => {
      if (syAmount === BigInt(0)) return BigInt(0);
      // Since there's no previewUnwrap function in the ABI, we'll use a simple 1:1 ratio
      // In a real implementation, this would calculate based on token ratios
      return syAmount;
    },
    {
      enabled: syAmount > BigInt(0),
    }
  );
}

// Staking Dapp hooks
export function useStakingInfo() {
  const { walletAddress } = useWallet();

  return useContractRead(
    ['stakingInfo', walletAddress],
    async () => {
      if (!walletAddress) return { stakedAmount: BigInt(0), pendingRewards: BigInt(0) };
      const contract = getStakingDappContract();
      // Use separate functions as per actual ABI
      const stakedAmount = await contract.read.getStakedAmount([walletAddress]);
      const pendingRewards = await contract.read.calculateReward([walletAddress]);
      return { stakedAmount, pendingRewards };
    },
    {
      enabled: !!walletAddress,
    }
  );
}

export function useStakingDappInfo() {
  return useMultipleContractReads(
    ['stakingDappInfo'],
    {
      stakingToken: async () => {
        const contract = getStakingDappContract();
        return await contract.read.stakingToken();
      },
      rewardToken: async () => {
        const contract = getStakingDappContract();
        return await contract.read.rewardToken();
      },
      // Note: totalStaked function doesn't exist in actual ABI
      // We'll calculate this differently or remove if not needed
    }
  );
}

// Stake tokens
export function useStake() {
  const { walletClient } = useWallet();

  return useContractWrite(
    async ({ amount }: { amount: bigint }) => {
      if (!walletClient) throw new Error('Wallet client not available');
      const contract = getStakingDappContract(walletClient);
      return await contract.write.stake([amount]);
    },
    {
      invalidateQueries: [
        ['stakingInfo'],
        ['tokenBalance', getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'mockStAVAX')],
      ],
    }
  );
}

// Unstake tokens
export function useUnstake() {
  const { walletClient } = useWallet();

  return useContractWrite(
    async ({ amount }: { amount: bigint }) => {
      if (!walletClient) throw new Error('Wallet client not available');
      const contract = getStakingDappContract(walletClient);
      return await contract.write.unstake([amount]);
    },
    {
      invalidateQueries: [
        ['stakingInfo'],
        ['tokenBalance', getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'mockStAVAX')],
      ],
    }
  );
}

// Claim rewards
export function useClaimRewards() {
  const { walletClient } = useWallet();

  return useContractWrite(
    async () => {
      if (!walletClient) throw new Error('Wallet client not available');
      const contract = getStakingDappContract(walletClient);
      return await contract.write.claimRewards();
    },
    {
      invalidateQueries: [
        ['stakingInfo'],
        ['tokenBalance', getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'mockUSDCE')],
      ],
    }
  );
}

// Combined staking dashboard data
export function useStakingDashboard() {
  const stakingInfo = useStakingInfo();
  const stakingDappInfo = useStakingDappInfo();
  const stAVAXBalance = useStAVAXBalance();
  const stAVAXInfo = useStAVAXInfo();

  const isLoading = stakingInfo.isLoading || stakingDappInfo.isLoading || stAVAXBalance.isLoading || stAVAXInfo.isLoading;
  const error = stakingInfo.error || stakingDappInfo.error || stAVAXBalance.error || stAVAXInfo.error;

  return {
    data: {
      userStaked: stakingInfo.data?.stakedAmount || BigInt(0),
      pendingRewards: stakingInfo.data?.pendingRewards || BigInt(0),
      availableBalance: stAVAXBalance.data || BigInt(0),
      totalStaked: BigInt(0), // totalStaked function not available in actual ABI
      apy: (stAVAXInfo.data?.yieldRateBps && typeof stAVAXInfo.data.yieldRateBps === 'bigint') ? calculateAPY(stAVAXInfo.data.yieldRateBps) : 0,
      tokenSymbol: stAVAXInfo.data?.symbol || 'stAVAX',
      tokenName: stAVAXInfo.data?.name || 'Mock Staked AVAX',
    },
    isLoading,
    error: error?.message,
    refetch: () => {
      stakingInfo.refetch();
      stakingDappInfo.refetch();
      stAVAXBalance.refetch();
      stAVAXInfo.refetch();
    },
  };
}