import type { Address } from 'viem';

export const AVALANCHE_FUJI_CHAIN_ID = 43113;

export const CONTRACT_ADDRESSES = {
  [AVALANCHE_FUJI_CHAIN_ID]: {
    mockStAVAX: '0x9B73ded25dC5eb82b07FFf0EB6dB9388B944fb22' as Address,
    mockUSDCE: '0x3dCFDeDefD79b62fB736f0e1f1c214aF36474C0E' as Address,
    syWrapper: '0xc94a4fA575723aa0c8f4079ee0a8dEdAd05510c6' as Address,
    yieldTokenization: '0x5a9Ec7DD090Df8E18CD15C052C74e0C9AfD4aC7c' as Address,
    ptToken: '0xeD85A7656e12cA7868444144a3236259629866aF' as Address,
    ytToken: '0x0A11a140f2A600A0afcF1250F8dB6645c431944E' as Address,
    ptAmm: '0x4E80cef3c26CC01Aa2D1AB791d0137c9DCEBe526' as Address,
    ytAmm: '0xE543fa97336B3ed3b34f52051c49C2476750Fc0B' as Address,
    priceOracle: '0xbbB4d1D99Ba0a8B0592d8C61fFD6188188C8033F' as Address,
    ytAutoConverter: '0xB7624De014a15E0A683eE4E79d04dcA90965cA2e' as Address,
    stakingDapp: '0x27AA46234ba356F903aE1A60474a5463E59F289c' as Address,
  },
} as const;

export const NETWORK_CONFIG = {
  [AVALANCHE_FUJI_CHAIN_ID]: {
    name: 'Avalanche Fuji Testnet',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://api.avax-test.network/ext/bc/C/rpc'] },
      public: { http: ['https://api.avax-test.network/ext/bc/C/rpc'] },
    },
    blockExplorers: {
      default: { name: 'Snowtrace', url: 'https://testnet.snowtrace.io' },
    },
    testnet: true,
  },
} as const;

export function getContractAddress(chainId: number, contractName: keyof typeof CONTRACT_ADDRESSES[typeof AVALANCHE_FUJI_CHAIN_ID]): Address {
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!addresses) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return addresses[contractName];
}

export function isChainSupported(chainId: number): boolean {
  return chainId in CONTRACT_ADDRESSES;
}