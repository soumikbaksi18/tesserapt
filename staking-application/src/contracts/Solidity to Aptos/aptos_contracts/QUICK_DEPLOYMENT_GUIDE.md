# 🚀 Quick Deployment Guide - Bitmax Protocol

## Your Account Details
- **Address:** `0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b`
- **Network:** Aptos Testnet
- **Profile:** `bitmax_testnet`

## ⚡ One-Click Deployment

### For Windows (PowerShell):
```powershell
cd aptos_contracts
.\deploy_testnet.ps1
```

### For Linux/macOS (Bash):
```bash
cd aptos_contracts
chmod +x deploy_testnet.sh
./deploy_testnet.sh
```

## 📋 What the Script Does

1. **🔧 Setup** - Creates Aptos profile with your credentials
2. **💰 Funding** - Requests testnet tokens from faucet
3. **🔨 Compilation** - Compiles all Move contracts
4. **🧪 Testing** - Runs comprehensive test suite
5. **📤 Deployment** - Deploys all 8 contracts to testnet
6. **🏗️ Initialization** - Initializes all contracts in correct order
7. **⚙️ Configuration** - Sets up token ratios and parameters
8. **🔍 Verification** - Verifies deployment success

## 📦 Contracts Being Deployed

1. **Yield Tokenization** - Core protocol
2. **Standardized Wrapper** - Entry point
3. **PT Token** - Principal tokens
4. **YT Token** - Yield tokens
5. **Price Oracle** - Price feeds
6. **Staking DApp** - Yield source
7. **Simple AMM** - Trading mechanism
8. **YT Auto Converter** - AI component

## 🎯 Expected Results

After successful deployment:
- ✅ All 8 contracts deployed
- ✅ All contracts initialized
- ✅ Token ratios configured (60%/40%)
- ✅ Maturity created (30 days)
- ✅ Deployment record saved

## 🔗 View Your Deployment

**Aptos Explorer:** https://explorer.aptoslabs.com/account/0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b?network=testnet

## 🆘 Troubleshooting

If deployment fails:
1. Check internet connection
2. Verify Aptos CLI is installed: `aptos --version`
3. Ensure account has sufficient balance
4. Check for compilation errors

## 📞 Support

If you encounter issues:
1. Check the error message
2. Verify all prerequisites are met
3. Try running individual commands manually
4. Check Aptos testnet status

---

**Ready to deploy? Just run the script! 🚀**

