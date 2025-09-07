# Bitmax Protocol - Deployment Guide

## Quick Start

### Prerequisites
- Aptos CLI installed (`curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3`)
- Move compiler available
- Aptos account with sufficient APT for gas fees

### 1. Clone and Setup
```bash
git clone <repository>
cd aptos_contracts
```

### 2. Compile Contracts
```bash
aptos move compile --named-addresses bitmax=<your_address>
```

### 3. Deploy to Testnet
```bash
aptos move publish --named-addresses bitmax=<your_address> --profile testnet
```

### 4. Initialize Protocol
```bash
aptos move run --function-id <your_address>::yield_tokenization::initialize \
  --args string:"Bitmax Protocol" string:"BITMAX" \
  --profile testnet
```

## Detailed Deployment Steps

### Step 1: Environment Setup

1. **Install Aptos CLI**:
```bash
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
```

2. **Initialize Aptos Account**:
```bash
aptos init --profile testnet
```

3. **Fund Account** (Testnet):
```bash
aptos account fund-with-faucet --profile testnet
```

### Step 2: Contract Compilation

1. **Update Move.toml**:
```toml
[addresses]
bitmax = "0x<your_address>"
```

2. **Compile All Modules**:
```bash
aptos move compile --named-addresses bitmax=0x<your_address>
```

3. **Run Tests** (Optional):
```bash
aptos move test --named-addresses bitmax=0x<your_address>
```

### Step 3: Contract Deployment

1. **Deploy All Modules**:
```bash
aptos move publish --named-addresses bitmax=0x<your_address> --profile testnet
```

2. **Verify Deployment**:
```bash
aptos account list --query modules --profile testnet
```

### Step 4: Protocol Initialization

Execute initialization functions in order:

1. **Initialize Yield Tokenization**:
```bash
aptos move run --function-id 0x<your_address>::yield_tokenization::initialize \
  --args string:"Bitmax Protocol" string:"BITMAX" \
  --profile testnet
```

2. **Initialize Standardized Wrapper**:
```bash
aptos move run --function-id 0x<your_address>::standardized_wrapper::initialize \
  --args string:"Standardized Yield" string:"SY" u64:500 \
  --profile testnet
```

3. **Initialize Price Oracle**:
```bash
aptos move run --function-id 0x<your_address>::price_oracle::initialize \
  --profile testnet
```

4. **Initialize Staking DApp**:
```bash
aptos move run --function-id 0x<your_address>::staking_dapp::initialize \
  --type-args 0x1::aptos_coin::AptosCoin \
  --profile testnet
```

5. **Initialize Auto Converter**:
```bash
aptos move run --function-id 0x<your_address>::yt_auto_converter::initialize \
  --args address:0x<your_address> address:0x<your_address> address:0x1 address:0x<your_address> \
  --profile testnet
```

### Step 5: Configuration

1. **Configure Token Ratios**:
```bash
# Configure first token (60% ratio)
aptos move run --function-id 0x<your_address>::standardized_wrapper::configure_token \
  --args u64:0 u64:6000 bool:true \
  --profile testnet

# Configure second token (40% ratio)  
aptos move run --function-id 0x<your_address>::standardized_wrapper::configure_token \
  --args u64:1 u64:4000 bool:true \
  --profile testnet
```

2. **Create Additional Maturities**:
```bash
# Create 90-day maturity
aptos move run --function-id 0x<your_address>::yield_tokenization::create_maturity \
  --args u64:$(($(date +%s) + 7776000)) \
  --profile testnet
```

3. **Add Price Updaters**:
```bash
aptos move run --function-id 0x<your_address>::price_oracle::add_price_updater \
  --args address:0x<price_feed_address> \
  --profile testnet
```

## Mainnet Deployment

### Additional Considerations for Mainnet

1. **Security Audit**: Ensure contracts are audited before mainnet deployment
2. **Gas Optimization**: Test gas costs on testnet first
3. **Backup Plans**: Have emergency procedures ready
4. **Monitoring**: Set up event monitoring and alerting

### Mainnet Steps

1. **Switch to Mainnet Profile**:
```bash
aptos init --profile mainnet
```

2. **Fund Mainnet Account**:
```bash
# Transfer APT to your mainnet address
```

3. **Deploy with Mainnet Profile**:
```bash
aptos move publish --named-addresses bitmax=0x<your_address> --profile mainnet
```

4. **Initialize with Production Parameters**:
```bash
# Use production-ready parameters
aptos move run --function-id 0x<your_address>::yield_tokenization::initialize \
  --args string:"Bitmax Protocol" string:"BITMAX" \
  --profile mainnet
```

## Post-Deployment Verification

### 1. Contract State Verification
```bash
# Check protocol state
aptos account get-resource --address 0x<your_address> \
  --resource-type 0x<your_address>::yield_tokenization::ProtocolState \
  --profile testnet

# Check wrapper state  
aptos account get-resource --address 0x<your_address> \
  --resource-type 0x<your_address>::standardized_wrapper::WrapperState \
  --profile testnet
```

### 2. Function Testing
```bash
# Test maturity creation
aptos move run --function-id 0x<your_address>::yield_tokenization::create_maturity \
  --args u64:$(($(date +%s) + 2592000)) \
  --profile testnet

# Verify maturities
aptos move view --function-id 0x<your_address>::yield_tokenization::get_maturities \
  --profile testnet
```

### 3. Event Monitoring
```bash
# Monitor events for successful operations
aptos event get-events-by-creation-number \
  --address 0x<your_address> \
  --creation-number 0 \
  --profile testnet
```

## Troubleshooting

### Common Issues

1. **Compilation Errors**:
   - Check Move.toml addresses match deployment address
   - Ensure all dependencies are properly imported
   - Verify syntax with `aptos move check`

2. **Deployment Failures**:
   - Insufficient gas: Fund account with more APT
   - Address conflicts: Use fresh address for deployment
   - Network issues: Try different RPC endpoint

3. **Initialization Errors**:
   - Wrong parameter types: Check function signatures
   - Permission errors: Ensure deployer is calling functions
   - State conflicts: Don't initialize twice

### Debug Commands

1. **Check Account Resources**:
```bash
aptos account list --query resources --profile testnet
```

2. **View Transaction Details**:
```bash
aptos transaction show --transaction-hash <tx_hash> --profile testnet
```

3. **Check Module Functions**:
```bash
aptos move view --function-id 0x<your_address>::<module>::<function> --profile testnet
```

## Production Checklist

- [ ] All contracts compiled successfully
- [ ] Tests pass on testnet
- [ ] Security audit completed
- [ ] Gas costs optimized
- [ ] Emergency procedures documented
- [ ] Monitoring systems ready
- [ ] Backup recovery plans tested
- [ ] Team trained on operations
- [ ] Documentation updated
- [ ] Community notified

## Support

For deployment issues:
1. Check the troubleshooting section above
2. Review contract documentation in `CONTRACTS_DOCUMENTATION.md`
3. Test on devnet/testnet first
4. Ensure proper gas estimation

## Security Notes

- Never deploy to mainnet without thorough testing
- Keep private keys secure and use hardware wallets for mainnet
- Implement proper access controls and emergency stops
- Monitor contract events for unusual activity
- Have incident response procedures ready