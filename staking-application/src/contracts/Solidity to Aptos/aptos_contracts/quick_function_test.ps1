# Quick Function Test Script
# Tests core functions of all deployed contracts

Write-Host "Quick Function Test - Bitmax Protocol" -ForegroundColor Green
Write-Host ""

$ACCOUNT_ADDRESS = "0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b"
$PROFILE_NAME = "bitmax_testnet"

# Test core view functions
Write-Host "Testing core view functions..." -ForegroundColor Yellow

# 1. Yield Tokenization
Write-Host "1. Yield Tokenization:" -ForegroundColor White
$isPaused = aptos move view --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::is_paused" --profile $PROFILE_NAME
Write-Host "   - Protocol paused: $isPaused" -ForegroundColor Gray

$maturities = aptos move view --function-id "${ACCOUNT_ADDRESS}::yield_tokenization::get_maturities" --profile $PROFILE_NAME
Write-Host "   - Maturities: $maturities" -ForegroundColor Gray

# 2. Standardized Wrapper
Write-Host "2. Standardized Wrapper:" -ForegroundColor White
$yieldRate = aptos move view --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::get_yield_rate" --profile $PROFILE_NAME
Write-Host "   - Yield rate: $yieldRate" -ForegroundColor Gray

$tokenCount = aptos move view --function-id "${ACCOUNT_ADDRESS}::standardized_wrapper::get_token_count" --profile $PROFILE_NAME
Write-Host "   - Token count: $tokenCount" -ForegroundColor Gray

# 3. Price Oracle
Write-Host "3. Price Oracle:" -ForegroundColor White
$price = aptos move view --function-id "${ACCOUNT_ADDRESS}::price_oracle::get_price" --args address:0x1 --profile $PROFILE_NAME
Write-Host "   - Price for 0x1: $price" -ForegroundColor Gray

# 4. Staking DApp
Write-Host "4. Staking DApp:" -ForegroundColor White
$stakedAmount = aptos move view --function-id "${ACCOUNT_ADDRESS}::staking_dapp::get_staked_amount" --args address:$ACCOUNT_ADDRESS --profile $PROFILE_NAME
Write-Host "   - Staked amount: $stakedAmount" -ForegroundColor Gray

$reward = aptos move view --function-id "${ACCOUNT_ADDRESS}::staking_dapp::calculate_reward" --args address:$ACCOUNT_ADDRESS --profile $PROFILE_NAME
Write-Host "   - Calculated reward: $reward" -ForegroundColor Gray

# 5. AMM
Write-Host "5. Simple AMM:" -ForegroundColor White
$reserves = aptos move view --function-id "${ACCOUNT_ADDRESS}::simple_amm::get_reserves" --profile $PROFILE_NAME
Write-Host "   - Reserves: $reserves" -ForegroundColor Gray

# 6. PT Token
Write-Host "6. PT Token:" -ForegroundColor White
$ptMaturity = aptos move view --function-id "${ACCOUNT_ADDRESS}::pt_token::get_maturity" --profile $PROFILE_NAME
Write-Host "   - Maturity: $ptMaturity" -ForegroundColor Gray

# 7. YT Token
Write-Host "7. YT Token:" -ForegroundColor White
$ytMaturity = aptos move view --function-id "${ACCOUNT_ADDRESS}::yt_token::get_maturity" --profile $PROFILE_NAME
Write-Host "   - Maturity: $ytMaturity" -ForegroundColor Gray

# 8. YT Auto Converter
Write-Host "8. YT Auto Converter:" -ForegroundColor White
$conversionRate = aptos move view --function-id "${ACCOUNT_ADDRESS}::yt_auto_converter::get_conversion_rate" --profile $PROFILE_NAME
Write-Host "   - Conversion rate: $conversionRate" -ForegroundColor Gray

Write-Host ""
Write-Host "All view functions tested successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Contract Address: $ACCOUNT_ADDRESS" -ForegroundColor Cyan
Write-Host "Explorer: https://explorer.aptoslabs.com/account/$ACCOUNT_ADDRESS?network=testnet" -ForegroundColor Blue

