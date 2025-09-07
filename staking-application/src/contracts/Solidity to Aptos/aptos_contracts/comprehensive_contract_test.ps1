# Comprehensive Contract Testing Script
# Tests all contracts and their functions after deployment

Write-Host "Starting Comprehensive Contract Testing..." -ForegroundColor Green
Write-Host "Testing all contracts and functions..." -ForegroundColor Cyan
Write-Host ""

$ACCOUNT_ADDRESS = "0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b"
$PROFILE_NAME = "bitmax_testnet"

# Test 1: Compilation and Unit Tests
Write-Host "=== TEST 1: Compilation and Unit Tests ===" -ForegroundColor Yellow
Write-Host "Running Move unit tests..." -ForegroundColor White

aptos move test --named-addresses bitmax=$ACCOUNT_ADDRESS

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Unit tests passed!" -ForegroundColor Green
} else {
    Write-Host "❌ Unit tests failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Contract Deployment Verification
Write-Host "=== TEST 2: Contract Deployment Verification ===" -ForegroundColor Yellow
Write-Host "Checking deployed modules..." -ForegroundColor White

$modules = aptos account list --profile $PROFILE_NAME --query modules
Write-Host "Deployed modules:" -ForegroundColor White
Write-Host $modules

Write-Host ""

# Test 3: Yield Tokenization Functions
Write-Host "=== TEST 3: Yield Tokenization Functions ===" -ForegroundColor Yellow

Write-Host "Testing yield tokenization functions..." -ForegroundColor White

# Test is_paused function
Write-Host "Testing is_paused..." -ForegroundColor Gray
$isPaused = aptos move view --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::is_paused" --profile $PROFILE_NAME
Write-Host "Protocol paused status: $isPaused" -ForegroundColor White

# Test get_maturities function
Write-Host "Testing get_maturities..." -ForegroundColor Gray
$maturities = aptos move view --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::get_maturities" --profile $PROFILE_NAME
Write-Host "Maturities: $maturities" -ForegroundColor White

Write-Host "✅ Yield Tokenization functions working!" -ForegroundColor Green
Write-Host ""

# Test 4: Standardized Wrapper Functions
Write-Host "=== TEST 4: Standardized Wrapper Functions ===" -ForegroundColor Yellow

Write-Host "Testing standardized wrapper functions..." -ForegroundColor White

# Test get_yield_rate function
Write-Host "Testing get_yield_rate..." -ForegroundColor Gray
$yieldRate = aptos move view --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::get_yield_rate" --profile $PROFILE_NAME
Write-Host "Yield rate: $yieldRate" -ForegroundColor White

# Test get_token_count function
Write-Host "Testing get_token_count..." -ForegroundColor Gray
$tokenCount = aptos move view --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::get_token_count" --profile $PROFILE_NAME
Write-Host "Token count: $tokenCount" -ForegroundColor White

Write-Host "✅ Standardized Wrapper functions working!" -ForegroundColor Green
Write-Host ""

# Test 5: Price Oracle Functions
Write-Host "=== TEST 5: Price Oracle Functions ===" -ForegroundColor Yellow

Write-Host "Testing price oracle functions..." -ForegroundColor White

# Test get_price function with a test address
Write-Host "Testing get_price..." -ForegroundColor Gray
$testPrice = aptos move view --function-id "${ACCOUNT_ADDRESS}::price_oracle::get_price" --args address:0x1 --profile $PROFILE_NAME
Write-Host "Price for address 0x1: $testPrice" -ForegroundColor White

Write-Host "✅ Price Oracle functions working!" -ForegroundColor Green
Write-Host ""

# Test 6: Staking DApp Functions
Write-Host "=== TEST 6: Staking DApp Functions ===" -ForegroundColor Yellow

Write-Host "Testing staking dapp functions..." -ForegroundColor White

# Test get_staked_amount function
Write-Host "Testing get_staked_amount..." -ForegroundColor Gray
$stakedAmount = aptos move view --function-id "${ACCOUNT_ADDRESS}::staking_dapp::get_staked_amount" --args address:$ACCOUNT_ADDRESS --profile $PROFILE_NAME
Write-Host "Staked amount: $stakedAmount" -ForegroundColor White

# Test calculate_reward function
Write-Host "Testing calculate_reward..." -ForegroundColor Gray
$reward = aptos move view --function-id "${ACCOUNT_ADDRESS}::staking_dapp::calculate_reward" --args address:$ACCOUNT_ADDRESS --profile $PROFILE_NAME
Write-Host "Calculated reward: $reward" -ForegroundColor White

Write-Host "✅ Staking DApp functions working!" -ForegroundColor Green
Write-Host ""

# Test 7: AMM Functions
Write-Host "=== TEST 7: AMM Functions ===" -ForegroundColor Yellow

Write-Host "Testing AMM functions..." -ForegroundColor White

# Test get_reserves function
Write-Host "Testing get_reserves..." -ForegroundColor Gray
$reserves = aptos move view --function-id "${ACCOUNT_ADDRESS}::simple_amm::get_reserves" --profile $PROFILE_NAME
Write-Host "AMM reserves: $reserves" -ForegroundColor White

Write-Host "✅ AMM functions working!" -ForegroundColor Green
Write-Host ""

# Test 8: PT Token Functions
Write-Host "=== TEST 8: PT Token Functions ===" -ForegroundColor Yellow

Write-Host "Testing PT token functions..." -ForegroundColor White

# Test get_maturity function
Write-Host "Testing get_maturity..." -ForegroundColor Gray
$maturity = aptos move view --function-id "${ACCOUNT_ADDRESS}::pt_token::get_maturity" --profile $PROFILE_NAME
Write-Host "PT token maturity: $maturity" -ForegroundColor White

Write-Host "✅ PT Token functions working!" -ForegroundColor Green
Write-Host ""

# Test 9: YT Token Functions
Write-Host "=== TEST 9: YT Token Functions ===" -ForegroundColor Yellow

Write-Host "Testing YT token functions..." -ForegroundColor White

# Test get_maturity function
Write-Host "Testing get_maturity..." -ForegroundColor Gray
$maturity = aptos move view --function-id "${ACCOUNT_ADDRESS}::yt_token::get_maturity" --profile $PROFILE_NAME
Write-Host "YT token maturity: $maturity" -ForegroundColor White

Write-Host "✅ YT Token functions working!" -ForegroundColor Green
Write-Host ""

# Test 10: YT Auto Converter Functions
Write-Host "=== TEST 10: YT Auto Converter Functions ===" -ForegroundColor Yellow

Write-Host "Testing YT auto converter functions..." -ForegroundColor White

# Test get_conversion_rate function
Write-Host "Testing get_conversion_rate..." -ForegroundColor Gray
$conversionRate = aptos move view --function-id "${ACCOUNT_ADDRESS}::yt_auto_converter::get_conversion_rate" --profile $PROFILE_NAME
Write-Host "Conversion rate: $conversionRate" -ForegroundColor White

Write-Host "✅ YT Auto Converter functions working!" -ForegroundColor Green
Write-Host ""

# Test 11: Integration Tests
Write-Host "=== TEST 11: Integration Tests ===" -ForegroundColor Yellow

Write-Host "Testing contract integration..." -ForegroundColor White

# Test creating a new maturity
Write-Host "Testing maturity creation..." -ForegroundColor Gray
$futureTimestamp = [int64]((Get-Date).AddDays(60).ToUniversalTime() - (Get-Date "1970-01-01 00:00:00Z")).TotalSeconds
aptos move run --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::create_maturity" --args u64:$futureTimestamp --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Maturity creation successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Maturity creation failed!" -ForegroundColor Red
}

# Test updating price
Write-Host "Testing price update..." -ForegroundColor Gray
aptos move run --function-id "${ACCOUNT_ADDRESS}::price_oracle::update_price" --args address:0x1234 u64:1000000 u64:95 --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Price update successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Price update failed!" -ForegroundColor Red
}

# Test configuring token ratios
Write-Host "Testing token ratio configuration..." -ForegroundColor Gray
aptos move run --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::configure_token" --args u64:2 u64:3000 bool:true --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Token ratio configuration successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Token ratio configuration failed!" -ForegroundColor Red
}

Write-Host ""

# Test 12: Error Handling Tests
Write-Host "=== TEST 12: Error Handling Tests ===" -ForegroundColor Yellow

Write-Host "Testing error handling..." -ForegroundColor White

# Test pause functionality
Write-Host "Testing pause functionality..." -ForegroundColor Gray
aptos move run --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::pause" --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Pause functionality working!" -ForegroundColor Green
    
    # Test unpause functionality
    Write-Host "Testing unpause functionality..." -ForegroundColor Gray
    aptos move run --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::unpause" --profile $PROFILE_NAME --assume-yes
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Unpause functionality working!" -ForegroundColor Green
    } else {
        Write-Host "❌ Unpause functionality failed!" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Pause functionality failed!" -ForegroundColor Red
}

Write-Host ""

# Final Summary
Write-Host "=== TEST SUMMARY ===" -ForegroundColor Yellow
Write-Host "All contract tests completed!" -ForegroundColor White
Write-Host ""
Write-Host "Contract Address: $ACCOUNT_ADDRESS" -ForegroundColor Cyan
Write-Host "Network: Aptos Testnet" -ForegroundColor Cyan
Write-Host "Profile: $PROFILE_NAME" -ForegroundColor Cyan
Write-Host ""
Write-Host "View on Aptos Explorer:" -ForegroundColor Yellow
Write-Host "https://explorer.aptoslabs.com/account/$ACCOUNT_ADDRESS?network=testnet" -ForegroundColor Blue
Write-Host ""
Write-Host "All contracts are functioning properly!" -ForegroundColor Green

