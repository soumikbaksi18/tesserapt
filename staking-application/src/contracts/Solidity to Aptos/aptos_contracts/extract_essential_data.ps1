# Extract Essential Deployment Data
# Extracts only the most important deployment data

Write-Host "Extracting Essential Deployment Data..." -ForegroundColor Green
Write-Host ""

$ACCOUNT_ADDRESS = "0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b"
$PROFILE_NAME = "bitmax_testnet"
$ESSENTIAL_DATA_DIR = "essential_data"

# Create directory
if (!(Test-Path $ESSENTIAL_DATA_DIR)) {
    New-Item -ItemType Directory -Path $ESSENTIAL_DATA_DIR
}

Write-Host "Creating essential data directory..." -ForegroundColor Yellow

# Extract contract addresses
Write-Host "Extracting contract addresses..." -ForegroundColor White

$contractAddresses = @{
    network = "testnet"
    deployer_address = $ACCOUNT_ADDRESS
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
    explorer_url = "https://explorer.aptoslabs.com/account/$ACCOUNT_ADDRESS?network=testnet"
    deployment_date = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
}

$contractAddresses | ConvertTo-Json -Depth 3 | Out-File -FilePath "$ESSENTIAL_DATA_DIR\contract_addresses.json" -Encoding UTF8

# Extract deployed modules
Write-Host "Extracting deployed modules..." -ForegroundColor White
$modules = aptos account list --profile $PROFILE_NAME --query modules
$modules | Out-File -FilePath "$ESSENTIAL_DATA_DIR\deployed_modules.json" -Encoding UTF8

# Create TypeScript file
Write-Host "Creating TypeScript file..." -ForegroundColor White
$tsContent = @"
// Bitmax Protocol Contract Addresses
export const CONTRACT_ADDRESSES = {
  YIELD_TOKENIZATION: "${ACCOUNT_ADDRESS}::yield_tokenization",
  STANDARDIZED_WRAPPER: "${ACCOUNT_ADDRESS}::standardized_wrapper",
  PT_TOKEN: "${ACCOUNT_ADDRESS}::pt_token",
  YT_TOKEN: "${ACCOUNT_ADDRESS}::yt_token",
  PRICE_ORACLE: "${ACCOUNT_ADDRESS}::price_oracle",
  STAKING_DAPP: "${ACCOUNT_ADDRESS}::staking_dapp",
  SIMPLE_AMM: "${ACCOUNT_ADDRESS}::simple_amm",
  YT_AUTO_CONVERTER: "${ACCOUNT_ADDRESS}::yt_auto_converter",
} as const;

export const DEPLOYER_ADDRESS = "${ACCOUNT_ADDRESS}";
export const NETWORK = "testnet";
"@

$tsContent | Out-File -FilePath "$ESSENTIAL_DATA_DIR\contracts.ts" -Encoding UTF8

# Create JavaScript file
Write-Host "Creating JavaScript file..." -ForegroundColor White
$jsContent = @"
// Bitmax Protocol Contract Addresses
export const CONTRACT_ADDRESSES = {
  YIELD_TOKENIZATION: "${ACCOUNT_ADDRESS}::yield_tokenization",
  STANDARDIZED_WRAPPER: "${ACCOUNT_ADDRESS}::standardized_wrapper",
  PT_TOKEN: "${ACCOUNT_ADDRESS}::pt_token",
  YT_TOKEN: "${ACCOUNT_ADDRESS}::yt_token",
  PRICE_ORACLE: "${ACCOUNT_ADDRESS}::price_oracle",
  STAKING_DAPP: "${ACCOUNT_ADDRESS}::staking_dapp",
  SIMPLE_AMM: "${ACCOUNT_ADDRESS}::simple_amm",
  YT_AUTO_CONVERTER: "${ACCOUNT_ADDRESS}::yt_auto_converter",
};

export const DEPLOYER_ADDRESS = "${ACCOUNT_ADDRESS}";
export const NETWORK = "testnet";
"@

$jsContent | Out-File -FilePath "$ESSENTIAL_DATA_DIR\contracts.js" -Encoding UTF8

Write-Host ""
Write-Host "✅ Essential data extracted successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Files created in: $ESSENTIAL_DATA_DIR" -ForegroundColor Cyan
Write-Host "  - contract_addresses.json" -ForegroundColor White
Write-Host "  - deployed_modules.json" -ForegroundColor White
Write-Host "  - contracts.ts" -ForegroundColor White
Write-Host "  - contracts.js" -ForegroundColor White
Write-Host ""
Write-Host "Ready for frontend integration!" -ForegroundColor Green

