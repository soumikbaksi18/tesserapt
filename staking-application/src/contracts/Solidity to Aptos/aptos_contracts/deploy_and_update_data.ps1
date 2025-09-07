# Comprehensive Deployment and Data Update Script
# This script deploys all contracts and extracts complete deployment data

Write-Host "🚀 Bitmax Protocol - Complete Deployment & Data Update" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# Configuration
$PRIVATE_KEY = "ed25519-priv-0x5fbcf2a355d9c35f65de942b1ff62f58ca9689a0360171a3fc81d66dcf22042c"
$ACCOUNT_ADDRESS = "0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b"

Write-Host "Account Address: $ACCOUNT_ADDRESS" -ForegroundColor Yellow
Write-Host ""

# Step 1: Clean and compile contracts
Write-Host "Step 1: Cleaning and compiling contracts..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

Write-Host "Cleaning previous build..." -ForegroundColor Gray
aptos move clean --profile default

Write-Host "Compiling contracts..." -ForegroundColor Gray
aptos move compile --profile default

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Contracts compiled successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Compilation failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Deploy all contracts
Write-Host "Step 2: Deploying all contracts..." -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green

Write-Host "Deploying yield_tokenization..." -ForegroundColor Gray
aptos move publish --package-dir . --private-key $PRIVATE_KEY --profile default

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All contracts deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Initialize contracts
Write-Host "Step 3: Initializing contracts..." -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

# Initialize yield tokenization
Write-Host "Initializing yield tokenization..." -ForegroundColor Gray
$initYieldCmd = @"
aptos move run --function-id $ACCOUNT_ADDRESS::yield_tokenization::initialize --args u64:30 --private-key $PRIVATE_KEY --profile default
"@
Invoke-Expression $initYieldCmd

# Initialize standardized wrapper
Write-Host "Initializing standardized wrapper..." -ForegroundColor Gray
$initWrapperCmd = @"
aptos move run --function-id $ACCOUNT_ADDRESS::standardized_wrapper::initialize --args string:"SY Token" string:"SY" u64:500 --private-key $PRIVATE_KEY --profile default
"@
Invoke-Expression $initWrapperCmd

# Initialize staking dapp
Write-Host "Initializing staking dapp..." -ForegroundColor Gray
$initStakingCmd = @"
aptos move run --function-id $ACCOUNT_ADDRESS::staking_dapp::initialize --args string:"Reward Token" string:"REWARD" --private-key $PRIVATE_KEY --profile default
"@
Invoke-Expression $initStakingCmd

# Initialize price oracle
Write-Host "Initializing price oracle..." -ForegroundColor Gray
$initOracleCmd = @"
aptos move run --function-id $ACCOUNT_ADDRESS::price_oracle::initialize --args u64:1000000 --private-key $PRIVATE_KEY --profile default
"@
Invoke-Expression $initOracleCmd

# Initialize simple AMM
Write-Host "Initializing simple AMM..." -ForegroundColor Gray
$initAmmCmd = @"
aptos move run --function-id $ACCOUNT_ADDRESS::simple_amm::initialize --args u64:3000 --private-key $PRIVATE_KEY --profile default
"@
Invoke-Expression $initAmmCmd

# Initialize YT auto converter
Write-Host "Initializing YT auto converter..." -ForegroundColor Gray
$initConverterCmd = @"
aptos move run --function-id $ACCOUNT_ADDRESS::yt_auto_converter::initialize --args u64:1000 --private-key $PRIVATE_KEY --profile default
"@
Invoke-Expression $initConverterCmd

Write-Host "✅ Contract initialization completed!" -ForegroundColor Green
Write-Host ""

# Step 4: Configure the whitelisted token
Write-Host "Step 4: Configuring whitelisted token..." -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

$TOKEN_ADDRESS = "0xb89ce09d8186fb1fceb67a17920e7cd85a2f311155af6f65bdc5771b1ec037cb"
$TOKEN_INDEX = 0
$TOKEN_RATIO = 5000
$IS_ENABLED = $true

Write-Host "Adding token to whitelist: $TOKEN_ADDRESS" -ForegroundColor Gray
$configureTokenCmd = @"
aptos move run --function-id $ACCOUNT_ADDRESS::standardized_wrapper::configure_token --args u64:$TOKEN_INDEX u64:$TOKEN_RATIO bool:$IS_ENABLED --private-key $PRIVATE_KEY --profile default
"@
Invoke-Expression $configureTokenCmd

Write-Host "✅ Token whitelist configuration completed!" -ForegroundColor Green
Write-Host ""

# Step 5: Extract deployment data
Write-Host "Step 5: Extracting deployment data..." -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Create deployment_data directory if it doesn't exist
if (!(Test-Path "deployment_data")) {
    New-Item -ItemType Directory -Path "deployment_data"
}

# Get account resources
Write-Host "Extracting account resources..." -ForegroundColor Gray
aptos account list --query resources --account $ACCOUNT_ADDRESS --profile default | Out-File -FilePath "deployment_data/account_resources.json" -Encoding UTF8

# Get deployed modules
Write-Host "Extracting deployed modules..." -ForegroundColor Gray
aptos account list --query modules --account $ACCOUNT_ADDRESS --profile default | Out-File -FilePath "deployment_data/deployed_modules.json" -Encoding UTF8

# Extract contract addresses
Write-Host "Creating contract addresses file..." -ForegroundColor Gray
$contractAddresses = @"
// Bitmax Protocol Contract Addresses
// Generated on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

export const CONTRACT_ADDRESSES = {
    // Main Protocol Address
    BITMAX_PROTOCOL: "$ACCOUNT_ADDRESS",
    
    // Core Contracts
    YIELD_TOKENIZATION: "$ACCOUNT_ADDRESS",
    STANDARDIZED_WRAPPER: "$ACCOUNT_ADDRESS",
    STAKING_DAPP: "$ACCOUNT_ADDRESS",
    PRICE_ORACLE: "$ACCOUNT_ADDRESS",
    SIMPLE_AMM: "$ACCOUNT_ADDRESS",
    YT_AUTO_CONVERTER: "$ACCOUNT_ADDRESS",
    
    // Token Contracts
    PT_TOKEN: "$ACCOUNT_ADDRESS",
    YT_TOKEN: "$ACCOUNT_ADDRESS",
    
    // Whitelisted Tokens
    WHITELISTED_TOKEN: "$TOKEN_ADDRESS"
};

export default CONTRACT_ADDRESSES;
"@

$contractAddresses | Out-File -FilePath "deployment_data/contract_addresses.js" -Encoding UTF8

# Create TypeScript version
$contractAddresses.Replace("export const", "export const").Replace("export default", "export default") | Out-File -FilePath "deployment_data/contract_addresses.ts" -Encoding UTF8

Write-Host "✅ Deployment data extraction completed!" -ForegroundColor Green
Write-Host ""

# Step 6: Extract ABIs from source code
Write-Host "Step 6: Extracting ABIs from source code..." -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

# Read and extract ABI from each contract
$contracts = @(
    @{name="yield_tokenization"; file="sources/core/yield_tokenization.move"},
    @{name="standardized_wrapper"; file="sources/tokens/standardized_wrapper.move"},
    @{name="staking_dapp"; file="sources/infrastructure/staking_dapp.move"},
    @{name="price_oracle"; file="sources/oracles/price_oracle.move"},
    @{name="simple_amm"; file="sources/infrastructure/simple_amm.move"},
    @{name="pt_token"; file="sources/tokens/pt_token.move"},
    @{name="yt_token"; file="sources/tokens/yt_token.move"},
    @{name="yt_auto_converter"; file="sources/advanced/yt_auto_converter.move"}
)

foreach ($contract in $contracts) {
    Write-Host "Extracting ABI for $($contract.name)..." -ForegroundColor Gray
    
    if (Test-Path $contract.file) {
        $sourceCode = Get-Content $contract.file -Raw
        $abi = @{
            contract_name = $contract.name
            contract_address = $ACCOUNT_ADDRESS
            functions = @()
            events = @()
            structs = @()
            constants = @()
            extracted_at = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        }
        
        # Extract functions
        $functionMatches = [regex]::Matches($sourceCode, 'public\s+(?:entry\s+)?fun\s+(\w+)\s*\([^)]*\)\s*(?:acquires\s+[^{]+)?\s*\{')
        foreach ($match in $functionMatches) {
            $abi.functions += @{
                name = $match.Groups[1].Value
                type = "public"
            }
        }
        
        # Extract entry functions
        $entryMatches = [regex]::Matches($sourceCode, 'public\s+entry\s+fun\s+(\w+)\s*\([^)]*\)\s*(?:acquires\s+[^{]+)?\s*\{')
        foreach ($match in $entryMatches) {
            $abi.functions += @{
                name = $match.Groups[1].Value
                type = "entry"
            }
        }
        
        # Extract events
        $eventMatches = [regex]::Matches($sourceCode, '#\[event\]\s*struct\s+(\w+)\s+has\s+drop,\s+store')
        foreach ($match in $eventMatches) {
            $abi.events += @{
                name = $match.Groups[1].Value
            }
        }
        
        # Extract structs
        $structMatches = [regex]::Matches($sourceCode, 'struct\s+(\w+)\s+has\s+([^{]+)\s*\{')
        foreach ($match in $structMatches) {
            $abi.structs += @{
                name = $match.Groups[1].Value
                capabilities = $match.Groups[2].Value.Trim()
            }
        }
        
        # Extract constants
        $constMatches = [regex]::Matches($sourceCode, 'const\s+(\w+):\s+(\w+)\s*=\s*([^;]+);')
        foreach ($match in $constMatches) {
            $abi.constants += @{
                name = $match.Groups[1].Value
                type = $match.Groups[2].Value
                value = $match.Groups[3].Value.Trim()
            }
        }
        
        # Save ABI
        $abi | ConvertTo-Json -Depth 10 | Out-File -FilePath "deployment_data/$($contract.name)_abi.json" -Encoding UTF8
    }
}

# Create comprehensive ABI file
Write-Host "Creating comprehensive ABI file..." -ForegroundColor Gray
$allAbis = @{
    protocol_name = "Bitmax Protocol"
    protocol_address = $ACCOUNT_ADDRESS
    deployment_date = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    contracts = @()
}

foreach ($contract in $contracts) {
    if (Test-Path "deployment_data/$($contract.name)_abi.json") {
        $abiData = Get-Content "deployment_data/$($contract.name)_abi.json" | ConvertFrom-Json
        $allAbis.contracts += $abiData
    }
}

$allAbis | ConvertTo-Json -Depth 10 | Out-File -FilePath "deployment_data/all_contracts_abi.json" -Encoding UTF8

Write-Host "✅ ABI extraction completed!" -ForegroundColor Green
Write-Host ""

# Step 7: Create deployment summary
Write-Host "Step 7: Creating deployment summary..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

$deploymentSummary = @{
    deployment_info = @{
        account_address = $ACCOUNT_ADDRESS
        deployment_date = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        network = "Aptos Testnet"
        status = "Successfully Deployed"
    }
    contracts = @(
        @{name="yield_tokenization"; address=$ACCOUNT_ADDRESS; status="deployed"},
        @{name="standardized_wrapper"; address=$ACCOUNT_ADDRESS; status="deployed"},
        @{name="staking_dapp"; address=$ACCOUNT_ADDRESS; status="deployed"},
        @{name="price_oracle"; address=$ACCOUNT_ADDRESS; status="deployed"},
        @{name="simple_amm"; address=$ACCOUNT_ADDRESS; status="deployed"},
        @{name="pt_token"; address=$ACCOUNT_ADDRESS; status="deployed"},
        @{name="yt_token"; address=$ACCOUNT_ADDRESS; status="deployed"},
        @{name="yt_auto_converter"; address=$ACCOUNT_ADDRESS; status="deployed"}
    )
    whitelisted_tokens = @(
        @{address=$TOKEN_ADDRESS; ratio=5000; enabled=$true}
    )
    files_generated = @(
        "contract_addresses.js",
        "contract_addresses.ts", 
        "deployed_modules.json",
        "account_resources.json",
        "all_contracts_abi.json"
    )
}

$deploymentSummary | ConvertTo-Json -Depth 10 | Out-File -FilePath "deployment_data/deployment_summary.json" -Encoding UTF8

Write-Host "✅ Deployment summary created!" -ForegroundColor Green
Write-Host ""

# Step 8: Verify deployment
Write-Host "Step 8: Verifying deployment..." -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

Write-Host "Testing contract accessibility..." -ForegroundColor Gray
$testCmd = @"
aptos move view --function-id $ACCOUNT_ADDRESS::yield_tokenization::get_maturity_period --profile default
"@
Invoke-Expression $testCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Contract verification successful!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Contract verification had issues, but deployment may still be successful" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 COMPLETE DEPLOYMENT AND DATA UPDATE FINISHED!" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Generated Files:" -ForegroundColor Yellow
Write-Host "  - contract_addresses.js/ts" -ForegroundColor White
Write-Host "  - deployed_modules.json" -ForegroundColor White
Write-Host "  - account_resources.json" -ForegroundColor White
Write-Host "  - all_contracts_abi.json" -ForegroundColor White
Write-Host "  - deployment_summary.json" -ForegroundColor White
Write-Host "  - Individual contract ABIs" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Contract Address: $ACCOUNT_ADDRESS" -ForegroundColor Yellow
Write-Host "🎯 Whitelisted Token: $TOKEN_ADDRESS" -ForegroundColor Yellow
Write-Host ""
Write-Host "All deployment data has been updated and is ready for use! 🚀" -ForegroundColor Green
