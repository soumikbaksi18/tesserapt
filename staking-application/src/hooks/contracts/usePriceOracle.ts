import type { Address } from 'viem';
import { usePetraWallet } from '@/contexts/PetraWalletContext';
import { useContractRead, useMultipleContractReads } from '../useContractRead';
import { useContractWrite } from '../useContractWrite';
import { getPriceOracleContract, getYTAutoConverterContract } from '@/lib/viem/contracts';
import { formatUSDPrice, formatBasisPoints } from '@/lib/viem/utils';
import { getContractAddress, AVALANCHE_FUJI_CHAIN_ID } from '@/lib/contracts/config';

// Oracle health check
export function useOracleHealth() {
  return useMultipleContractReads(
    ['oracleHealth'],
    {
      isHealthy: async () => {
        const contract = getPriceOracleContract();
        return await contract.read.isHealthy();
      },
      heartbeat: async () => {
        const contract = getPriceOracleContract();
        return await contract.read.getHeartbeat();
      },
    }
  );
}

// Get latest price for a token
export function useTokenPrice(tokenAddress: Address) {
  return useContractRead(
    ['tokenPrice', tokenAddress],
    async () => {
      const contract = getPriceOracleContract();
      const [price, timestamp] = await contract.read.getLatestPrice([tokenAddress]);
      return { price, timestamp };
    },
    {
      enabled: !!tokenAddress,
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );
}

// Check if price is within threshold
export function usePriceThresholdCheck(tokenAddress: Address, threshold: bigint) {
  return useContractRead(
    ['priceThreshold', tokenAddress, threshold.toString()],
    async () => {
      const contract = getPriceOracleContract();
      return await contract.read.isPriceWithinThreshold([tokenAddress, threshold]);
    },
    {
      enabled: !!tokenAddress && threshold > BigInt(0),
    }
  );
}

// Check if threshold has been reached for auto-conversion
export function useThresholdReached(tokenAddress: Address) {
  return useContractRead(
    ['thresholdReached', tokenAddress],
    async () => {
      const contract = getPriceOracleContract();
      return await contract.read.thresholdReached([tokenAddress]);
    },
    {
      enabled: !!tokenAddress,
      refetchInterval: 15000, // Check every 15 seconds
    }
  );
}

// Get all token prices
export function useAllTokenPrices() {
  const stAVAXAddress = getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'mockStAVAX');
  const usdceAddress = getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'mockUSDCE');
  const ptTokenAddress = getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'ptToken');
  const ytTokenAddress = getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'ytToken');

  return useMultipleContractReads(
    ['allTokenPrices'],
    {
      stAVAX: async () => {
        try {
          const contract = getPriceOracleContract();
          const [price, timestamp] = await contract.read.getLatestPrice([stAVAXAddress]);
          return { price, timestamp, hasPrice: true };
        } catch {
          return { price: BigInt(0), timestamp: BigInt(0), hasPrice: false };
        }
      },
      usdce: async () => {
        try {
          const contract = getPriceOracleContract();
          const [price, timestamp] = await contract.read.getLatestPrice([usdceAddress]);
          return { price, timestamp, hasPrice: true };
        } catch {
          return { price: BigInt(0), timestamp: BigInt(0), hasPrice: false };
        }
      },
      ptToken: async () => {
        try {
          const contract = getPriceOracleContract();
          const [price, timestamp] = await contract.read.getLatestPrice([ptTokenAddress]);
          return { price, timestamp, hasPrice: true };
        } catch {
          return { price: BigInt(0), timestamp: BigInt(0), hasPrice: false };
        }
      },
      ytToken: async () => {
        try {
          const contract = getPriceOracleContract();
          const [price, timestamp] = await contract.read.getLatestPrice([ytTokenAddress]);
          return { price, timestamp, hasPrice: true };
        } catch {
          return { price: BigInt(0), timestamp: BigInt(0), hasPrice: false };
        }
      },
    },
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );
}

// Auto-converter hooks
export function useAutoConverterConfig() {
  const { walletAddress } = useWallet();

  return useContractRead(
    ['autoConverterConfig', walletAddress],
    async () => {
      if (!walletAddress) return { enabled: false, thresholdPrice: BigInt(0) };
      const contract = getYTAutoConverterContract();
      const [enabled, thresholdPrice] = await contract.read.getUserConfig([walletAddress]);
      return { enabled, thresholdPrice };
    },
    {
      enabled: !!walletAddress,
    }
  );
}

// Update auto-converter configuration
export function useUpdateAutoConverter() {
  const { walletClient } = useWallet();

  return useContractWrite(
    async ({ enabled, thresholdPrice }: { enabled: boolean; thresholdPrice: bigint }) => {
      if (!walletClient) throw new Error('Wallet client not available');
      const contract = getYTAutoConverterContract(walletClient);
      return await contract.write.updateUserConfig([enabled, thresholdPrice]);
    },
    {
      invalidateQueries: [['autoConverterConfig']],
    }
  );
}

// Convert YT to PT
export function useConvertYTToPT() {
  const { walletClient, walletAddress } = useWallet();

  return useContractWrite(
    async ({ ytAmount }: { ytAmount: bigint }) => {
      if (!walletClient || !walletAddress) throw new Error('Wallet not available');
      const contract = getYTAutoConverterContract(walletClient);
      return await contract.write.convertYTToPT([walletAddress, ytAmount]);
    },
    {
      invalidateQueries: [
        ['ytTokenBalance'],
        ['ptTokenBalance'],
        ['allTokenBalances'],
      ],
    }
  );
}

// Price oracle dashboard data
export function usePriceOracleDashboard() {
  const oracleHealth = useOracleHealth();
  const allPrices = useAllTokenPrices();
  const stAVAXThreshold = useThresholdReached(getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'mockStAVAX'));

  const isLoading = oracleHealth.isLoading || allPrices.isLoading || stAVAXThreshold.isLoading;
  const error = oracleHealth.error || allPrices.error || stAVAXThreshold.error;

  return {
    data: {
      isHealthy: oracleHealth.data?.isHealthy || false,
      heartbeat: oracleHealth.data?.heartbeat || BigInt(0),
      prices: {
        stAVAX: allPrices.data?.stAVAX || { price: BigInt(0), timestamp: BigInt(0), hasPrice: false },
        usdce: allPrices.data?.usdce || { price: BigInt(0), timestamp: BigInt(0), hasPrice: false },
        ptToken: allPrices.data?.ptToken || { price: BigInt(0), timestamp: BigInt(0), hasPrice: false },
        ytToken: allPrices.data?.ytToken || { price: BigInt(0), timestamp: BigInt(0), hasPrice: false },
      },
      thresholdReached: stAVAXThreshold.data || false,
    },
    isLoading,
    error: error?.message,
    refetch: () => {
      oracleHealth.refetch();
      allPrices.refetch();
      stAVAXThreshold.refetch();
    },
  };
}

// Format price data for UI display
export function formatPriceData(priceData: { price: bigint; timestamp: bigint; hasPrice: boolean }) {
  if (!priceData.hasPrice || priceData.price === BigInt(0)) {
    return {
      priceUSD: 'N/A',
      lastUpdated: 'Never',
      isStale: true,
    };
  }

  const now = Math.floor(Date.now() / 1000);
  const lastUpdated = Number(priceData.timestamp);
  const isStale = now - lastUpdated > 300; // 5 minutes

  return {
    priceUSD: formatUSDPrice(priceData.price),
    lastUpdated: new Date(lastUpdated * 1000).toLocaleString(),
    isStale,
  };
}