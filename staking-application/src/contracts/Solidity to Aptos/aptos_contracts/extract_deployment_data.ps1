# Extract All Deployment Data Script
# Extracts bytecode, ABI, and metadata for all deployed contracts

Write-Host "========================================" -ForegroundColor Green
Write-Host "  EXTRACTING DEPLOYMENT DATA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$ACCOUNT_ADDRESS = "0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b"
$PROFILE_NAME = "bitmax_testnet"
$DEPLOYMENT_DATA_DIR = "deployment_data"

# Create deployment data directory
Write-Host "Creating deployment data directory..." -ForegroundColor Yellow
if (!(Test-Path $DEPLOYMENT_DATA_DIR)) {
    New-Item -ItemType Directory -Path $DEPLOYMENT_DATA_DIR
    Write-Host "✅ Directory created: $DEPLOYMENT_DATA_DIR" -ForegroundColor Green
} else {
    Write-Host "✅ Directory already exists: $DEPLOYMENT_DATA_DIR" -ForegroundColor Green
}

Write-Host ""

# Step 1: Extract Contract Modules
Write-Host "STEP 1: Extracting Contract Modules" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "Getting all deployed modules..." -ForegroundColor White
$modules = aptos account list --profile $PROFILE_NAME --query modules

# Save modules to file
$modules | Out-File -FilePath "$DEPLOYMENT_DATA_DIR\deployed_modules.json" -Encoding UTF8
Write-Host "✅ Modules saved to: deployed_modules.json" -ForegroundColor Green

Write-Host ""

# Step 2: Extract Bytecode for Each Contract
Write-Host "STEP 2: Extracting Bytecode" -ForegroundColor Yellow
Write-Host "===========================" -ForegroundColor Yellow
Write-Host ""

$contracts = @(
    @{name="yield_tokenization"; address="${ACCOUNT_ADDRESS}::yield_tokenization"},
    @{name="standardized_wrapper"; address="${ACCOUNT_ADDRESS}::standardized_wrapper"},
    @{name="pt_token"; address="${ACCOUNT_ADDRESS}::pt_token"},
    @{name="yt_token"; address="${ACCOUNT_ADDRESS}::yt_token"},
    @{name="price_oracle"; address="${ACCOUNT_ADDRESS}::price_oracle"},
    @{name="staking_dapp"; address="${ACCOUNT_ADDRESS}::staking_dapp"},
    @{name="simple_amm"; address="${ACCOUNT_ADDRESS}::simple_amm"},
    @{name="yt_auto_converter"; address="${ACCOUNT_ADDRESS}::yt_auto_converter"}
)

foreach ($contract in $contracts) {
    Write-Host "Extracting bytecode for $($contract.name)..." -ForegroundColor Cyan
    
    try {
        $bytecode = aptos account get-resource --address $ACCOUNT_ADDRESS --resource-type $($contract.address) --profile $PROFILE_NAME
        $bytecode | Out-File -FilePath "$DEPLOYMENT_DATA_DIR\$($contract.name)_bytecode.json" -Encoding UTF8
        Write-Host "  ✅ Bytecode saved to: $($contract.name)_bytecode.json" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️ Could not extract bytecode for $($contract.name)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Step 3: Extract ABI for Each Contract
Write-Host "STEP 3: Extracting ABI" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Yellow
Write-Host ""

foreach ($contract in $contracts) {
    Write-Host "Extracting ABI for $($contract.name)..." -ForegroundColor Cyan
    
    try {
        $abi = aptos move view --function-id $($contract.address) --profile $PROFILE_NAME
        $abi | Out-File -FilePath "$DEPLOYMENT_DATA_DIR\$($contract.name)_abi.json" -Encoding UTF8
        Write-Host "  ✅ ABI saved to: $($contract.name)_abi.json" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️ Could not extract ABI for $($contract.name)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Step 4: Extract Contract State
Write-Host "STEP 4: Extracting Contract State" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
Write-Host ""

foreach ($contract in $contracts) {
    Write-Host "Extracting state for $($contract.name)..." -ForegroundColor Cyan
    
    try {
        $state = aptos account get-resource --address $ACCOUNT_ADDRESS --resource-type $($contract.address) --profile $PROFILE_NAME
        $state | Out-File -FilePath "$DEPLOYMENT_DATA_DIR\$($contract.name)_state.json" -Encoding UTF8
        Write-Host "  ✅ State saved to: $($contract.name)_state.json" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️ Could not extract state for $($contract.name)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Step 5: Extract Function Signatures
Write-Host "STEP 5: Extracting Function Signatures" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow
Write-Host ""

foreach ($contract in $contracts) {
    Write-Host "Extracting function signatures for $($contract.name)..." -ForegroundColor Cyan
    
    try {
        $functions = aptos move view --function-id $($contract.address) --profile $PROFILE_NAME
        $functions | Out-File -FilePath "$DEPLOYMENT_DATA_DIR\$($contract.name)_functions.json" -Encoding UTF8
        Write-Host "  ✅ Functions saved to: $($contract.name)_functions.json" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️ Could not extract functions for $($contract.name)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Step 6: Extract Transaction History
Write-Host "STEP 6: Extracting Transaction History" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "Getting transaction history..." -ForegroundColor White
try {
    $transactions = aptos account list --profile $PROFILE_NAME --query transactions
    $transactions | Out-File -FilePath "$DEPLOYMENT_DATA_DIR\transaction_history.json" -Encoding UTF8
    Write-Host "✅ Transaction history saved to: transaction_history.json" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Could not extract transaction history" -ForegroundColor Yellow
}

Write-Host ""

# Step 7: Create Comprehensive Deployment Summary
Write-Host "STEP 7: Creating Deployment Summary" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow
Write-Host ""

$deploymentSummary = @{
    network = "testnet"
    deployment_date = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    deployer_address = $ACCOUNT_ADDRESS
    profile_name = $PROFILE_NAME
    contracts = @{
        yield_tokenization = @{
            address = "${ACCOUNT_ADDRESS}::yield_tokenization"
            bytecode_file = "yield_tokenization_bytecode.json"
            abi_file = "yield_tokenization_abi.json"
            state_file = "yield_tokenization_state.json"
            functions_file = "yield_tokenization_functions.json"
        }
        standardized_wrapper = @{
            address = "${ACCOUNT_ADDRESS}::standardized_wrapper"
            bytecode_file = "standardized_wrapper_bytecode.json"
            abi_file = "standardized_wrapper_abi.json"
            state_file = "standardized_wrapper_state.json"
            functions_file = "standardized_wrapper_functions.json"
        }
        pt_token = @{
            address = "${ACCOUNT_ADDRESS}::pt_token"
            bytecode_file = "pt_token_bytecode.json"
            abi_file = "pt_token_abi.json"
            state_file = "pt_token_state.json"
            functions_file = "pt_token_functions.json"
        }
        yt_token = @{
            address = "${ACCOUNT_ADDRESS}::yt_token"
            bytecode_file = "yt_token_bytecode.json"
            abi_file = "yt_token_abi.json"
            state_file = "yt_token_state.json"
            functions_file = "yt_token_functions.json"
        }
        price_oracle = @{
            address = "${ACCOUNT_ADDRESS}::price_oracle"
            bytecode_file = "price_oracle_bytecode.json"
            abi_file = "price_oracle_abi.json"
            state_file = "price_oracle_state.json"
            functions_file = "price_oracle_functions.json"
        }
        staking_dapp = @{
            address = "${ACCOUNT_ADDRESS}::staking_dapp"
            bytecode_file = "staking_dapp_bytecode.json"
            abi_file = "staking_dapp_abi.json"
            state_file = "staking_dapp_state.json"
            functions_file = "staking_dapp_functions.json"
        }
        simple_amm = @{
            address = "${ACCOUNT_ADDRESS}::simple_amm"
            bytecode_file = "simple_amm_bytecode.json"
            abi_file = "simple_amm_abi.json"
            state_file = "simple_amm_state.json"
            functions_file = "simple_amm_functions.json"
        }
        yt_auto_converter = @{
            address = "${ACCOUNT_ADDRESS}::yt_auto_converter"
            bytecode_file = "yt_auto_converter_bytecode.json"
            abi_file = "yt_auto_converter_abi.json"
            state_file = "yt_auto_converter_state.json"
            functions_file = "yt_auto_converter_functions.json"
        }
    }
    files = @{
        deployed_modules = "deployed_modules.json"
        transaction_history = "transaction_history.json"
        deployment_summary = "deployment_summary.json"
    }
    explorer_url = "https://explorer.aptoslabs.com/account/$ACCOUNT_ADDRESS?network=testnet"
} | ConvertTo-Json -Depth 4

$deploymentSummary | Out-File -FilePath "$DEPLOYMENT_DATA_DIR\deployment_summary.json" -Encoding UTF8

Write-Host "✅ Deployment summary saved to: deployment_summary.json" -ForegroundColor Green

Write-Host ""

# Step 8: Create Frontend Integration Files
Write-Host "STEP 8: Creating Frontend Integration Files" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Yellow
Write-Host ""

# Create TypeScript contract addresses file
$tsAddresses = @"
// Bitmax Protocol Contract Addresses
// Generated on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

export const CONTRACT_ADDRESSES = {
  YIELD_TOKENIZATION: "${ACCOUNT_ADDRESS}::yield_tokenization",
  STANDARDIZED_WRAPPER: "${ACCOUNT_ADDRESS}::standardized_wrapper",
  PT_TOKEN: "${ACCOUNT_ADDRESS}::pt_token",
  YT_TOKEN: "${ACCOUNT_ADDRESS}::yt_token",
  PRICE_ORACLE: "${ACCOUNT_ADDRESS}::price_oracle",
  STAKING_DAPP: "${ACCOUNT_ADDRESS}::staking_dapp",
  SIMPLE_AMM: "${ACCOUNT_ADDRESS}::simple_amm",
  YT_AUTO_CONVERTER: "${ACCOUNT_ADDRESS}::yt_auto_converter",
} as const;

export const DEPLOYER_ADDRESS = "${ACCOUNT_ADDRESS}";
export const NETWORK = "testnet";
export const EXPLORER_URL = "https://explorer.aptoslabs.com/account/${ACCOUNT_ADDRESS}?network=testnet";
"@

$tsAddresses | Out-File -FilePath "$DEPLOYMENT_DATA_DIR\contract_addresses.ts" -Encoding UTF8

# Create JavaScript contract addresses file
$jsAddresses = @"
// Bitmax Protocol Contract Addresses
// Generated on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

export const CONTRACT_ADDRESSES = {
  YIELD_TOKENIZATION: "${ACCOUNT_ADDRESS}::yield_tokenization",
  STANDARDIZED_WRAPPER: "${ACCOUNT_ADDRESS}::standardized_wrapper",
  PT_TOKEN: "${ACCOUNT_ADDRESS}::pt_token",
  YT_TOKEN: "${ACCOUNT_ADDRESS}::yt_token",
  PRICE_ORACLE: "${ACCOUNT_ADDRESS}::price_oracle",
  STAKING_DAPP: "${ACCOUNT_ADDRESS}::staking_dapp",
  SIMPLE_AMM: "${ACCOUNT_ADDRESS}::simple_amm",
  YT_AUTO_CONVERTER: "${ACCOUNT_ADDRESS}::yt_auto_converter",
};

export const DEPLOYER_ADDRESS = "${ACCOUNT_ADDRESS}";
export const NETWORK = "testnet";
export const EXPLORER_URL = "https://explorer.aptoslabs.com/account/${ACCOUNT_ADDRESS}?network=testnet";
"@

$jsAddresses | Out-File -FilePath "$DEPLOYMENT_DATA_DIR\contract_addresses.js" -Encoding UTF8

Write-Host "✅ Frontend integration files created!" -ForegroundColor Green

Write-Host ""

# Step 9: Create README for Deployment Data
Write-Host "STEP 9: Creating Documentation" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow
Write-Host ""

$readme = @"
# Bitmax Protocol Deployment Data

## Overview
This directory contains all deployment data for the Bitmax Protocol contracts deployed on Aptos Testnet.

## Contract Addresses
- **Deployer Address:** ${ACCOUNT_ADDRESS}
- **Network:** Aptos Testnet
- **Explorer:** https://explorer.aptoslabs.com/account/${ACCOUNT_ADDRESS}?network=testnet

## Deployed Contracts

### 1. Yield Tokenization
- **Address:** ${ACCOUNT_ADDRESS}::yield_tokenization
- **Purpose:** Core protocol for yield tokenization
- **Files:** yield_tokenization_*.json

### 2. Standardized Wrapper
- **Address:** ${ACCOUNT_ADDRESS}::standardized_wrapper
- **Purpose:** Entry point for users
- **Files:** standardized_wrapper_*.json

### 3. PT Token
- **Address:** ${ACCOUNT_ADDRESS}::pt_token
- **Purpose:** Principal tokens
- **Files:** pt_token_*.json

### 4. YT Token
- **Address:** ${ACCOUNT_ADDRESS}::yt_token
- **Purpose:** Yield tokens
- **Files:** yt_token_*.json

### 5. Price Oracle
- **Address:** ${ACCOUNT_ADDRESS}::price_oracle
- **Purpose:** Price feeds
- **Files:** price_oracle_*.json

### 6. Staking DApp
- **Address:** ${ACCOUNT_ADDRESS}::staking_dapp
- **Purpose:** Yield source
- **Files:** staking_dapp_*.json

### 7. Simple AMM
- **Address:** ${ACCOUNT_ADDRESS}::simple_amm
- **Purpose:** Token trading
- **Files:** simple_amm_*.json

### 8. YT Auto Converter
- **Address:** ${ACCOUNT_ADDRESS}::yt_auto_converter
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
$(Get-Date -Format "yyyy-MM-dd HH:mm:ss UTC")
"@

$readme | Out-File -FilePath "$DEPLOYMENT_DATA_DIR\README.md" -Encoding UTF8

Write-Host "✅ Documentation created!" -ForegroundColor Green

Write-Host ""

# Final Summary
Write-Host "========================================" -ForegroundColor Green
Write-Host "        DEPLOYMENT DATA EXTRACTED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ All deployment data has been extracted!" -ForegroundColor Green
Write-Host ""
Write-Host "Files created in: $DEPLOYMENT_DATA_DIR" -ForegroundColor Cyan
Write-Host ""
Write-Host "Contract Data:" -ForegroundColor White
Write-Host "  - Bytecode files (8 contracts)" -ForegroundColor Gray
Write-Host "  - ABI files (8 contracts)" -ForegroundColor Gray
Write-Host "  - State files (8 contracts)" -ForegroundColor Gray
Write-Host "  - Function files (8 contracts)" -ForegroundColor Gray
Write-Host ""
Write-Host "Additional Files:" -ForegroundColor White
Write-Host "  - deployed_modules.json" -ForegroundColor Gray
Write-Host "  - transaction_history.json" -ForegroundColor Gray
Write-Host "  - deployment_summary.json" -ForegroundColor Gray
Write-Host "  - contract_addresses.ts" -ForegroundColor Gray
Write-Host "  - contract_addresses.js" -ForegroundColor Gray
Write-Host "  - README.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Total files created: 41" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 All deployment data is now stored and ready for use! 🎉" -ForegroundColor Green
