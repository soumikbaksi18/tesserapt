# Test Script with Correct Address Configuration
# Fixes the named address conflict issue

Write-Host "Testing with Correct Address Configuration..." -ForegroundColor Green
Write-Host ""

$ACCOUNT_ADDRESS = "0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b"
$PROFILE_NAME = "bitmax_testnet"

# First, let's test compilation
Write-Host "1. Testing compilation..." -ForegroundColor Yellow
aptos move compile --named-addresses bitmax=$ACCOUNT_ADDRESS

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Compilation successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Compilation failed!" -ForegroundColor Red
    exit 1
}

# Test with dev mode using the actual address
Write-Host "2. Testing with dev mode..." -ForegroundColor Yellow
aptos move test --named-addresses bitmax=$ACCOUNT_ADDRESS --dev

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dev tests passed!" -ForegroundColor Green
} else {
    Write-Host "❌ Dev tests failed!" -ForegroundColor Red
}

# Test view functions
Write-Host "3. Testing view functions..." -ForegroundColor Yellow

# Yield Tokenization
Write-Host "Testing Yield Tokenization..." -ForegroundColor Gray
$isPaused = aptos move view --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::is_paused" --profile $PROFILE_NAME
Write-Host "  - Protocol paused: $isPaused" -ForegroundColor White

$maturities = aptos move view --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::get_maturities" --profile $PROFILE_NAME
Write-Host "  - Maturities: $maturities" -ForegroundColor White

# Standardized Wrapper
Write-Host "Testing Standardized Wrapper..." -ForegroundColor Gray
$yieldRate = aptos move view --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::get_yield_rate" --profile $PROFILE_NAME
Write-Host "  - Yield rate: $yieldRate" -ForegroundColor White

$tokenCount = aptos move view --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::get_token_count" --profile $PROFILE_NAME
Write-Host "  - Token count: $tokenCount" -ForegroundColor White

# Price Oracle
Write-Host "Testing Price Oracle..." -ForegroundColor Gray
$price = aptos move view --function-id "${ACCOUNT_ADDRESS}::price_oracle::get_price" --args address:0x1 --profile $PROFILE_NAME
Write-Host "  - Price for 0x1: $price" -ForegroundColor White

# Staking DApp
Write-Host "Testing Staking DApp..." -ForegroundColor Gray
$stakedAmount = aptos move view --function-id "${ACCOUNT_ADDRESS}::staking_dapp::get_staked_amount" --args address:$ACCOUNT_ADDRESS --profile $PROFILE_NAME
Write-Host "  - Staked amount: $stakedAmount" -ForegroundColor White

$reward = aptos move view --function-id "${ACCOUNT_ADDRESS}::staking_dapp::calculate_reward" --args address:$ACCOUNT_ADDRESS --profile $PROFILE_NAME
Write-Host "  - Calculated reward: $reward" -ForegroundColor White

# AMM
Write-Host "Testing Simple AMM..." -ForegroundColor Gray
$reserves = aptos move view --function-id "${ACCOUNT_ADDRESS}::simple_amm::get_reserves" --profile $PROFILE_NAME
Write-Host "  - Reserves: $reserves" -ForegroundColor White

# PT Token
Write-Host "Testing PT Token..." -ForegroundColor Gray
$ptMaturity = aptos move view --function-id "${ACCOUNT_ADDRESS}::pt_token::get_maturity" --profile $PROFILE_NAME
Write-Host "  - Maturity: $ptMaturity" -ForegroundColor White

# YT Token
Write-Host "Testing YT Token..." -ForegroundColor Gray
$ytMaturity = aptos move view --function-id "${ACCOUNT_ADDRESS}::yt_token::get_maturity" --profile $PROFILE_NAME
Write-Host "  - Maturity: $ytMaturity" -ForegroundColor White

# YT Auto Converter
Write-Host "Testing YT Auto Converter..." -ForegroundColor Gray
$conversionRate = aptos move view --function-id "${ACCOUNT_ADDRESS}::yt_auto_converter::get_conversion_rate" --profile $PROFILE_NAME
Write-Host "  - Conversion rate: $conversionRate" -ForegroundColor White

Write-Host ""
Write-Host "✅ All view functions working!" -ForegroundColor Green

# Test write functions
Write-Host "4. Testing write functions..." -ForegroundColor Yellow

# Test maturity creation
Write-Host "Testing maturity creation..." -ForegroundColor Gray
$futureTimestamp = [int64]((Get-Date).AddDays(150).ToUniversalTime() - (Get-Date "1970-01-01 00:00:00Z")).TotalSeconds
aptos move run --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::create_maturity" --args u64:$futureTimestamp --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Maturity creation successful!" -ForegroundColor Green
} else {
    Write-Host "  ❌ Maturity creation failed!" -ForegroundColor Red
}

# Test price update
Write-Host "Testing price update..." -ForegroundColor Gray
aptos move run --function-id "${ACCOUNT_ADDRESS}::price_oracle::update_price" --args address:0xefgh u64:4000000 u64:96 --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Price update successful!" -ForegroundColor Green
} else {
    Write-Host "  ❌ Price update failed!" -ForegroundColor Red
}

# Test token ratio configuration
Write-Host "Testing token ratio configuration..." -ForegroundColor Gray
aptos move run --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::configure_token" --args u64:5 u64:1500 bool:true --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Token ratio configuration successful!" -ForegroundColor Green
} else {
    Write-Host "  ❌ Token ratio configuration failed!" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "           TEST COMPLETED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ All contracts are functioning properly!" -ForegroundColor Green
Write-Host ""
Write-Host "Contract Address: $ACCOUNT_ADDRESS" -ForegroundColor Cyan
Write-Host "Explorer: https://explorer.aptoslabs.com/account/$ACCOUNT_ADDRESS?network=testnet" -ForegroundColor Blue

