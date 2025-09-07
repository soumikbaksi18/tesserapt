# 🚀 Bitmax Protocol - Comprehensive Deployment Guide

## Table of Contents
1. [Prerequisites & Environment Setup](#prerequisites--environment-setup)
2. [Development Environment Configuration](#development-environment-configuration)
3. [Contract Compilation & Testing](#contract-compilation--testing)
4. [Testnet Deployment](#testnet-deployment)
5. [Mainnet Deployment](#mainnet-deployment)
6. [Contract Verification](#contract-verification)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites & Environment Setup

### 🔧 System Requirements

**Minimum Requirements:**
- **OS:** Windows 10/11, macOS 10.15+, or Ubuntu 18.04+
- **RAM:** 8GB minimum, 16GB recommended
- **Storage:** 10GB free space
- **Network:** Stable internet connection

### 📦 Required Software Installation

#### Step 1: Install Aptos CLI

**For Windows (PowerShell as Administrator):**
```powershell
# Download and install Aptos CLI
iwr "https://aptos.dev/scripts/install_cli.py" -useb | Select-Object -ExpandProperty Content | python3

# Verify installation
aptos --version
```

**For macOS:**
```bash
# Using Homebrew
brew install aptos

# Or using curl
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3

# Verify installation
aptos --version
```

**For Linux (Ubuntu/Debian):**
```bash
# Install dependencies
sudo apt update
sudo apt install curl python3 python3-pip

# Install Aptos CLI
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH="$HOME/.local/bin:$PATH"

# Verify installation
aptos --version
```

#### Step 2: Install Node.js & npm (for frontend integration)

**For Windows:**
```powershell
# Download from https://nodejs.org/
# Or using Chocolatey
choco install nodejs

# Verify installation
node --version
npm --version
```

**For macOS:**
```bash
# Using Homebrew
brew install node

# Verify installation
node --version
npm --version
```

**For Linux:**
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Step 3: Install Git

**For Windows:**
```powershell
# Download from https://git-scm.com/
# Or using Chocolatey
choco install git
```

**For macOS:**
```bash
# Using Homebrew
brew install git
```

**For Linux:**
```bash
sudo apt install git
```

---

## Development Environment Configuration

### 🔑 Wallet Setup

#### Step 1: Create Aptos Account

```bash
# Initialize Aptos CLI configuration
aptos init

# Follow the prompts:
# 1. Choose network (testnet for development)
# 2. Enter private key (or generate new one)
# 3. Confirm configuration
```

**Example Output:**
```
Configuring for profile default
Choose network from [devnet, testnet, mainnet, local, custom | defaults to devnet]
testnet
Enter your private key as a hex literal (0x...) [Current: None | No input: Generate new key]

No key given, generating key...
Account 0x742d35Cc6Db8e5ac6C6B8e5ac6C6B8e5ac6C6B8e5ac6C6B8e5ac6C6B8e5ac does not exist, creating it and funding it with 100000000 Octas
Account 0x742d35Cc6Db8e5ac6C6B8e5ac6C6B8e5ac6C6B8e5ac6C6B8e5ac6C6B8e5ac funded successfully

---
Aptos CLI is now set up for account 0x742d35Cc6Db8e5ac6C6B8e5ac6C6B8e5ac6C6B8e5ac6C6B8e5ac6C6B8e5ac!
```

#### Step 2: Fund Your Account (Testnet)

```bash
# Request testnet tokens
aptos account fund-with-faucet --account default

# Check balance
aptos account list --query balance
```

### 📁 Project Structure Setup

```bash
# Clone or create project directory
mkdir bitmax-protocol-deployment
cd bitmax-protocol-deployment

# Copy contract files
cp -r /path/to/aptos_contracts ./

# Verify structure
tree aptos_contracts/
```

**Expected Structure:**
```
aptos_contracts/
├── Move.toml
├── sources/
│   ├── core/
│   │   └── yield_tokenization.move
│   ├── tokens/
│   │   ├── pt_token.move
│   │   ├── yt_token.move
│   │   └── standardized_wrapper.move
│   ├── infrastructure/
│   │   ├── simple_amm.move
│   │   └── staking_dapp.move
│   ├── oracles/
│   │   └── price_oracle.move
│   ├── advanced/
│   │   └── yt_auto_converter.move
│   └── tests/
└── scripts/
```

---

## Contract Compilation & Testing

### 🔨 Compilation

#### Step 1: Navigate to Contract Directory

```bash
cd aptos_contracts
```

#### Step 2: Compile Contracts

```bash
# Compile contracts
aptos move compile --dev

# Expected output
INCLUDING DEPENDENCY AptosFramework
INCLUDING DEPENDENCY AptosStdlib
INCLUDING DEPENDENCY MoveStdlib
BUILDING bitmax_protocol
{
  "Result": "Success"
}
```

#### Step 3: Run Tests

```bash
# Run all tests
aptos move test --dev

# Run with coverage
aptos move test --coverage --dev

# Run specific test
aptos move test --dev --filter test_initialize_protocol
```

**Expected Test Results:**
```
Running Move unit tests
[ PASS    ] 0x42::syntax_test::test_basic_syntax
[ PASS    ] 0x42::syntax_test::test_conditional_expressions
[ PASS    ] 0x42::basic_test::test_configure_wrapper_tokens
[ PASS    ] 0x42::comprehensive_test::test_advanced_protocol_features
[ PASS    ] 0x42::amm_functionality_test::test_amm_basic_functionality
[ PASS    ] 0x42::basic_test::test_create_maturity
[ PASS    ] 0x42::amm_functionality_test::test_amm_initialization
[ PASS    ] 0x42::comprehensive_test::test_price_oracle_advanced_features
[ PASS    ] 0x42::basic_test::test_initialize_protocol
[ PASS    ] 0x42::comprehensive_test::test_protocol_pause_resume_cycle
[ PASS    ] 0x42::basic_test::test_pause_unpause_functionality
[ PASS    ] 0x42::comprehensive_test::test_staking_initialization_variants
[ PASS    ] 0x42::basic_test::test_price_oracle_initialization
[ PASS    ] 0x42::comprehensive_test::test_token_initialization_with_maturity
[ PASS    ] 0x42::basic_test::test_staking_initialization
[ PASS    ] 0x42::comprehensive_test::test_token_minting_operations
Test result: OK. Total tests: 16; passed: 16; failed: 0
```

---

## Testnet Deployment

### 🌐 Network Configuration

#### Step 1: Configure for Testnet

```bash
# Set network to testnet
aptos init --network testnet

# Or update existing profile
aptos config set-global-config --config-type network --value testnet
```

#### Step 2: Verify Network Connection

```bash
# Check network status
aptos node get-sync-state --url https://fullnode.testnet.aptoslabs.com/v1

# Check account balance
aptos account list --query balance --account default
```

### 📤 Contract Deployment

#### Step 1: Deploy Core Protocol

```bash
# Deploy yield tokenization module
aptos move publish --named-addresses bitmax=default --assume-yes

# Expected output
package size 41234 bytes
Do you want to submit a transaction for a range of [123400 - 185100] Octas at a gas unit price of 100 Octas? [yes/no] >
yes
Transaction submitted: 0x8b2d4c5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c
{
  "Result": {
    "transaction_hash": "0x8b2d4c5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
    "gas_used": 1234,
    "gas_unit_price": 100,
    "sender": "0x742d35Cc6Db8e5ac6C6B8e5ac6C6B8e5ac6C6B8e5ac6C6B8e5ac6C6B8e5ac",
    "success": true,
    "version": 12345678,
    "vm_status": "Executed successfully"
  }
}
```

#### Step 2: Initialize Contracts

Create initialization script:

```bash
# Create initialization script
cat > initialize_contracts.sh << 'EOF'
#!/bin/bash

echo "🚀 Initializing Bitmax Protocol Contracts..."

# Get account address
ACCOUNT=$(aptos config show-profiles --profile default | grep "account" | awk '{print $2}')
echo "Using account: $ACCOUNT"

# Initialize yield tokenization
echo "📊 Initializing Yield Tokenization..."
aptos move run \
  --function-id ${ACCOUNT}::yield_tokenization::initialize \
  --args string:"Bitmax Protocol" string:"BITMAX" \
  --assume-yes

# Initialize standardized wrapper
echo "📦 Initializing Standardized Wrapper..."
aptos move run \
  --function-id ${ACCOUNT}::standardized_wrapper::initialize \
  --args string:"Standardized Yield" string:"SY" u64:500 \
  --assume-yes

# Initialize price oracle
echo "💰 Initializing Price Oracle..."
aptos move run \
  --function-id ${ACCOUNT}::price_oracle::initialize \
  --assume-yes

# Initialize staking dapp
echo "🥩 Initializing Staking DApp..."
aptos move run \
  --function-id ${ACCOUNT}::staking_dapp::initialize \
  --type-args 0x1::aptos_coin::AptosCoin \
  --args vector<u8>:"Staking Reward" vector<u8>:"SREWARD" \
  --assume-yes

# Initialize AMM
echo "🔄 Initializing AMM..."
aptos move run \
  --function-id ${ACCOUNT}::simple_amm::initialize \
  --type-args ${ACCOUNT}::pt_token::PTToken ${ACCOUNT}::yt_token::YTToken \
  --assume-yes

echo "✅ All contracts initialized successfully!"
EOF

# Make executable and run
chmod +x initialize_contracts.sh
./initialize_contracts.sh
```

#### Step 3: Create Maturity Tokens

```bash
# Calculate future timestamp (30 days from now)
FUTURE_TIMESTAMP=$(($(date +%s) + 2592000))

# Create maturity
aptos move run \
  --function-id ${ACCOUNT}::yield_tokenization::create_maturity \
  --args u64:${FUTURE_TIMESTAMP} \
  --assume-yes

# Initialize PT token
aptos move run \
  --function-id ${ACCOUNT}::pt_token::initialize \
  --args string:"Principal Token" string:"PT" u64:${FUTURE_TIMESTAMP} \
  --assume-yes

# Initialize YT token
aptos move run \
  --function-id ${ACCOUNT}::yt_token::initialize \
  --args string:"Yield Token" string:"YT" u64:${FUTURE_TIMESTAMP} \
  --assume-yes
```

### 📝 Record Deployment Information

Create deployment record:

```bash
cat > deployment_record.json << EOF
{
  "network": "testnet",
  "deployment_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "deployer_address": "${ACCOUNT}",
  "contracts": {
    "yield_tokenization": "${ACCOUNT}::yield_tokenization",
    "standardized_wrapper": "${ACCOUNT}::standardized_wrapper",
    "pt_token": "${ACCOUNT}::pt_token",
    "yt_token": "${ACCOUNT}::yt_token",
    "price_oracle": "${ACCOUNT}::price_oracle",
    "staking_dapp": "${ACCOUNT}::staking_dapp",
    "simple_amm": "${ACCOUNT}::simple_amm",
    "yt_auto_converter": "${ACCOUNT}::yt_auto_converter"
  },
  "initialization_transactions": [
    "0x8b2d4c5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c"
  ],
  "maturity_timestamp": ${FUTURE_TIMESTAMP}
}
EOF

echo "📄 Deployment record saved to deployment_record.json"
```

---

## Mainnet Deployment

### ⚠️ Pre-Deployment Checklist

**Security Checklist:**
- [ ] All tests passing (16/16)
- [ ] Code audit completed
- [ ] Security review completed
- [ ] Testnet deployment successful
- [ ] Integration testing completed
- [ ] Documentation reviewed
- [ ] Emergency procedures defined
- [ ] Monitoring setup prepared

### 💰 Mainnet Preparation

#### Step 1: Mainnet Account Setup

```bash
# Create mainnet profile
aptos init --profile mainnet --network mainnet

# Fund account (use official faucet or exchange)
# Minimum recommended: 10 APT for deployment + operations
```

#### Step 2: Final Testing

```bash
# Run comprehensive tests
aptos move test --dev --coverage

# Verify 100% test success
# Expected: Test result: OK. Total tests: 16; passed: 16; failed: 0
```

### 🚀 Mainnet Deployment Process

#### Step 1: Deploy to Mainnet

```bash
# Switch to mainnet profile
aptos config set-global-config --config-type network --value mainnet

# Deploy contracts
aptos move publish \
  --profile mainnet \
  --named-addresses bitmax=mainnet \
  --gas-unit-price 100 \
  --max-gas 1000000 \
  --assume-yes
```

#### Step 2: Initialize Mainnet Contracts

```bash
# Use the same initialization script but with mainnet profile
sed 's/--assume-yes/--profile mainnet --assume-yes/g' initialize_contracts.sh > initialize_mainnet.sh
chmod +x initialize_mainnet.sh
./initialize_mainnet.sh
```

#### Step 3: Verify Deployment

```bash
# Verify contract deployment
aptos account list --profile mainnet --query resources

# Check specific modules
aptos move view \
  --function-id ${MAINNET_ACCOUNT}::yield_tokenization::get_maturities \
  --profile mainnet
```

---

## Contract Verification

### 🔍 Verification Steps

#### Step 1: Module Verification

```bash
# Verify all modules are deployed
MODULES=(
  "yield_tokenization"
  "standardized_wrapper" 
  "pt_token"
  "yt_token"
  "price_oracle"
  "staking_dapp"
  "simple_amm"
  "yt_auto_converter"
)

for module in "${MODULES[@]}"; do
  echo "Verifying $module..."
  aptos account list --query modules --account ${ACCOUNT} | grep $module
done
```

#### Step 2: Function Testing

```bash
# Test core functions
echo "Testing yield tokenization..."
aptos move view \
  --function-id ${ACCOUNT}::yield_tokenization::is_paused

echo "Testing price oracle..."
aptos move view \
  --function-id ${ACCOUNT}::price_oracle::get_price \
  --args address:0x1
```

#### Step 3: Integration Verification

Create verification script:

```bash
cat > verify_deployment.js << 'EOF'
const { AptosClient, AptosAccount, FaucetClient } = require("aptos");

async function verifyDeployment() {
  const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");
  const accountAddress = "YOUR_ACCOUNT_ADDRESS";
  
  try {
    // Verify modules exist
    const modules = [
      "yield_tokenization",
      "standardized_wrapper",
      "pt_token", 
      "yt_token",
      "price_oracle",
      "staking_dapp",
      "simple_amm"
    ];
    
    for (const module of modules) {
      const moduleData = await client.getAccountModule(
        accountAddress,
        `${accountAddress}::${module}`
      );
      console.log(`✅ ${module} deployed successfully`);
    }
    
    // Test view functions
    const isPaused = await client.view({
      function: `${accountAddress}::yield_tokenization::is_paused`,
      arguments: [],
      type_arguments: []
    });
    
    console.log(`✅ Protocol paused status: ${isPaused[0]}`);
    
    console.log("🎉 All verifications passed!");
    
  } catch (error) {
    console.error("❌ Verification failed:", error);
  }
}

verifyDeployment();
EOF

# Install dependencies and run
npm init -y
npm install aptos
node verify_deployment.js
```

---

## Troubleshooting

### 🐛 Common Issues & Solutions

#### Issue 1: Compilation Errors

**Problem:** `error: unresolved import`
```bash
error: unresolved import
   ┌─ sources/core/yield_tokenization.move:4:5
   │
 4 │     use std::vector;
   │     ^^^^^^^^^^^^^^^ Unresolved import
```

**Solution:**
```bash
# Check Move.toml dependencies
cat Move.toml

# Ensure proper dependencies
[dependencies]
AptosFramework = { git = "https://github.com/aptos-labs/aptos-core.git", subdir = "aptos-move/framework/aptos-framework", rev = "mainnet" }
```

#### Issue 2: Insufficient Gas

**Problem:** `INSUFFICIENT_BALANCE_FOR_TRANSACTION_FEE`

**Solution:**
```bash
# Check balance
aptos account list --query balance

# Fund account (testnet)
aptos account fund-with-faucet --account default

# For mainnet, transfer APT from exchange
```

#### Issue 3: Address Resolution

**Problem:** `Named address 'bitmax' not found`

**Solution:**
```bash
# Ensure proper address mapping
aptos move publish --named-addresses bitmax=default

# Or specify explicit address
aptos move publish --named-addresses bitmax=0x742d35Cc6Db8e5ac6C6B8e5ac6C6B8e5ac6C6B8e5ac6C6B8e5ac6C6B8e5ac
```

#### Issue 4: Network Connection

**Problem:** Connection timeout or network errors

**Solution:**
```bash
# Check network status
curl -X GET "https://fullnode.testnet.aptoslabs.com/v1" -H "accept: application/json"

# Switch to different RPC endpoint
aptos config set-global-config --config-type rest-url --value https://testnet.aptoslabs.com/v1

# For mainnet
aptos config set-global-config --config-type rest-url --value https://fullnode.mainnet.aptoslabs.com/v1
```

### 📞 Getting Help

**Community Resources:**
- **Aptos Discord:** https://discord.gg/aptoslabs
- **Aptos Forum:** https://forum.aptoslabs.com/
- **GitHub Issues:** https://github.com/aptos-labs/aptos-core/issues
- **Documentation:** https://aptos.dev/

**Emergency Contacts:**
- For critical security issues: security@aptoslabs.com
- For urgent technical support: Create GitHub issue with "urgent" label

---

## Next Steps

After successful deployment:

1. **📱 Frontend Integration** - See [Frontend Integration Guide](./FRONTEND_INTEGRATION_GUIDE.md)
2. **📊 Monitoring Setup** - See [Monitoring Guide](./MONITORING_GUIDE.md)
3. **🔒 Security Hardening** - See [Security Guide](./SECURITY_GUIDE.md)
4. **📈 Analytics Integration** - See [Analytics Guide](./ANALYTICS_GUIDE.md)

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Environment setup complete
- [ ] All dependencies installed
- [ ] Tests passing (16/16)
- [ ] Code reviewed and audited
- [ ] Deployment script prepared

### Testnet Deployment
- [ ] Testnet account funded
- [ ] Contracts compiled successfully
- [ ] Contracts deployed to testnet
- [ ] Contracts initialized
- [ ] Verification completed
- [ ] Integration testing passed

### Mainnet Deployment
- [ ] Security checklist completed
- [ ] Mainnet account prepared and funded
- [ ] Final testing completed
- [ ] Contracts deployed to mainnet
- [ ] Contracts initialized on mainnet
- [ ] Mainnet verification completed
- [ ] Monitoring setup activated

### Post-Deployment
- [ ] Documentation updated with addresses
- [ ] Frontend integration completed
- [ ] User documentation published
- [ ] Community announcement made
- [ ] Support channels activated

---

**🎉 Congratulations! Your Bitmax Protocol contracts are now deployed and ready for use!**