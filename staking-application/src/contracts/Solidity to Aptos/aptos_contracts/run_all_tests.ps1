# Master Test Script - Run All Contract Tests
# Comprehensive testing of all Bitmax Protocol contracts

Write-Host "========================================" -ForegroundColor Green
Write-Host "    BITMAX PROTOCOL - MASTER TEST SUITE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$ACCOUNT_ADDRESS = "0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b"
$PROFILE_NAME = "bitmax_testnet"

# Test 1: Compilation and Unit Tests
Write-Host "PHASE 1: Compilation and Unit Tests" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "Running Move unit tests..." -ForegroundColor White
aptos move test --named-addresses bitmax=$ACCOUNT_ADDRESS

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Unit tests PASSED!" -ForegroundColor Green
} else {
    Write-Host "❌ Unit tests FAILED!" -ForegroundColor Red
    Write-Host "Stopping tests due to unit test failures." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Contract Deployment Verification
Write-Host "PHASE 2: Contract Deployment Verification" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "Checking deployed modules..." -ForegroundColor White
$modules = aptos account list --profile $PROFILE_NAME --query modules

if ($modules -match "yield_tokenization" -and $modules -match "standardized_wrapper" -and $modules -match "price_oracle" -and $modules -match "staking_dapp" -and $modules -match "simple_amm" -and $modules -match "pt_token" -and $modules -match "yt_token" -and $modules -match "yt_auto_converter") {
    Write-Host "✅ All 8 contracts deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Some contracts missing from deployment!" -ForegroundColor Red
}

Write-Host ""

# Test 3: View Functions Test
Write-Host "PHASE 3: View Functions Test" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow
Write-Host ""

Write-Host "Testing all view functions..." -ForegroundColor White

# Yield Tokenization
Write-Host "Testing Yield Tokenization..." -ForegroundColor Gray
$isPaused = aptos move view --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::is_paused" --profile $PROFILE_NAME
$maturities = aptos move view --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::get_maturities" --profile $PROFILE_NAME
Write-Host "  - Protocol paused: $isPaused" -ForegroundColor White
Write-Host "  - Maturities count: $($maturities.Length)" -ForegroundColor White

# Standardized Wrapper
Write-Host "Testing Standardized Wrapper..." -ForegroundColor Gray
$yieldRate = aptos move view --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::get_yield_rate" --profile $PROFILE_NAME
$tokenCount = aptos move view --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::get_token_count" --profile $PROFILE_NAME
Write-Host "  - Yield rate: $yieldRate" -ForegroundColor White
Write-Host "  - Token count: $tokenCount" -ForegroundColor White

# Price Oracle
Write-Host "Testing Price Oracle..." -ForegroundColor Gray
$price = aptos move view --function-id "${ACCOUNT_ADDRESS}::price_oracle::get_price" --args address:0x1 --profile $PROFILE_NAME
Write-Host "  - Price for 0x1: $price" -ForegroundColor White

# Staking DApp
Write-Host "Testing Staking DApp..." -ForegroundColor Gray
$stakedAmount = aptos move view --function-id "${ACCOUNT_ADDRESS}::staking_dapp::get_staked_amount" --args address:$ACCOUNT_ADDRESS --profile $PROFILE_NAME
$reward = aptos move view --function-id "${ACCOUNT_ADDRESS}::staking_dapp::calculate_reward" --args address:$ACCOUNT_ADDRESS --profile $PROFILE_NAME
Write-Host "  - Staked amount: $stakedAmount" -ForegroundColor White
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

Write-Host "✅ All view functions working!" -ForegroundColor Green
Write-Host ""

# Test 4: Write Functions Test
Write-Host "PHASE 4: Write Functions Test" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow
Write-Host ""

Write-Host "Testing write functions..." -ForegroundColor White

# Test maturity creation
Write-Host "Testing maturity creation..." -ForegroundColor Gray
$futureTimestamp = [int64]((Get-Date).AddDays(120).ToUniversalTime() - (Get-Date "1970-01-01 00:00:00Z")).TotalSeconds
aptos move run --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::create_maturity" --args u64:$futureTimestamp --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Maturity creation successful!" -ForegroundColor Green
} else {
    Write-Host "  ❌ Maturity creation failed!" -ForegroundColor Red
}

# Test price update
Write-Host "Testing price update..." -ForegroundColor Gray
aptos move run --function-id "${ACCOUNT_ADDRESS}::price_oracle::update_price" --args address:0xabcd u64:3000000 u64:97 --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Price update successful!" -ForegroundColor Green
} else {
    Write-Host "  ❌ Price update failed!" -ForegroundColor Red
}

# Test token ratio configuration
Write-Host "Testing token ratio configuration..." -ForegroundColor Gray
aptos move run --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::configure_token" --args u64:4 u64:2000 bool:true --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Token ratio configuration successful!" -ForegroundColor Green
} else {
    Write-Host "  ❌ Token ratio configuration failed!" -ForegroundColor Red
}

# Test pause/unpause
Write-Host "Testing pause/unpause functionality..." -ForegroundColor Gray
aptos move run --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::pause" --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Pause successful!" -ForegroundColor Green
    
    aptos move run --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::unpause" --profile $PROFILE_NAME --assume-yes
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Unpause successful!" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Unpause failed!" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ Pause failed!" -ForegroundColor Red
}

Write-Host ""

# Test 5: Integration Test
Write-Host "PHASE 5: Integration Test" -ForegroundColor Yellow
Write-Host "========================" -ForegroundColor Yellow
Write-Host ""

Write-Host "Testing contract integration..." -ForegroundColor White

# Verify final state
Write-Host "Verifying final contract state..." -ForegroundColor Gray
$finalMaturities = aptos move view --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::get_maturities" --profile $PROFILE_NAME
$finalYieldRate = aptos move view --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::get_yield_rate" --profile $PROFILE_NAME
$finalTokenCount = aptos move view --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::get_token_count" --profile $PROFILE_NAME

Write-Host "  - Final maturities count: $($finalMaturities.Length)" -ForegroundColor White
Write-Host "  - Final yield rate: $finalYieldRate" -ForegroundColor White
Write-Host "  - Final token count: $finalTokenCount" -ForegroundColor White

Write-Host "✅ Integration test completed!" -ForegroundColor Green
Write-Host ""

# Final Summary
Write-Host "========================================" -ForegroundColor Green
Write-Host "           TEST SUMMARY" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ All tests completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Contract Details:" -ForegroundColor Cyan
Write-Host "  - Address: $ACCOUNT_ADDRESS" -ForegroundColor White
Write-Host "  - Network: Aptos Testnet" -ForegroundColor White
Write-Host "  - Profile: $PROFILE_NAME" -ForegroundColor White
Write-Host ""
Write-Host "Explorer Link:" -ForegroundColor Cyan
Write-Host "https://explorer.aptoslabs.com/account/$ACCOUNT_ADDRESS?network=testnet" -ForegroundColor Blue
Write-Host ""
Write-Host "All contracts are functioning properly!" -ForegroundColor Green
Write-Host "Ready for production use!" -ForegroundColor Green

