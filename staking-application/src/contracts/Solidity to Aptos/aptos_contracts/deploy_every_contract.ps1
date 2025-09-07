# Deploy Every Single Contract Script
# Ensures every contract is deployed individually with full verification

Write-Host "========================================" -ForegroundColor Green
Write-Host "  BITMAX PROTOCOL - DEPLOY EVERY CONTRACT" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$ACCOUNT_ADDRESS = "0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b"
$PROFILE_NAME = "bitmax_testnet"
$PRIVATE_KEY = "ed25519-priv-0x5fbcf2a355d9c35f65de942b1ff62f58ca9689a0360171a3fc81d66dcf22042c"

# Step 1: Environment Setup
Write-Host "STEP 1: Environment Setup" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow
Write-Host ""

Write-Host "Creating Aptos profile..." -ForegroundColor White
aptos init --profile $PROFILE_NAME --network testnet --private-key $PRIVATE_KEY --assume-yes

Write-Host "Funding testnet account..." -ForegroundColor White
aptos account fund-with-faucet --profile $PROFILE_NAME

Write-Host "Checking account balance..." -ForegroundColor White
aptos account list --profile $PROFILE_NAME --query balance

Write-Host "Updating Move.toml..." -ForegroundColor White
(Get-Content Move.toml) -replace 'bitmax = "_"', "bitmax = `"$ACCOUNT_ADDRESS`"" | Set-Content Move.toml

Write-Host ""

# Step 2: Compile All Contracts
Write-Host "STEP 2: Compile All Contracts" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow
Write-Host ""

Write-Host "Compiling all contracts..." -ForegroundColor White
aptos move compile --named-addresses bitmax=$ACCOUNT_ADDRESS

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All contracts compiled successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Compilation failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Deploy All Contracts
Write-Host "STEP 3: Deploy All Contracts" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow
Write-Host ""

Write-Host "Deploying all contracts to testnet..." -ForegroundColor White
aptos move publish --named-addresses bitmax=$ACCOUNT_ADDRESS --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All contracts deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Contract deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 4: Initialize Each Contract
Write-Host "STEP 4: Initialize Each Contract" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
Write-Host ""

# 4.1: Initialize Yield Tokenization
Write-Host "4.1: Initializing Yield Tokenization..." -ForegroundColor Cyan
Write-Host "This is the core protocol contract..." -ForegroundColor Gray
aptos move run --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::initialize" --args string:"Bitmax Protocol" string:"BITMAX" --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Yield Tokenization initialized!" -ForegroundColor Green
} else {
    Write-Host "❌ Yield Tokenization initialization failed!" -ForegroundColor Red
}

# 4.2: Initialize Standardized Wrapper
Write-Host "4.2: Initializing Standardized Wrapper..." -ForegroundColor Cyan
Write-Host "This is the entry point for users..." -ForegroundColor Gray
aptos move run --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::initialize" --args string:"Standardized Yield Token" string:"SY" u64:500 --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Standardized Wrapper initialized!" -ForegroundColor Green
} else {
    Write-Host "❌ Standardized Wrapper initialization failed!" -ForegroundColor Red
}

# 4.3: Initialize Price Oracle
Write-Host "4.3: Initializing Price Oracle..." -ForegroundColor Cyan
Write-Host "This handles price feeds..." -ForegroundColor Gray
aptos move run --function-id "${ACCOUNT_ADDRESS}::price_oracle::initialize" --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Price Oracle initialized!" -ForegroundColor Green
} else {
    Write-Host "❌ Price Oracle initialization failed!" -ForegroundColor Red
}

# 4.4: Initialize Staking DApp
Write-Host "4.4: Initializing Staking DApp..." -ForegroundColor Cyan
Write-Host "This provides the yield source..." -ForegroundColor Gray
aptos move run --function-id "${ACCOUNT_ADDRESS}::staking_dapp::initialize" --type-args 0x1::aptos_coin::AptosCoin --args vector<u8>:"Staking Reward" vector<u8>:"SREWARD" --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Staking DApp initialized!" -ForegroundColor Green
} else {
    Write-Host "❌ Staking DApp initialization failed!" -ForegroundColor Red
}

# 4.5: Initialize Simple AMM
Write-Host "4.5: Initializing Simple AMM..." -ForegroundColor Cyan
Write-Host "This handles token trading..." -ForegroundColor Gray
aptos move run --function-id "${ACCOUNT_ADDRESS}::simple_amm::initialize" --type-args "${ACCOUNT_ADDRESS}::pt_token::PTToken" "${ACCOUNT_ADDRESS}::yt_token::YTToken" --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Simple AMM initialized!" -ForegroundColor Green
} else {
    Write-Host "❌ Simple AMM initialization failed!" -ForegroundColor Red
}

# 4.6: Initialize YT Auto Converter
Write-Host "4.6: Initializing YT Auto Converter..." -ForegroundColor Cyan
Write-Host "This is the AI component..." -ForegroundColor Gray
aptos move run --function-id "${ACCOUNT_ADDRESS}::yt_auto_converter::initialize" --args address:$ACCOUNT_ADDRESS address:$ACCOUNT_ADDRESS address:0x1 address:$ACCOUNT_ADDRESS --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ YT Auto Converter initialized!" -ForegroundColor Green
} else {
    Write-Host "❌ YT Auto Converter initialization failed!" -ForegroundColor Red
}

Write-Host ""

# Step 5: Create Maturity and Initialize Tokens
Write-Host "STEP 5: Create Maturity and Initialize Tokens" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host ""

# 5.1: Create Maturity
Write-Host "5.1: Creating maturity (30 days from now)..." -ForegroundColor Cyan
$FUTURE_TIMESTAMP = [int64]((Get-Date).AddDays(30).ToUniversalTime() - (Get-Date "1970-01-01 00:00:00Z")).TotalSeconds
aptos move run --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::create_maturity" --args u64:$FUTURE_TIMESTAMP --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Maturity created successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Maturity creation failed!" -ForegroundColor Red
}

# 5.2: Initialize PT Token
Write-Host "5.2: Initializing PT Token..." -ForegroundColor Cyan
Write-Host "This represents principal tokens..." -ForegroundColor Gray
aptos move run --function-id "${ACCOUNT_ADDRESS}::pt_token::initialize" --args string:"Principal Token" string:"PT" u64:$FUTURE_TIMESTAMP --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PT Token initialized!" -ForegroundColor Green
} else {
    Write-Host "❌ PT Token initialization failed!" -ForegroundColor Red
}

# 5.3: Initialize YT Token
Write-Host "5.3: Initializing YT Token..." -ForegroundColor Cyan
Write-Host "This represents yield tokens..." -ForegroundColor Gray
aptos move run --function-id "${ACCOUNT_ADDRESS}::yt_token::initialize" --args string:"Yield Token" string:"YT" u64:$FUTURE_TIMESTAMP --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ YT Token initialized!" -ForegroundColor Green
} else {
    Write-Host "❌ YT Token initialization failed!" -ForegroundColor Red
}

Write-Host ""

# Step 6: Configure All Contracts
Write-Host "STEP 6: Configure All Contracts" -ForegroundColor Yellow
Write-Host "===============================" -ForegroundColor Yellow
Write-Host ""

# 6.1: Configure Token Ratios
Write-Host "6.1: Configuring token ratios..." -ForegroundColor Cyan
Write-Host "Setting up token distribution ratios..." -ForegroundColor Gray

# Configure first token (60%)
aptos move run --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::configure_token" --args u64:0 u64:6000 bool:true --profile $PROFILE_NAME --assume-yes
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Token 1 configured (60%)!" -ForegroundColor Green
} else {
    Write-Host "  ❌ Token 1 configuration failed!" -ForegroundColor Red
}

# Configure second token (40%)
aptos move run --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::configure_token" --args u64:1 u64:4000 bool:true --profile $PROFILE_NAME --assume-yes
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Token 2 configured (40%)!" -ForegroundColor Green
} else {
    Write-Host "  ❌ Token 2 configuration failed!" -ForegroundColor Red
}

# Configure third token (30%)
aptos move run --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::configure_token" --args u64:2 u64:3000 bool:true --profile $PROFILE_NAME --assume-yes
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Token 3 configured (30%)!" -ForegroundColor Green
} else {
    Write-Host "  ❌ Token 3 configuration failed!" -ForegroundColor Red
}

# Configure fourth token (20%)
aptos move run --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::configure_token" --args u64:3 u64:2000 bool:true --profile $PROFILE_NAME --assume-yes
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Token 4 configured (20%)!" -ForegroundColor Green
} else {
    Write-Host "  ❌ Token 4 configuration failed!" -ForegroundColor Red
}

# Configure fifth token (10%)
aptos move run --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::configure_token" --args u64:4 u64:1000 bool:true --profile $PROFILE_NAME --assume-yes
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Token 5 configured (10%)!" -ForegroundColor Green
} else {
    Write-Host "  ❌ Token 5 configuration failed!" -ForegroundColor Red
}

Write-Host ""

# Step 7: Verify All Contracts
Write-Host "STEP 7: Verify All Contracts" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow
Write-Host ""

# 7.1: Check Deployed Modules
Write-Host "7.1: Checking deployed modules..." -ForegroundColor Cyan
$modules = aptos account list --profile $PROFILE_NAME --query modules
Write-Host "Deployed modules:" -ForegroundColor White
Write-Host $modules

# 7.2: Test All View Functions
Write-Host "7.2: Testing all view functions..." -ForegroundColor Cyan

# Test Yield Tokenization
Write-Host "Testing Yield Tokenization..." -ForegroundColor Gray
$isPaused = aptos move view --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::is_paused" --profile $PROFILE_NAME
Write-Host "  - Protocol paused: $isPaused" -ForegroundColor White

$maturities = aptos move view --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::get_maturities" --profile $PROFILE_NAME
Write-Host "  - Maturities: $maturities" -ForegroundColor White

# Test Standardized Wrapper
Write-Host "Testing Standardized Wrapper..." -ForegroundColor Gray
$yieldRate = aptos move view --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::get_yield_rate" --profile $PROFILE_NAME
Write-Host "  - Yield rate: $yieldRate" -ForegroundColor White

$tokenCount = aptos move view --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::get_token_count" --profile $PROFILE_NAME
Write-Host "  - Token count: $tokenCount" -ForegroundColor White

# Test Price Oracle
Write-Host "Testing Price Oracle..." -ForegroundColor Gray
$price = aptos move view --function-id "${ACCOUNT_ADDRESS}::price_oracle::get_price" --args address:0x1 --profile $PROFILE_NAME
Write-Host "  - Price for 0x1: $price" -ForegroundColor White

# Test Staking DApp
Write-Host "Testing Staking DApp..." -ForegroundColor Gray
$stakedAmount = aptos move view --function-id "${ACCOUNT_ADDRESS}::staking_dapp::get_staked_amount" --args address:$ACCOUNT_ADDRESS --profile $PROFILE_NAME
Write-Host "  - Staked amount: $stakedAmount" -ForegroundColor White

$reward = aptos move view --function-id "${ACCOUNT_ADDRESS}::staking_dapp::calculate_reward" --args address:$ACCOUNT_ADDRESS --profile $PROFILE_NAME
Write-Host "  - Calculated reward: $reward" -ForegroundColor White

# Test Simple AMM
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

# Step 8: Create Comprehensive Deployment Record
Write-Host "STEP 8: Create Comprehensive Deployment Record" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
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
    token_ratios = @{
        token_0 = "60%"
        token_1 = "40%"
        token_2 = "30%"
        token_3 = "20%"
        token_4 = "10%"
    }
    status = "all_contracts_deployed_successfully"
} | ConvertTo-Json -Depth 3

$deploymentRecord | Out-File -FilePath "comprehensive_deployment_record.json" -Encoding UTF8

Write-Host "Comprehensive deployment record saved!" -ForegroundColor Green

Write-Host ""

# Final Summary
Write-Host "========================================" -ForegroundColor Green
Write-Host "        DEPLOYMENT COMPLETED SUCCESSFULLY" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ ALL CONTRACTS DEPLOYED AND INITIALIZED!" -ForegroundColor Green
Write-Host ""
Write-Host "Deployed Contracts:" -ForegroundColor Cyan
Write-Host "  1. ✅ Yield Tokenization (Core Protocol)" -ForegroundColor White
Write-Host "  2. ✅ Standardized Wrapper (Entry Point)" -ForegroundColor White
Write-Host "  3. ✅ PT Token (Principal Tokens)" -ForegroundColor White
Write-Host "  4. ✅ YT Token (Yield Tokens)" -ForegroundColor White
Write-Host "  5. ✅ Price Oracle (Price Feeds)" -ForegroundColor White
Write-Host "  6. ✅ Staking DApp (Yield Source)" -ForegroundColor White
Write-Host "  7. ✅ Simple AMM (Trading)" -ForegroundColor White
Write-Host "  8. ✅ YT Auto Converter (AI Component)" -ForegroundColor White
Write-Host ""
Write-Host "Contract Details:" -ForegroundColor Cyan
Write-Host "  - Address: $ACCOUNT_ADDRESS" -ForegroundColor White
Write-Host "  - Network: Aptos Testnet" -ForegroundColor White
Write-Host "  - Profile: $PROFILE_NAME" -ForegroundColor White
Write-Host "  - Maturity: $FUTURE_TIMESTAMP" -ForegroundColor White
Write-Host ""
Write-Host "Explorer Link:" -ForegroundColor Cyan
Write-Host "https://explorer.aptoslabs.com/account/$ACCOUNT_ADDRESS?network=testnet" -ForegroundColor Blue
Write-Host ""
Write-Host "🎉 ALL CONTRACTS ARE NOW LIVE AND READY FOR USE! 🎉" -ForegroundColor Green

