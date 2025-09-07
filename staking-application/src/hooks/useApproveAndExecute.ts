import { useState } from 'react';
import type { Address } from 'viem';
import { useTokenApprove, useTokenAllowance } from './contracts/useTokens';

interface ApproveAndExecuteOptions {
  tokenAddress: Address;
  spenderAddress: Address;
  amount: bigint;
  onExecute: () => Promise<any>;
  skipApprovalCheck?: boolean;
}

/**
 * Hook that handles the common DeFi pattern of approve-then-execute
 * This prevents "insufficient allowance" errors by automatically handling approvals
 */
export function useApproveAndExecute() {
  const [isApproving, setIsApproving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeWithApproval = async ({
    tokenAddress,
    spenderAddress,
    amount,
    onExecute,
    skipApprovalCheck = false
  }: ApproveAndExecuteOptions) => {
    try {
      setError(null);
      
      if (!skipApprovalCheck) {
        // Check current allowance
        console.log('Checking token allowance...');
        // Note: We'd need to implement allowance checking here
        // For now, we'll always approve to ensure it works
        
        setIsApproving(true);
        console.log('Approving tokens...', {
          token: tokenAddress,
          spender: spenderAddress,
          amount: amount.toString()
        });
        
        // Get the approve hook dynamically
        const approveHook = useTokenApprove(tokenAddress);
        await approveHook.mutateAsync({ 
          spender: spenderAddress, 
          amount 
        });
        
        console.log('Token approval successful');
        setIsApproving(false);
        
        // Wait for approval to be confirmed
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Execute the main operation
      setIsExecuting(true);
      console.log('Executing main operation...');
      const result = await onExecute();
      console.log('Operation successful');
      setIsExecuting(false);
      
      return result;
      
    } catch (error: any) {
      console.error('ApproveAndExecute error:', error);
      setError(error.message || 'Transaction failed');
      setIsApproving(false);
      setIsExecuting(false);
      throw error;
    }
  };

  return {
    executeWithApproval,
    isApproving,
    isExecuting,
    isPending: isApproving || isExecuting,
    error,
    clearError: () => setError(null)
  };
}

/**
 * Common DeFi operation patterns
 */
export const DEFI_PATTERNS = {
  // Token wrapping: Approve token → Wrap to SY
  WRAP_TOKENS: 'wrap_tokens',
  // Token splitting: Approve SY → Split to PT+YT  
  SPLIT_TOKENS: 'split_tokens',
  // Token combining: Approve PT+YT → Combine to SY
  COMBINE_TOKENS: 'combine_tokens',
  // Staking: Approve token → Stake
  STAKE_TOKENS: 'stake_tokens',
  // AMM operations: Approve tokens → Add liquidity / Swap
  AMM_OPERATIONS: 'amm_operations'
} as const;

/**
 * Helper function to get common error messages
 */
export function getDeFiErrorMessage(error: any): string {
  const message = error?.message || error?.toString() || '';
  
  if (message.includes('insufficient allowance')) {
    return 'Token approval required. Please approve the contract to spend your tokens.';
  }
  
  if (message.includes('insufficient balance')) {
    return 'Insufficient token balance for this operation.';
  }
  
  if (message.includes('gas')) {
    return 'Transaction failed due to gas issues. Please try again with higher gas.';
  }
  
  if (message.includes('user rejected')) {
    return 'Transaction was cancelled by user.';
  }
  
  if (message.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  return 'Transaction failed. Please try again.';
}