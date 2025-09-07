import { BaseError, ContractFunctionRevertedError, UserRejectedRequestError } from 'viem';

export interface Web3Error {
  code: string;
  message: string;
  userMessage: string;
}

// Parse Viem errors into user-friendly messages
export function parseWeb3Error(error: unknown): Web3Error {
  console.error('Web3 Error:', error);

  if (error instanceof UserRejectedRequestError) {
    return {
      code: 'USER_REJECTED',
      message: 'User rejected the transaction',
      userMessage: 'Transaction was cancelled by user',
    };
  }

  if (error instanceof ContractFunctionRevertedError) {
    const revertReason = error.data?.errorName || error.shortMessage || 'Contract call failed';
    return {
      code: 'CONTRACT_REVERT',
      message: revertReason,
      userMessage: getContractErrorMessage(revertReason),
    };
  }

  if (error instanceof BaseError) {
    // Handle specific Viem errors
    if (error.shortMessage?.includes('insufficient funds')) {
      return {
        code: 'INSUFFICIENT_FUNDS',
        message: error.shortMessage,
        userMessage: 'Insufficient balance to complete this transaction',
      };
    }

    if (error.shortMessage?.includes('gas')) {
      return {
        code: 'GAS_ERROR',
        message: error.shortMessage,
        userMessage: 'Transaction failed due to gas issues. Please try again.',
      };
    }

    if (error.shortMessage?.includes('network')) {
      return {
        code: 'NETWORK_ERROR',
        message: error.shortMessage,
        userMessage: 'Network connection issue. Please check your connection and try again.',
      };
    }

    return {
      code: 'VIEM_ERROR',
      message: error.shortMessage || error.message,
      userMessage: error.shortMessage || 'Transaction failed. Please try again.',
    };
  }

  // Handle generic errors
  const errorMessage = (error as Error)?.message || 'Unknown error occurred';
  
  if (errorMessage.includes('MetaMask')) {
    return {
      code: 'WALLET_ERROR',
      message: errorMessage,
      userMessage: 'Wallet connection issue. Please check MetaMask and try again.',
    };
  }

  if (errorMessage.includes('network')) {
    return {
      code: 'NETWORK_ERROR',
      message: errorMessage,
      userMessage: 'Please switch to Avalanche Fuji Testnet and try again.',
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: errorMessage,
    userMessage: 'An unexpected error occurred. Please try again.',
  };
}

// Map contract error names to user-friendly messages
function getContractErrorMessage(errorName: string): string {
  const errorMessages: Record<string, string> = {
    'ERC20InsufficientBalance': 'Insufficient token balance',
    'ERC20InsufficientAllowance': 'Please approve tokens before proceeding',
    'ERC20InvalidReceiver': 'Invalid recipient address',
    'ERC20InvalidSender': 'Invalid sender address',
    'ERC20InvalidSpender': 'Invalid spender address',
    'OwnableUnauthorizedAccount': 'Unauthorized access',
    'ReentrancyGuardReentrantCall': 'Transaction already in progress',
    'EnforcedPause': 'Contract is currently paused',
    'ExpectedPause': 'Contract is not paused',
    'InvalidMaturity': 'Invalid maturity date',
    'MaturityNotActive': 'This maturity is not active',
    'InsufficientLiquidity': 'Insufficient liquidity for this trade',
    'InvalidAmount': 'Invalid amount specified',
    'InvalidToken': 'Invalid token address',
    'ThresholdNotReached': 'Price threshold not reached for auto-conversion',
    'CircuitBreakerActive': 'Price oracle circuit breaker is active',
    'PriceStale': 'Price data is stale',
    'InvalidPrice': 'Invalid price data',
    'InvalidThreshold': 'Invalid threshold value',
    'NotAuthorized': 'Not authorized to perform this action',
    'InvalidConfiguration': 'Invalid configuration parameters',
    'TokenNotSupported': 'Token not supported',
    'MinimumAmountNotMet': 'Amount below minimum threshold',
    'MaximumAmountExceeded': 'Amount exceeds maximum limit',
    'SlippageExceeded': 'Price slippage exceeded maximum tolerance',
    'DeadlineExceeded': 'Transaction deadline exceeded',
  };

  return errorMessages[errorName] || `Contract error: ${errorName}`;
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Get error severity based on error code
export function getErrorSeverity(errorCode: string): ErrorSeverity {
  const criticalErrors = ['INSUFFICIENT_FUNDS', 'CONTRACT_REVERT'];
  const highErrors = ['NETWORK_ERROR', 'WALLET_ERROR'];
  const mediumErrors = ['GAS_ERROR', 'USER_REJECTED'];
  
  if (criticalErrors.includes(errorCode)) return ErrorSeverity.CRITICAL;
  if (highErrors.includes(errorCode)) return ErrorSeverity.HIGH;
  if (mediumErrors.includes(errorCode)) return ErrorSeverity.MEDIUM;
  return ErrorSeverity.LOW;
}

// Toast notification helper for errors
export function getErrorToastConfig(error: Web3Error) {
  const severity = getErrorSeverity(error.code);
  
  return {
    title: getErrorTitle(error.code),
    description: error.userMessage,
    variant: severity === ErrorSeverity.CRITICAL ? 'destructive' : 'default',
    duration: severity === ErrorSeverity.LOW ? 3000 : 5000,
  };
}

function getErrorTitle(errorCode: string): string {
  const titles: Record<string, string> = {
    'USER_REJECTED': 'Transaction Cancelled',
    'CONTRACT_REVERT': 'Transaction Failed',
    'INSUFFICIENT_FUNDS': 'Insufficient Balance',
    'GAS_ERROR': 'Gas Error',
    'NETWORK_ERROR': 'Network Error',
    'WALLET_ERROR': 'Wallet Error',
    'VIEM_ERROR': 'Transaction Error',
    'UNKNOWN_ERROR': 'Error',
  };

  return titles[errorCode] || 'Error';
}