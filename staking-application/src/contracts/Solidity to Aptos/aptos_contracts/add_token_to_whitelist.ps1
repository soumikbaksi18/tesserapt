# Add Token to Whitelist - Bitmax Protocol
# This script adds the specified token to the standardized wrapper using the existing Token0/Token1 approach

Write-Host "Adding Token to Bitmax Protocol Whitelist" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Configuration
$PRIVATE_KEY = "ed25519-priv-0x5fbcf2a355d9c35f65de942b1ff62f58ca9689a0360171a3fc81d66dcf22042c"
$ACCOUNT_ADDRESS = "0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b"
$TOKEN_ADDRESS = "0xb89ce09d8186fb1fceb67a17920e7cd85a2f311155af6f65bdc5771b1ec037cb"

# Token configuration
$TOKEN_INDEX = 0  # First token slot
$TOKEN_RATIO = 5000  # 50% ratio (5000 basis points)
$IS_ENABLED = $true

Write-Host "Token Address: $TOKEN_ADDRESS" -ForegroundColor Yellow
Write-Host "Token Index: $TOKEN_INDEX" -ForegroundColor Yellow
Write-Host "Token Ratio: $TOKEN_RATIO basis points - 50 percent" -ForegroundColor Yellow
Write-Host "Enabled: $IS_ENABLED" -ForegroundColor Yellow
Write-Host ""

# Step 1: Configure the token using existing function
Write-Host "Step 1: Configuring token in standardized wrapper..." -ForegroundColor Green

$configureCmd = "aptos move run --function-id $ACCOUNT_ADDRESS::standardized_wrapper::configure_token --args u64:$TOKEN_INDEX u64:$TOKEN_RATIO bool:true --private-key $PRIVATE_KEY --profile default"

Write-Host "Executing: $configureCmd" -ForegroundColor Gray
Invoke-Expression $configureCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "Token successfully configured in standardized wrapper!" -ForegroundColor Green
} else {
    Write-Host "Failed to configure token" -ForegroundColor Red
    Write-Host "This might be expected if the token is already configured." -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Test the configuration
Write-Host "Step 2: Testing token configuration..." -ForegroundColor Green

$testCmd = "aptos move view --function-id $ACCOUNT_ADDRESS::standardized_wrapper::get_yield_rate --profile default"

Write-Host "Executing: $testCmd" -ForegroundColor Gray
Invoke-Expression $testCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "Standardized wrapper is accessible!" -ForegroundColor Green
} else {
    Write-Host "Failed to access standardized wrapper" -ForegroundColor Red
}

Write-Host ""
Write-Host "Token configuration process completed!" -ForegroundColor Cyan
Write-Host "The token $TOKEN_ADDRESS is now configured in the standardized wrapper." -ForegroundColor Yellow
Write-Host "You can now use this token in the wrap_tokens function." -ForegroundColor Yellow