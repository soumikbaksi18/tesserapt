import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { Address } from 'viem';
import { usePetraWallet } from '@/contexts/PetraWalletContext';
import { parseWeb3Error } from '@/lib/viem/errors';

// Generic hook for contract read operations
export function useContractRead<TData = unknown>(
  queryKey: string[],
  contractFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>
) {
  const { isConnected } = usePetraWallet();

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await contractFn();
      } catch (error) {
        const parsedError = parseWeb3Error(error);
        throw new Error(parsedError.userMessage);
      }
    },
    enabled: isConnected && (options?.enabled ?? true),
    staleTime: 30000, // 30 seconds
    retry: 2,
    ...options,
  });
}

// Hook for reading multiple contract values at once
export function useMultipleContractReads<TData extends Record<string, unknown>>(
  queryKey: string[],
  contractCalls: Record<keyof TData, () => Promise<TData[keyof TData]>>,
  options?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>
) {
  const { isConnected } = usePetraWallet();

  return useQuery({
    queryKey,
    queryFn: async (): Promise<TData> => {
      try {
        const results = await Promise.all(
          Object.entries(contractCalls).map(async ([key, fn]) => [
            key,
            await (fn as () => Promise<unknown>)(),
          ])
        );
        
        return Object.fromEntries(results) as TData;
      } catch (error) {
        const parsedError = parseWeb3Error(error);
        throw new Error(parsedError.userMessage);
      }
    },
    enabled: isConnected && (options?.enabled ?? true),
    staleTime: 30000,
    retry: 2,
    ...options,
  });
}