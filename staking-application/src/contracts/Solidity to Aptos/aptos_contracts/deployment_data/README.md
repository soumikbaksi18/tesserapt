# Bitmax Protocol Deployment Data

## Overview
This directory contains all deployment data for the Bitmax Protocol contracts deployed on Aptos Testnet.

## Contract Addresses
- **Deployer Address:** 0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b
- **Network:** Aptos Testnet
- **Explorer:** https://explorer.aptoslabs.com/account/0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b?network=testnet

## Deployed Contracts

### 1. Yield Tokenization
- **Address:** 0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b::yield_tokenization
- **Purpose:** Core protocol for yield tokenization
- **Files:** yield_tokenization_*.json

### 2. Standardized Wrapper
- **Address:** 0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b::standardized_wrapper
- **Purpose:** Entry point for users
- **Files:** standardized_wrapper_*.json

### 3. PT Token
- **Address:** 0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b::pt_token
- **Purpose:** Principal tokens
- **Files:** pt_token_*.json

### 4. YT Token
- **Address:** 0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b::yt_token
- **Purpose:** Yield tokens
- **Files:** yt_token_*.json

### 5. Price Oracle
- **Address:** 0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b::price_oracle
- **Purpose:** Price feeds
- **Files:** price_oracle_*.json

### 6. Staking DApp
- **Address:** 0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b::staking_dapp
- **Purpose:** Yield source
- **Files:** staking_dapp_*.json

### 7. Simple AMM
- **Address:** 0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b::simple_amm
- **Purpose:** Token trading
- **Files:** simple_amm_*.json

### 8. YT Auto Converter
- **Address:** 0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b::yt_auto_converter
- **Purpose:** AI component
- **Files:** yt_auto_converter_*.json

## File Types

### Bytecode Files (*_bytecode.json)
Contains the compiled bytecode for each contract.

### ABI Files (*_abi.json)
Contains the Application Binary Interface for each contract.

### State Files (*_state.json)
Contains the current state of each contract.

### Functions Files (*_functions.json)
Contains the function signatures for each contract.

### Other Files
- **deployed_modules.json:** List of all deployed modules
- **transaction_history.json:** Deployment transaction history
- **deployment_summary.json:** Comprehensive deployment summary
- **contract_addresses.ts:** TypeScript contract addresses
- **contract_addresses.js:** JavaScript contract addresses

## Usage

### Frontend Integration
Use the contract_addresses.ts or contract_addresses.js files for frontend integration.

### Contract Interaction
Use the ABI files to interact with the contracts programmatically.

### State Inspection
Use the state files to inspect the current state of each contract.

## Generated on
2025-09-07 09:04:18 UTC
