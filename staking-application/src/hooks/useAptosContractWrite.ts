import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePetraWallet } from '@/contexts/PetraWalletContext';

interface AptosContractWriteOptions<TData = unknown, TVariables = unknown> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void;
  invalidateQueries?: string[][];
}

// Generic hook for Aptos contract write operations
export function useAptosContractWrite<TVariables = unknown, TData = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: AptosContractWriteOptions<TData, TVariables>
) {
  const { isConnected } = usePetraWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables): Promise<TData> => {
      if (!isConnected) {
        throw new Error('Petra wallet not connected');
      }
      
      return await mutationFn(variables);
    },
    onSuccess: (data, variables) => {
      options?.onSuccess?.(data, variables);
      
      // Invalidate specified queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
    },
    onError: (error: Error, variables) => {
      options?.onError?.(error, variables);
    },
    onSettled: (data, error, variables) => {
      options?.onSettled?.(data, error, variables);
    },
  });
}
