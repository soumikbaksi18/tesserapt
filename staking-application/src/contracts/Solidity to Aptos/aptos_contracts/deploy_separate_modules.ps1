# Separate Module Deployment Script
# Deploys each contract as a separate module for maximum control

Write-Host "========================================" -ForegroundColor Green
Write-Host "  BITMAX PROTOCOL - SEPARATE MODULE DEPLOYMENT" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$ACCOUNT_ADDRESS = "0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b"
$PROFILE_NAME = "bitmax_testnet"
$PRIVATE_KEY = "ed25519-priv-0x5fbcf2a355d9c35f65de942b1ff62f58ca9689a0360171a3fc81d66dcf22042c"

# Setup
Write-Host "Setting up deployment environment..." -ForegroundColor Yellow
aptos init --profile $PROFILE_NAME --network testnet --private-key $PRIVATE_KEY --assume-yes
aptos account fund-with-faucet --profile $PROFILE_NAME
(Get-Content Move.toml) -replace 'bitmax = "_"', "bitmax = `"$ACCOUNT_ADDRESS`"" | Set-Content Move.toml

Write-Host ""

# Deploy each module separately
Write-Host "Deploying each module separately..." -ForegroundColor Yellow
Write-Host ""

# Module 1: Yield Tokenization
Write-Host "MODULE 1: Deploying Yield Tokenization..." -ForegroundColor Cyan
Write-Host "Deploying core protocol module..." -ForegroundColor Gray
aptos move publish --named-addresses bitmax=$ACCOUNT_ADDRESS --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Yield Tokenization module deployed!" -ForegroundColor Green
} else {
    Write-Host "❌ Yield Tokenization module deployment failed!" -ForegroundColor Red
}

Write-Host ""

# Module 2: Standardized Wrapper
Write-Host "MODULE 2: Deploying Standardized Wrapper..." -ForegroundColor Cyan
Write-Host "Deploying entry point module..." -ForegroundColor Gray
aptos move publish --named-addresses bitmax=$ACCOUNT_ADDRESS --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Standardized Wrapper module deployed!" -ForegroundColor Green
} else {
    Write-Host "❌ Standardized Wrapper module deployment failed!" -ForegroundColor Red
}

Write-Host ""

# Module 3: PT Token
Write-Host "MODULE 3: Deploying PT Token..." -ForegroundColor Cyan
Write-Host "Deploying principal token module..." -ForegroundColor Gray
aptos move publish --named-addresses bitmax=$ACCOUNT_ADDRESS --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PT Token module deployed!" -ForegroundColor Green
} else {
    Write-Host "❌ PT Token module deployment failed!" -ForegroundColor Red
}

Write-Host ""

# Module 4: YT Token
Write-Host "MODULE 4: Deploying YT Token..." -ForegroundColor Cyan
Write-Host "Deploying yield token module..." -ForegroundColor Gray
aptos move publish --named-addresses bitmax=$ACCOUNT_ADDRESS --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ YT Token module deployed!" -ForegroundColor Green
} else {
    Write-Host "❌ YT Token module deployment failed!" -ForegroundColor Red
}

Write-Host ""

# Module 5: Price Oracle
Write-Host "MODULE 5: Deploying Price Oracle..." -ForegroundColor Cyan
Write-Host "Deploying price feed module..." -ForegroundColor Gray
aptos move publish --named-addresses bitmax=$ACCOUNT_ADDRESS --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Price Oracle module deployed!" -ForegroundColor Green
} else {
    Write-Host "❌ Price Oracle module deployment failed!" -ForegroundColor Red
}

Write-Host ""

# Module 6: Staking DApp
Write-Host "MODULE 6: Deploying Staking DApp..." -ForegroundColor Cyan
Write-Host "Deploying staking module..." -ForegroundColor Gray
aptos move publish --named-addresses bitmax=$ACCOUNT_ADDRESS --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Staking DApp module deployed!" -ForegroundColor Green
} else {
    Write-Host "❌ Staking DApp module deployment failed!" -ForegroundColor Red
}

Write-Host ""

# Module 7: Simple AMM
Write-Host "MODULE 7: Deploying Simple AMM..." -ForegroundColor Cyan
Write-Host "Deploying AMM module..." -ForegroundColor Gray
aptos move publish --named-addresses bitmax=$ACCOUNT_ADDRESS --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Simple AMM module deployed!" -ForegroundColor Green
} else {
    Write-Host "❌ Simple AMM module deployment failed!" -ForegroundColor Red
}

Write-Host ""

# Module 8: YT Auto Converter
Write-Host "MODULE 8: Deploying YT Auto Converter..." -ForegroundColor Cyan
Write-Host "Deploying auto converter module..." -ForegroundColor Gray
aptos move publish --named-addresses bitmax=$ACCOUNT_ADDRESS --profile $PROFILE_NAME --assume-yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ YT Auto Converter module deployed!" -ForegroundColor Green
} else {
    Write-Host "❌ YT Auto Converter module deployment failed!" -ForegroundColor Red
}

Write-Host ""

# Verify all modules
Write-Host "Verifying all deployed modules..." -ForegroundColor Yellow
$modules = aptos account list --profile $PROFILE_NAME --query modules
Write-Host "Deployed modules:" -ForegroundColor White
Write-Host $modules

Write-Host ""
Write-Host "All modules deployed successfully!" -ForegroundColor Green
Write-Host "Contract Address: $ACCOUNT_ADDRESS" -ForegroundColor Cyan
Write-Host "Explorer: https://explorer.aptoslabs.com/account/$ACCOUNT_ADDRESS?network=testnet" -ForegroundColor Blue

