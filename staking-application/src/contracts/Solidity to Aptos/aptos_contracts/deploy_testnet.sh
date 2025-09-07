#!/bin/bash

# Bitmax Protocol - Testnet Deployment Script
# Address: 0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b

set -e  # Exit on any error

echo "🚀 Starting Bitmax Protocol Testnet Deployment..."
echo "📍 Using address: 0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b"
echo ""

# Set variables
ACCOUNT_ADDRESS="0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b"
PROFILE_NAME="bitmax_testnet"

# Create Aptos profile
echo "🔧 Setting up Aptos profile..."
aptos init --profile $PROFILE_NAME --network testnet --private-key ed25519-priv-0x5fbcf2a355d9c35f65de942b1ff62f58ca9689a0360171a3fc81d66dcf22042c --assume-yes

# Fund account
echo "💰 Funding testnet account..."
aptos account fund-with-faucet --profile $PROFILE_NAME

# Check balance
echo "💳 Checking account balance..."
aptos account list --profile $PROFILE_NAME --query balance

# Update Move.toml with actual address
echo "📝 Updating Move.toml with deployment address..."
sed -i "s/bitmax = \"_\"/bitmax = \"$ACCOUNT_ADDRESS\"/" Move.toml

# Compile contracts
echo "🔨 Compiling contracts..."
aptos move compile --named-addresses bitmax=$ACCOUNT_ADDRESS

# Run tests
echo "🧪 Running tests..."
aptos move test --named-addresses bitmax=$ACCOUNT_ADDRESS

# Deploy contracts
echo "📤 Deploying contracts to testnet..."
aptos move publish --named-addresses bitmax=$ACCOUNT_ADDRESS --profile $PROFILE_NAME --assume-yes

# Wait for deployment to complete
echo "⏳ Waiting for deployment to complete..."
sleep 10

# Initialize Yield Tokenization
echo "🏗️ Initializing Yield Tokenization..."
aptos move run \
  --function-id ${ACCOUNT_ADDRESS}::yield_tokenization::initialize \
  --args string:"Bitmax Protocol" string:"BITMAX" \
  --profile $PROFILE_NAME \
  --assume-yes

# Initialize Standardized Wrapper
echo "📦 Initializing Standardized Wrapper..."
aptos move run \
  --function-id ${ACCOUNT_ADDRESS}::standardized_wrapper::initialize \
  --args string:"Standardized Yield Token" string:"SY" u64:500 \
  --profile $PROFILE_NAME \
  --assume-yes

# Initialize Price Oracle
echo "💰 Initializing Price Oracle..."
aptos move run \
  --function-id ${ACCOUNT_ADDRESS}::price_oracle::initialize \
  --profile $PROFILE_NAME \
  --assume-yes

# Initialize Staking DApp
echo "🥩 Initializing Staking DApp..."
aptos move run \
  --function-id ${ACCOUNT_ADDRESS}::staking_dapp::initialize \
  --type-args 0x1::aptos_coin::AptosCoin \
  --args vector<u8>:"Staking Reward" vector<u8>:"SREWARD" \
  --profile $PROFILE_NAME \
  --assume-yes

# Initialize Simple AMM
echo "🔄 Initializing Simple AMM..."
aptos move run \
  --function-id ${ACCOUNT_ADDRESS}::simple_amm::initialize \
  --type-args ${ACCOUNT_ADDRESS}::pt_token::PTToken ${ACCOUNT_ADDRESS}::yt_token::YTToken \
  --profile $PROFILE_NAME \
  --assume-yes

# Initialize YT Auto Converter
echo "🤖 Initializing YT Auto Converter..."
aptos move run \
  --function-id ${ACCOUNT_ADDRESS}::yt_auto_converter::initialize \
  --args address:${ACCOUNT_ADDRESS} address:${ACCOUNT_ADDRESS} address:0x1 address:${ACCOUNT_ADDRESS} \
  --profile $PROFILE_NAME \
  --assume-yes

# Create maturity (30 days from now)
echo "📅 Creating maturity (30 days from now)..."
FUTURE_TIMESTAMP=$(($(date +%s) + 2592000))
aptos move run \
  --function-id ${ACCOUNT_ADDRESS}::yield_tokenization::create_maturity \
  --args u64:${FUTURE_TIMESTAMP} \
  --profile $PROFILE_NAME \
  --assume-yes

# Initialize PT Token
echo "🎫 Initializing PT Token..."
aptos move run \
  --function-id ${ACCOUNT_ADDRESS}::pt_token::initialize \
  --args string:"Principal Token" string:"PT" u64:${FUTURE_TIMESTAMP} \
  --profile $PROFILE_NAME \
  --assume-yes

# Initialize YT Token
echo "🎫 Initializing YT Token..."
aptos move run \
  --function-id ${ACCOUNT_ADDRESS}::yt_token::initialize \
  --args string:"Yield Token" string:"YT" u64:${FUTURE_TIMESTAMP} \
  --profile $PROFILE_NAME \
  --assume-yes

# Configure token ratios
echo "⚙️ Configuring token ratios..."
aptos move run \
  --function-id ${ACCOUNT_ADDRESS}::standardized_wrapper::configure_token \
  --args u64:0 u64:6000 bool:true \
  --profile $PROFILE_NAME \
  --assume-yes

aptos move run \
  --function-id ${ACCOUNT_ADDRESS}::standardized_wrapper::configure_token \
  --args u64:1 u64:4000 bool:true \
  --profile $PROFILE_NAME \
  --assume-yes

# Verify deployment
echo "🔍 Verifying deployment..."
aptos account list --profile $PROFILE_NAME --query modules

# Test core functions
echo "🧪 Testing core functions..."
aptos move view \
  --function-id ${ACCOUNT_ADDRESS}::yield_tokenization::is_paused \
  --profile $PROFILE_NAME

aptos move view \
  --function-id ${ACCOUNT_ADDRESS}::yield_tokenization::get_maturities \
  --profile $PROFILE_NAME

# Create deployment record
echo "📄 Creating deployment record..."
cat > deployment_record.json << EOF
{
  "network": "testnet",
  "deployment_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "deployer_address": "${ACCOUNT_ADDRESS}",
  "profile_name": "${PROFILE_NAME}",
  "contracts": {
    "yield_tokenization": "${ACCOUNT_ADDRESS}::yield_tokenization",
    "standardized_wrapper": "${ACCOUNT_ADDRESS}::standardized_wrapper",
    "pt_token": "${ACCOUNT_ADDRESS}::pt_token",
    "yt_token": "${ACCOUNT_ADDRESS}::yt_token",
    "price_oracle": "${ACCOUNT_ADDRESS}::price_oracle",
    "staking_dapp": "${ACCOUNT_ADDRESS}::staking_dapp",
    "simple_amm": "${ACCOUNT_ADDRESS}::simple_amm",
    "yt_auto_converter": "${ACCOUNT_ADDRESS}::yt_auto_converter"
  },
  "maturity_timestamp": ${FUTURE_TIMESTAMP},
  "status": "deployed_successfully"
}
EOF

echo ""
echo "🎉 Deployment completed successfully!"
echo "📍 Contract Address: ${ACCOUNT_ADDRESS}"
echo "🌐 Network: Aptos Testnet"
echo "📄 Deployment record saved to: deployment_record.json"
echo ""
echo "🔗 View on Aptos Explorer:"
echo "https://explorer.aptoslabs.com/account/${ACCOUNT_ADDRESS}?network=testnet"
echo ""
echo "✅ All contracts are now live and ready for use!"

