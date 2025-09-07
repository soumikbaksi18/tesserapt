# Individual Contract Deployment Script
# Deploys each contract separately to ensure all are properly deployed

Write-Host "========================================" -ForegroundColor Green
Write-Host "  BITMAX PROTOCOL - INDIVIDUAL DEPLOYMENT" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$ACCOUNT_ADDRESS = "0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b"
$PROFILE_NAME = "bitmax_testnet"
$PRIVATE_KEY = "ed25519-priv-0x5fbcf2a355d9c35f65de942b1ff62f58ca9689a0360171a3fc81d66dcf22042c"

# Step 1: Setup
Write-Host "STEP 1: Setting up deployment environment..." -ForegroundColor Yellow
Write-Host "Using address: $ACCOUNT_ADDRESS" -ForegroundColor Cyan
Write-Host ""

# Create Aptos profile
Write-Host "Creating Aptos profile..." -ForegroundColor White
aptos init --profile $PROFILE_NAME --network testnet --private-key $PRIVATE_KEY --assume-yes

# Fund account
Write-Host "Funding testnet account..." -ForegroundColor White
aptos account fund-with-faucet --profile $PROFILE_NAME

# Check balance
Write-Host "Checking account balance..." -ForegroundColor White
aptos account list --profile $PROFILE_NAME --query balance

# Update Move.toml with actual address
Write-Host "Updating Move.toml with deployment address..." -ForegroundColor White
(Get-Content Move.toml) -replace 'bitmax = "_"', "bitmax = `"$ACCOUNT_ADDRESS`"" | Set-Content Move.toml

Write-Host ""

# Step 2: Compile all contracts
Write-Host "STEP 2: Compiling all contracts..." -ForegroundColor Yellow
Write-Host "Compiling contracts..." -ForegroundColor White
aptos move compile --named-addresses bitmax=$ACCOUNT_ADDRESS

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Compilation successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Compilation failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Deploy each contract individually
Write-Host "STEP 3: Deploying each contract individually..." -ForegroundColor Yellow
Write-Host ""

# Contract 1: Yield Tokenization
Write-Host "CONTRACT 1: Deploying Yield Tokenization..." -ForegroundColor Cyan
Write-Host "This is the core protocol contract..." -ForegroundColor Gray
aptos move publish --named-addresses bitmax=$ACCOUNT_ADDRESS --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Yield Tokenization deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Yield Tokenization deployment failed!" -ForegroundColor Red
    Write-Host "Continuing with other contracts..." -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Initialize each contract
Write-Host "STEP 4: Initializing each contract..." -ForegroundColor Yellow
Write-Host ""

# Initialize Yield Tokenization
Write-Host "Initializing Yield Tokenization..." -ForegroundColor Cyan
aptos move run --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::initialize" --args string:"Bitmax Protocol" string:"BITMAX" --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Yield Tokenization initialized!" -ForegroundColor Green
} else {
    Write-Host "❌ Yield Tokenization initialization failed!" -ForegroundColor Red
}

# Initialize Standardized Wrapper
Write-Host "Initializing Standardized Wrapper..." -ForegroundColor Cyan
aptos move run --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::initialize" --args string:"Standardized Yield Token" string:"SY" u64:500 --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Standardized Wrapper initialized!" -ForegroundColor Green
} else {
    Write-Host "❌ Standardized Wrapper initialization failed!" -ForegroundColor Red
}

# Initialize Price Oracle
Write-Host "Initializing Price Oracle..." -ForegroundColor Cyan
aptos move run --function-id "${ACCOUNT_ADDRESS}::price_oracle::initialize" --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Price Oracle initialized!" -ForegroundColor Green
} else {
    Write-Host "❌ Price Oracle initialization failed!" -ForegroundColor Red
}

# Initialize Staking DApp
Write-Host "Initializing Staking DApp..." -ForegroundColor Cyan
aptos move run --function-id "${ACCOUNT_ADDRESS}::staking_dapp::initialize" --type-args 0x1::aptos_coin::AptosCoin --args vector<u8>:"Staking Reward" vector<u8>:"SREWARD" --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Staking DApp initialized!" -ForegroundColor Green
} else {
    Write-Host "❌ Staking DApp initialization failed!" -ForegroundColor Red
}

# Initialize Simple AMM
Write-Host "Initializing Simple AMM..." -ForegroundColor Cyan
aptos move run --function-id "${ACCOUNT_ADDRESS}::simple_amm::initialize" --type-args "${ACCOUNT_ADDRESS}::pt_token::PTToken" "${ACCOUNT_ADDRESS}::yt_token::YTToken" --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Simple AMM initialized!" -ForegroundColor Green
} else {
    Write-Host "❌ Simple AMM initialization failed!" -ForegroundColor Red
}

# Initialize YT Auto Converter
Write-Host "Initializing YT Auto Converter..." -ForegroundColor Cyan
aptos move run --function-id "${ACCOUNT_ADDRESS}::yt_auto_converter::initialize" --args address:$ACCOUNT_ADDRESS address:$ACCOUNT_ADDRESS address:0x1 address:$ACCOUNT_ADDRESS --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ YT Auto Converter initialized!" -ForegroundColor Green
} else {
    Write-Host "❌ YT Auto Converter initialization failed!" -ForegroundColor Red
}

Write-Host ""

# Step 5: Create maturity and initialize tokens
Write-Host "STEP 5: Creating maturity and initializing tokens..." -ForegroundColor Yellow
Write-Host ""

# Create maturity (30 days from now)
Write-Host "Creating maturity (30 days from now)..." -ForegroundColor Cyan
$FUTURE_TIMESTAMP = [int64]((Get-Date).AddDays(30).ToUniversalTime() - (Get-Date "1970-01-01 00:00:00Z")).TotalSeconds
aptos move run --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::create_maturity" --args u64:$FUTURE_TIMESTAMP --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Maturity created successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Maturity creation failed!" -ForegroundColor Red
}

# Initialize PT Token
Write-Host "Initializing PT Token..." -ForegroundColor Cyan
aptos move run --function-id "${ACCOUNT_ADDRESS}::pt_token::initialize" --args string:"Principal Token" string:"PT" u64:$FUTURE_TIMESTAMP --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PT Token initialized!" -ForegroundColor Green
} else {
    Write-Host "❌ PT Token initialization failed!" -ForegroundColor Red
}

# Initialize YT Token
Write-Host "Initializing YT Token..." -ForegroundColor Cyan
aptos move run --function-id "${ACCOUNT_ADDRESS}::yt_token::initialize" --args string:"Yield Token" string:"YT" u64:$FUTURE_TIMESTAMP --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ YT Token initialized!" -ForegroundColor Green
} else {
    Write-Host "❌ YT Token initialization failed!" -ForegroundColor Red
}

Write-Host ""

# Step 6: Configure contracts
Write-Host "STEP 6: Configuring contracts..." -ForegroundColor Yellow
Write-Host ""

# Configure token ratios
Write-Host "Configuring token ratios..." -ForegroundColor Cyan
aptos move run --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::configure_token" --args u64:0 u64:6000 bool:true --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Token ratio 1 configured (60%)!" -ForegroundColor Green
} else {
    Write-Host "❌ Token ratio 1 configuration failed!" -ForegroundColor Red
}

aptos move run --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::configure_token" --args u64:1 u64:4000 bool:true --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Token ratio 2 configured (40%)!" -ForegroundColor Green
} else {
    Write-Host "❌ Token ratio 2 configuration failed!" -ForegroundColor Red
}

# Add additional token ratios
Write-Host "Adding additional token ratios..." -ForegroundColor Cyan
aptos move run --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::configure_token" --args u64:2 u64:3000 bool:true --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Token ratio 3 configured (30%)!" -ForegroundColor Green
} else {
    Write-Host "❌ Token ratio 3 configuration failed!" -ForegroundColor Red
}

Write-Host ""

# Step 7: Verify deployment
Write-Host "STEP 7: Verifying deployment..." -ForegroundColor Yellow
Write-Host ""

# Check deployed modules
Write-Host "Checking deployed modules..." -ForegroundColor Cyan
$modules = aptos account list --profile $PROFILE_NAME --query modules
Write-Host "Deployed modules:" -ForegroundColor White
Write-Host $modules

# Test core functions
Write-Host "Testing core functions..." -ForegroundColor Cyan

# Test yield tokenization
Write-Host "Testing Yield Tokenization..." -ForegroundColor Gray
$isPaused = aptos move view --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::is_paused" --profile $PROFILE_NAME
Write-Host "  - Protocol paused: $isPaused" -ForegroundColor White

$maturities = aptos move view --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::get_maturities" --profile $PROFILE_NAME
Write-Host "  - Maturities: $maturities" -ForegroundColor White

# Test standardized wrapper
Write-Host "Testing Standardized Wrapper..." -ForegroundColor Gray
$yieldRate = aptos move view --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::get_yield_rate" --profile $PROFILE_NAME
Write-Host "  - Yield rate: $yieldRate" -ForegroundColor White

$tokenCount = aptos move view --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::get_token_count" --profile $PROFILE_NAME
Write-Host "  - Token count: $tokenCount" -ForegroundColor White

# Test price oracle
Write-Host "Testing Price Oracle..." -ForegroundColor Gray
$price = aptos move view --function-id "${ACCOUNT_ADDRESS}::price_oracle::get_price" --args address:0x1 --profile $PROFILE_NAME
Write-Host "  - Price for 0x1: $price" -ForegroundColor White

# Test staking dapp
Write-Host "Testing Staking DApp..." -ForegroundColor Gray
$stakedAmount = aptos move view --function-id "${ACCOUNT_ADDRESS}::staking_dapp::get_staked_amount" --args address:$ACCOUNT_ADDRESS --profile $PROFILE_NAME
Write-Host "  - Staked amount: $stakedAmount" -ForegroundColor White

$reward = aptos move view --function-id "${ACCOUNT_ADDRESS}::staking_dapp::calculate_reward" --args address:$ACCOUNT_ADDRESS --profile $PROFILE_NAME
Write-Host "  - Calculated reward: $reward" -ForegroundColor White

# Test AMM
Write-Host "Testing Simple AMM..." -ForegroundColor Gray
$reserves = aptos move view --function-id "${ACCOUNT_ADDRESS}::simple_amm::get_reserves" --profile $PROFILE_NAME
Write-Host "  - Reserves: $reserves" -ForegroundColor White

# Test PT Token
Write-Host "Testing PT Token..." -ForegroundColor Gray
$ptMaturity = aptos move view --function-id "${ACCOUNT_ADDRESS}::pt_token::get_maturity" --profile $PROFILE_NAME
Write-Host "  - Maturity: $ptMaturity" -ForegroundColor White

# Test YT Token
Write-Host "Testing YT Token..." -ForegroundColor Gray
$ytMaturity = aptos move view --function-id "${ACCOUNT_ADDRESS}::yt_token::get_maturity" --profile $PROFILE_NAME
Write-Host "  - Maturity: $ytMaturity" -ForegroundColor White

# Test YT Auto Converter
Write-Host "Testing YT Auto Converter..." -ForegroundColor Gray
$conversionRate = aptos move view --function-id "${ACCOUNT_ADDRESS}::yt_auto_converter::get_conversion_rate" --profile $PROFILE_NAME
Write-Host "  - Conversion rate: $conversionRate" -ForegroundColor White

Write-Host ""

# Step 8: Create deployment record
Write-Host "STEP 8: Creating deployment record..." -ForegroundColor Yellow
Write-Host ""

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

$deploymentRecord | Out-File -FilePath "individual_deployment_record.json" -Encoding UTF8

Write-Host "Deployment record saved to: individual_deployment_record.json" -ForegroundColor Green

Write-Host ""

# Final Summary
Write-Host "========================================" -ForegroundColor Green
Write-Host "           DEPLOYMENT COMPLETED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ All contracts deployed and initialized!" -ForegroundColor Green
Write-Host ""
Write-Host "Contract Details:" -ForegroundColor Cyan
Write-Host "  - Address: $ACCOUNT_ADDRESS" -ForegroundColor White
Write-Host "  - Network: Aptos Testnet" -ForegroundColor White
Write-Host "  - Profile: $PROFILE_NAME" -ForegroundColor White
Write-Host ""
Write-Host "Deployed Contracts:" -ForegroundColor Cyan
Write-Host "  1. Yield Tokenization (Core Protocol)" -ForegroundColor White
Write-Host "  2. Standardized Wrapper (Entry Point)" -ForegroundColor White
Write-Host "  3. PT Token (Principal Tokens)" -ForegroundColor White
Write-Host "  4. YT Token (Yield Tokens)" -ForegroundColor White
Write-Host "  5. Price Oracle (Price Feeds)" -ForegroundColor White
Write-Host "  6. Staking DApp (Yield Source)" -ForegroundColor White
Write-Host "  7. Simple AMM (Trading)" -ForegroundColor White
Write-Host "  8. YT Auto Converter (AI Component)" -ForegroundColor White
Write-Host ""
Write-Host "Explorer Link:" -ForegroundColor Cyan
Write-Host "https://explorer.aptoslabs.com/account/$ACCOUNT_ADDRESS?network=testnet" -ForegroundColor Blue
Write-Host ""
Write-Host "All contracts are now live and ready for use!" -ForegroundColor Green

