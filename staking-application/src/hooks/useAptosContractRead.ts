import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import { usePetraWallet } from '@/contexts/PetraWalletContext';

// Generic hook for Aptos contract read operations
export function useAptosContractRead<TData = unknown>(
  queryKey: string[],
  contractFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>
) {
  const { isConnected } = usePetraWallet();

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!isConnected) {
        throw new Error('Petra wallet not connected');
      }
      
      try {
        return await contractFn();
      } catch (error) {
        console.error('Contract read error:', error);
        throw error;
      }
    },
    enabled: isConnected && (options?.enabled !== false),
    retry: 1,
    staleTime: 30000, // 30 seconds
    ...options,
  });
}
