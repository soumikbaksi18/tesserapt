# Bitmax Protocol - Testnet Deployment Script (PowerShell)
# Address: 0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b

Write-Host "Starting Bitmax Protocol Testnet Deployment..." -ForegroundColor Green
Write-Host "Using address: 0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b" -ForegroundColor Cyan
Write-Host ""

# Set variables
$ACCOUNT_ADDRESS = "0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b"
$PROFILE_NAME = "bitmax_testnet"
$PRIVATE_KEY = "ed25519-priv-0x5fbcf2a355d9c35f65de942b1ff62f58ca9689a0360171a3fc81d66dcf22042c"

# Create Aptos profile
Write-Host "Setting up Aptos profile..." -ForegroundColor Yellow
aptos init --profile $PROFILE_NAME --network testnet --private-key $PRIVATE_KEY --assume-yes

# Fund account
Write-Host "Funding testnet account..." -ForegroundColor Yellow
aptos account fund-with-faucet --profile $PROFILE_NAME

# Check balance
Write-Host "Checking account balance..." -ForegroundColor Yellow
aptos account list --profile $PROFILE_NAME --query balance

# Update Move.toml with actual address
Write-Host "Updating Move.toml with deployment address..." -ForegroundColor Yellow
(Get-Content Move.toml) -replace 'bitmax = "_"', "bitmax = `"$ACCOUNT_ADDRESS`"" | Set-Content Move.toml

# Compile contracts
Write-Host "Compiling contracts..." -ForegroundColor Yellow
aptos move compile --named-addresses bitmax=$ACCOUNT_ADDRESS

# Run tests
Write-Host "Running tests..." -ForegroundColor Yellow
aptos move test --named-addresses bitmax=$ACCOUNT_ADDRESS

# Deploy contracts
Write-Host "Deploying contracts to testnet..." -ForegroundColor Yellow
aptos move publish --named-addresses bitmax=$ACCOUNT_ADDRESS --profile $PROFILE_NAME --assume-yes

# Wait for deployment to complete
Write-Host "Waiting for deployment to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Initialize Yield Tokenization
Write-Host "Initializing Yield Tokenization..." -ForegroundColor Yellow
aptos move run --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::initialize" --args string:"Bitmax Protocol" string:"BITMAX" --profile $PROFILE_NAME --assume-yes

# Initialize Standardized Wrapper
Write-Host "Initializing Standardized Wrapper..." -ForegroundColor Yellow
aptos move run --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::initialize" --args string:"Standardized Yield Token" string:"SY" u64:500 --profile $PROFILE_NAME --assume-yes

# Initialize Price Oracle
Write-Host "Initializing Price Oracle..." -ForegroundColor Yellow
aptos move run --function-id "${ACCOUNT_ADDRESS}::price_oracle::initialize" --profile $PROFILE_NAME --assume-yes

# Initialize Staking DApp
Write-Host "Initializing Staking DApp..." -ForegroundColor Yellow
aptos move run --function-id "${ACCOUNT_ADDRESS}::staking_dapp::initialize" --type-args 0x1::aptos_coin::AptosCoin --args vector<u8>:"Staking Reward" vector<u8>:"SREWARD" --profile $PROFILE_NAME --assume-yes

# Initialize Simple AMM
Write-Host "Initializing Simple AMM..." -ForegroundColor Yellow
aptos move run --function-id "${ACCOUNT_ADDRESS}::simple_amm::initialize" --type-args "${ACCOUNT_ADDRESS}::pt_token::PTToken" "${ACCOUNT_ADDRESS}::yt_token::YTToken" --profile $PROFILE_NAME --assume-yes

# Initialize YT Auto Converter
Write-Host "Initializing YT Auto Converter..." -ForegroundColor Yellow
aptos move run --function-id "${ACCOUNT_ADDRESS}::yt_auto_converter::initialize" --args address:$ACCOUNT_ADDRESS address:$ACCOUNT_ADDRESS address:0x1 address:$ACCOUNT_ADDRESS --profile $PROFILE_NAME --assume-yes

# Create maturity (30 days from now)
Write-Host "Creating maturity (30 days from now)..." -ForegroundColor Yellow
$FUTURE_TIMESTAMP = [int64]((Get-Date).AddDays(30).ToUniversalTime() - (Get-Date "1970-01-01 00:00:00Z")).TotalSeconds
aptos move run --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::create_maturity" --args u64:$FUTURE_TIMESTAMP --profile $PROFILE_NAME --assume-yes

# Initialize PT Token
Write-Host "Initializing PT Token..." -ForegroundColor Yellow
aptos move run --function-id "${ACCOUNT_ADDRESS}::pt_token::initialize" --args string:"Principal Token" string:"PT" u64:$FUTURE_TIMESTAMP --profile $PROFILE_NAME --assume-yes

# Initialize YT Token
Write-Host "Initializing YT Token..." -ForegroundColor Yellow
aptos move run --function-id "${ACCOUNT_ADDRESS}::yt_token::initialize" --args string:"Yield Token" string:"YT" u64:$FUTURE_TIMESTAMP --profile $PROFILE_NAME --assume-yes

# Configure token ratios
Write-Host "Configuring token ratios..." -ForegroundColor Yellow
aptos move run --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::configure_token" --args u64:0 u64:6000 bool:true --profile $PROFILE_NAME --assume-yes
aptos move run --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::configure_token" --args u64:1 u64:4000 bool:true --profile $PROFILE_NAME --assume-yes

# Verify deployment
Write-Host "Verifying deployment..." -ForegroundColor Yellow
aptos account list --profile $PROFILE_NAME --query modules

# Test core functions
Write-Host "Testing core functions..." -ForegroundColor Yellow
aptos move view --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::is_paused" --profile $PROFILE_NAME
aptos move view --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::get_maturities" --profile $PROFILE_NAME

# Create deployment record
Write-Host "Creating deployment record..." -ForegroundColor Yellow
$deploymentRecord = @{
    network = "testnet"
    deployment_date = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    deployer_address = $ACCOUNT_ADDRESS
    profile_name = $PROFILE_NAME
    contracts = @{
        yield_tokenization = "${ACCOUNT_ADDRESS}::yield_tokenization"
        standardized_wrapper = "${ACCOUNT_ADDRESS}::standardized_wrapper"
        pt_token = "${ACCOUNT_ADDRESS}::pt_token"
        yt_token = "${ACCOUNT_ADDRESS}::yt_token"
        price_oracle = "${ACCOUNT_ADDRESS}::price_oracle"
        staking_dapp = "${ACCOUNT_ADDRESS}::staking_dapp"
        simple_amm = "${ACCOUNT_ADDRESS}::simple_amm"
        yt_auto_converter = "${ACCOUNT_ADDRESS}::yt_auto_converter"
    }
    maturity_timestamp = $FUTURE_TIMESTAMP
    status = "deployed_successfully"
} | ConvertTo-Json -Depth 3

$deploymentRecord | Out-File -FilePath "deployment_record.json" -Encoding UTF8

Write-Host ""
Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Contract Address: $ACCOUNT_ADDRESS" -ForegroundColor Cyan
Write-Host "Network: Aptos Testnet" -ForegroundColor Cyan
Write-Host "Deployment record saved to: deployment_record.json" -ForegroundColor Cyan
Write-Host ""
Write-Host "View on Aptos Explorer:" -ForegroundColor Yellow
Write-Host "https://explorer.aptoslabs.com/account/$ACCOUNT_ADDRESS?network=testnet" -ForegroundColor Blue
Write-Host ""
Write-Host "All contracts are now live and ready for use!" -ForegroundColor Green

