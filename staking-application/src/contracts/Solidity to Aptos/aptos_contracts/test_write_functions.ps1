# Test Write Functions Script
# Tests write functions of all deployed contracts

Write-Host "Testing Write Functions - Bitmax Protocol" -ForegroundColor Green
Write-Host ""

$ACCOUNT_ADDRESS = "0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b"
$PROFILE_NAME = "bitmax_testnet"

# Test 1: Create new maturity
Write-Host "1. Testing maturity creation..." -ForegroundColor Yellow
$futureTimestamp = [int64]((Get-Date).AddDays(90).ToUniversalTime() - (Get-Date "1970-01-01 00:00:00Z")).TotalSeconds
aptos move run --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::create_maturity" --args u64:$futureTimestamp --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Maturity creation successful!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Maturity creation failed!" -ForegroundColor Red
}

# Test 2: Update price
Write-Host "2. Testing price update..." -ForegroundColor Yellow
aptos move run --function-id "${ACCOUNT_ADDRESS}::price_oracle::update_price" --args address:0x5678 u64:2000000 u64:98 --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Price update successful!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Price update failed!" -ForegroundColor Red
}

# Test 3: Configure token ratio
Write-Host "3. Testing token ratio configuration..." -ForegroundColor Yellow
aptos move run --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::configure_token" --args u64:3 u64:2500 bool:true --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Token ratio configuration successful!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Token ratio configuration failed!" -ForegroundColor Red
}

# Test 4: Add price updater
Write-Host "4. Testing add price updater..." -ForegroundColor Yellow
aptos move run --function-id "${ACCOUNT_ADDRESS}::price_oracle::add_price_updater" --args address:0x9999 --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Add price updater successful!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Add price updater failed!" -ForegroundColor Red
}

# Test 5: Pause protocol
Write-Host "5. Testing protocol pause..." -ForegroundColor Yellow
aptos move run --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::pause" --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Protocol pause successful!" -ForegroundColor Green
    
    # Test unpause
    Write-Host "6. Testing protocol unpause..." -ForegroundColor Yellow
    aptos move run --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::unpause" --profile $PROFILE_NAME --assume-yes
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Protocol unpause successful!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Protocol unpause failed!" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Protocol pause failed!" -ForegroundColor Red
}

# Test 6: Staking operations (if possible)
Write-Host "7. Testing staking operations..." -ForegroundColor Yellow
# Note: Staking requires actual tokens, so this might fail in test environment
aptos move run --function-id "${ACCOUNT_ADDRESS}::staking_dapp::stake" --type-args 0x1::aptos_coin::AptosCoin --args u64:1000 --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Staking operation successful!" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Staking operation failed (expected - requires tokens)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Write function tests completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Contract Address: $ACCOUNT_ADDRESS" -ForegroundColor Cyan
Write-Host "Explorer: https://explorer.aptoslabs.com/account/$ACCOUNT_ADDRESS?network=testnet" -ForegroundColor Blue

