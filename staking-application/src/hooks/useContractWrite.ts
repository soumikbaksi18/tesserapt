import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';
// import type { Hash } from 'viem';
import { usePetraWallet } from '@/contexts/PetraWalletContext';
// import { parseWeb3Error } from '@/lib/viem/errors';
// import type { Web3Error } from '@/lib/viem/errors';

interface ContractWriteOptions<TData = unknown, TVariables = unknown> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Web3Error, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: Web3Error | null, variables: TVariables) => void;
  invalidateQueries?: string[][];
}

// Generic hook for contract write operations
export function useContractWrite<TVariables = unknown, TData = Hash>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: ContractWriteOptions<TData, TVariables>
) {
  const { isConnected } = usePetraWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables): Promise<TData> => {
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }
      
      // Network check removed for Aptos compatibility

      if (!walletClient) {
        throw new Error('Wallet client not available');
      }

      // Retry mechanism for transaction hash failures
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount <= maxRetries) {
        try {
          return await mutationFn(variables);
        } catch (error: any) {
          retryCount++;
          
          // Check for specific Core wallet errors
          if (error?.message?.includes('disconnected port object')) {
            console.warn('Detected disconnected port, refreshing wallet client...');
            refreshWalletClient();
            throw new Error('Wallet connection lost. Please try again.');
          }
          
          if (error?.message?.includes('Unable to get transaction hash')) {
            console.log(`Transaction hash error (attempt ${retryCount}/${maxRetries + 1}):`, error.message);
            
            if (retryCount <= maxRetries) {
              console.log(`Retrying transaction in 2 seconds...`);
              await new Promise(resolve => setTimeout(resolve, 2000));
              continue;
            }
          }
          
          // If we've exhausted retries or it's a different error, throw it
          const parsedError = parseWeb3Error(error);
          throw parsedError;
        }
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      
      options?.onSuccess?.(data, variables);
    },
    onError: (error: any, variables) => {
      const parsedError = parseWeb3Error(error);
      options?.onError?.(parsedError, variables);
    },
    onSettled: (data, error: any, variables) => {
      const parsedError = error ? parseWeb3Error(error) : null;
      options?.onSettled?.(data, parsedError, variables);
    },
  });
}

// Hook for transaction with confirmation waiting
export function useContractTransaction<TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<Hash>,
  options?: ContractWriteOptions<Hash, TVariables>
) {
  return useContractWrite(mutationFn, options);
}

// Hook for multiple contract writes in sequence
export function useMultipleContractWrites<TVariables = unknown>(
  mutationFns: ((variables: TVariables) => Promise<Hash>)[],
  options?: ContractWriteOptions<Hash[], TVariables>
) {
  return useContractWrite(
    async (variables: TVariables): Promise<Hash[]> => {
      const results: Hash[] = [];
      
      for (const fn of mutationFns) {
        const result = await fn(variables);
        results.push(result);
      }
      
      return results;
    },
    options
  );
}