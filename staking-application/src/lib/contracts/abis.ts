import type { Abi } from 'viem';

// Import JSON ABIs
import MockERC20Abi from '../abis/MockERC20.json';
import StandardizedTokenWrapperAbi from '../abis/StandardizedTokenWrapper.json';
import GenericYieldTokenizationAbi from '../abis/GenericYieldTokenization.json';
import SimpleAMMAbi from '../abis/SimpleAMM.json';
import ProductionPriceOracleAbi from '../abis/ProductionPriceOracle.json';
import StakingDappAbi from '../abis/StakingDapp.json';
import YTAutoConverterAbi from '../abis/YTAutoConverter.json';
import PTTokenAbi from '../abis/PTToken.json';
import YTTokenAbi from '../abis/YTToken.json';

// Export ABIs with proper typing
export const ERC20_ABI = MockERC20Abi as Abi;
export const SY_WRAPPER_ABI = StandardizedTokenWrapperAbi as Abi;
export const YIELD_TOKENIZATION_ABI = GenericYieldTokenizationAbi as Abi;
export const SIMPLE_AMM_ABI = SimpleAMMAbi as Abi;
export const PRICE_ORACLE_ABI = ProductionPriceOracleAbi as Abi;
export const STAKING_DAPP_ABI = StakingDappAbi as Abi;
export const YT_AUTO_CONVERTER_ABI = YTAutoConverterAbi as Abi;
export const PT_TOKEN_ABI = PTTokenAbi as Abi;
export const YT_TOKEN_ABI = YTTokenAbi as Abi;