# Test Staking DApp Deployment
# Address: 0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b

Write-Host "Testing Staking DApp Deployment..." -ForegroundColor Green

$ACCOUNT_ADDRESS = "0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b"
$PROFILE_NAME = "bitmax_testnet"

# Test compilation first
Write-Host "Compiling contracts..." -ForegroundColor Yellow
aptos move compile --named-addresses bitmax=$ACCOUNT_ADDRESS

if ($LASTEXITCODE -eq 0) {
    Write-Host "Compilation successful!" -ForegroundColor Green
    
    # Test staking_dapp initialization specifically
    Write-Host "Testing staking_dapp initialization..." -ForegroundColor Yellow
    aptos move run --function-id "${ACCOUNT_ADDRESS}::staking_dapp::initialize" --type-args 0x1::aptos_coin::AptosCoin --args vector<u8>:"Staking Reward" vector<u8>:"SREWARD" --profile $PROFILE_NAME --assume-yes
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Staking DApp initialization successful!" -ForegroundColor Green
    } else {
        Write-Host "Staking DApp initialization failed!" -ForegroundColor Red
    }
} else {
    Write-Host "Compilation failed!" -ForegroundColor Red
}

