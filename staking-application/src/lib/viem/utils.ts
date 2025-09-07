import { formatEther, formatUnits, parseEther, parseUnits } from 'viem';
import type { Address } from 'viem';

// Format token amounts for display
export function formatTokenAmount(amount: bigint, decimals: number = 18, displayDecimals: number = 4): string {
  if (decimals === 18) {
    return parseFloat(formatEther(amount)).toFixed(displayDecimals);
  }
  return parseFloat(formatUnits(amount, decimals)).toFixed(displayDecimals);
}

// Parse token amounts from user input
export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
  if (decimals === 18) {
    return parseEther(amount);
  }
  return parseUnits(amount, decimals);
}

// Format percentage with basis points (10000 = 100%)
export function formatBasisPoints(bps: bigint): string {
  return (Number(bps) / 100).toFixed(2) + '%';
}

// Parse percentage to basis points
export function parseToBasisPoints(percentage: number): bigint {
  return BigInt(Math.round(percentage * 100));
}

// Format USD price (8 decimals)
export function formatUSDPrice(price: bigint): string {
  return '$' + parseFloat(formatUnits(price, 8)).toFixed(2);
}

// Truncate address for display
export function truncateAddress(address: Address, start: number = 6, end: number = 4): string {
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

// Calculate APY from rate in basis points
export function calculateAPY(rateBps: bigint): number {
  return Number(rateBps) / 100; // Convert basis points to percentage
}

// Format time remaining until maturity
export function formatTimeToMaturity(maturityTimestamp: bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const maturity = Number(maturityTimestamp);
  const diff = maturity - now;
  
  if (diff <= 0) {
    return 'Matured';
  }
  
  const days = Math.floor(diff / (24 * 60 * 60));
  const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    const minutes = Math.floor((diff % (60 * 60)) / 60);
    return `${minutes}m`;
  }
}

// Calculate split ratio percentages
export function calculateSplitRatios(ptAmount: bigint, ytAmount: bigint): { ptRatio: number; ytRatio: number } {
  const total = ptAmount + ytAmount;
  if (total === BigInt(0)) {
    return { ptRatio: 50, ytRatio: 50 };
  }
  
  const ptRatio = (Number(ptAmount) / Number(total)) * 100;
  const ytRatio = (Number(ytAmount) / Number(total)) * 100;
  
  return { ptRatio: Math.round(ptRatio), ytRatio: Math.round(ytRatio) };
}

// Validate Ethereum address
export function isValidAddress(address: string): address is Address {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Convert timestamp to readable date
export function timestampToDate(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleDateString();
}

// Calculate price impact for AMM swaps
export function calculatePriceImpact(
  amountIn: bigint,
  reserveIn: bigint,
  reserveOut: bigint
): number {
  if (reserveIn === BigInt(0) || reserveOut === BigInt(0)) return 0;
  
  const amountOut = (amountIn * reserveOut) / (reserveIn + amountIn);
  const priceBeforeSwap = Number(reserveOut) / Number(reserveIn);
  const priceAfterSwap = Number(reserveOut - amountOut) / Number(reserveIn + amountIn);
  
  return Math.abs((priceAfterSwap - priceBeforeSwap) / priceBeforeSwap) * 100;
}

// Format large numbers with suffixes (K, M, B)
export function formatLargeNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B';
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  }
  return num.toFixed(2);
}

// Debounce function for input validation
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Check if amount is valid for transaction
export function isValidAmount(amount: string, balance: bigint, decimals: number = 18): boolean {
  try {
    const parsedAmount = parseTokenAmount(amount, decimals);
    return parsedAmount > BigInt(0) && parsedAmount <= balance;
  } catch {
    return false;
  }
}

// Helper to prepare transaction options for Core wallet compatibility
export function prepareTransactionOptions(gasEstimate?: bigint) {
  const options: any = {};
  
  if (gasEstimate) {
    // Add 20% buffer to gas estimate
    options.gas = gasEstimate + (gasEstimate / BigInt(5));
  }
  
  // Core wallet specific optimizations
  if (typeof window !== 'undefined' && (window as any).ethereum?.isAvalanche) {
    // Add any Core wallet specific transaction options
    options.type = 'legacy'; // Use legacy transactions for better compatibility
  }
  
  return options;
}