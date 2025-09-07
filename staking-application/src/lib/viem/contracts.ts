import { getContract } from 'viem';
import type { Address, GetContractReturnType, PublicClient, WalletClient } from 'viem';
import { publicClient } from './client';
import { 
  ERC20_ABI, 
  SY_WRAPPER_ABI, 
  YIELD_TOKENIZATION_ABI, 
  SIMPLE_AMM_ABI, 
  PRICE_ORACLE_ABI, 
  STAKING_DAPP_ABI, 
  YT_AUTO_CONVERTER_ABI 
} from '../contracts/abis';
import { getContractAddress, AVALANCHE_FUJI_CHAIN_ID } from '../contracts/config';

// Contract factory function
function createContract<TAbi extends readonly unknown[]>(
  address: Address,
  abi: TAbi,
  walletClient?: WalletClient
) {
  if (walletClient) {
    return getContract({
      address,
      abi,
      client: { public: publicClient, wallet: walletClient },
    });
  }
  
  return getContract({
    address,
    abi,
    client: publicClient,
  });
}

// ERC20 Token contracts
export function getERC20Contract(tokenAddress: Address, walletClient?: WalletClient) {
  return createContract(tokenAddress, ERC20_ABI, walletClient);
}

export function getMockStAVAXContract(walletClient?: WalletClient) {
  const address = getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'mockStAVAX');
  return createContract(address, ERC20_ABI, walletClient);
}

export function getMockUSDCEContract(walletClient?: WalletClient) {
  const address = getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'mockUSDCE');
  return createContract(address, ERC20_ABI, walletClient);
}

// SY Wrapper contract
export function getSYWrapperContract(walletClient?: WalletClient) {
  const address = getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'syWrapper');
  return createContract(address, SY_WRAPPER_ABI, walletClient);
}

// Yield Tokenization contract
export function getYieldTokenizationContract(walletClient?: WalletClient) {
  const address = getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'yieldTokenization');
  return createContract(address, YIELD_TOKENIZATION_ABI, walletClient);
}

// PT Token contract
export function getPTTokenContract(walletClient?: WalletClient) {
  const address = getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'ptToken');
  return createContract(address, ERC20_ABI, walletClient);
}

// YT Token contract
export function getYTTokenContract(walletClient?: WalletClient) {
  const address = getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'ytToken');
  return createContract(address, ERC20_ABI, walletClient);
}

// AMM contracts
export function getPTAMMContract(walletClient?: WalletClient) {
  const address = getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'ptAmm');
  return createContract(address, SIMPLE_AMM_ABI, walletClient);
}

export function getYTAMMContract(walletClient?: WalletClient) {
  const address = getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'ytAmm');
  return createContract(address, SIMPLE_AMM_ABI, walletClient);
}

// Price Oracle contract
export function getPriceOracleContract(walletClient?: WalletClient) {
  const address = getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'priceOracle');
  return createContract(address, PRICE_ORACLE_ABI, walletClient);
}

// Staking Dapp contract
export function getStakingDappContract(walletClient?: WalletClient) {
  const address = getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'stakingDapp');
  return createContract(address, STAKING_DAPP_ABI, walletClient);
}

// YT Auto Converter contract
export function getYTAutoConverterContract(walletClient?: WalletClient) {
  const address = getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'ytAutoConverter');
  return createContract(address, YT_AUTO_CONVERTER_ABI, walletClient);
}

// Helper types for contract instances
export type ERC20Contract = ReturnType<typeof getERC20Contract>;
export type SYWrapperContract = ReturnType<typeof getSYWrapperContract>;
export type YieldTokenizationContract = ReturnType<typeof getYieldTokenizationContract>;
export type SimpleAMMContract = ReturnType<typeof getPTAMMContract>;
export type PriceOracleContract = ReturnType<typeof getPriceOracleContract>;
export type StakingDappContract = ReturnType<typeof getStakingDappContract>;
export type YTAutoConverterContract = ReturnType<typeof getYTAutoConverterContract>;

// Contract addresses getter for UI
export const CONTRACT_ADDRESSES_UI = {
  mockStAVAX: getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'mockStAVAX'),
  mockUSDCE: getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'mockUSDCE'),
  syWrapper: getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'syWrapper'),
  yieldTokenization: getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'yieldTokenization'),
  ptToken: getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'ptToken'),
  ytToken: getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'ytToken'),
  ptAmm: getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'ptAmm'),
  ytAmm: getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'ytAmm'),
  priceOracle: getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'priceOracle'),
  stakingDapp: getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'stakingDapp'),
  ytAutoConverter: getContractAddress(AVALANCHE_FUJI_CHAIN_ID, 'ytAutoConverter'),
} as const;