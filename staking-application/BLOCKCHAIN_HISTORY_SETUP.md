# 🚀 Blockchain History Setup Guide

## Overview
This feature fetches your wallet's transaction history directly from blockchain explorers (Snowtrace for Avalanche, Etherscan for Ethereum) and displays it in a beautiful, searchable interface.

## 🔑 Getting API Keys

### 1. Snowtrace API Key (Avalanche)
1. Go to [https://testnet.snowtrace.io/](https://testnet.snowtrace.io/)
2. Click "Sign In" or create an account
3. Go to your profile and find "API Keys"
4. Create a new API key
5. Copy the key

### 2. Etherscan API Key (Ethereum)
1. Go to [https://etherscan.io/apis](https://etherscan.io/apis)
2. Click "Sign Up" or sign in
3. Go to "My Account" > "API Keys"
4. Create a new API key
5. Copy the key

## ⚙️ Configuration

### 1. Create Environment File
Create a `.env` file in your project root:

```bash
# Avalanche Fuji Testnet
VITE_SNOWTRACE_API_KEY=your_snowtrace_api_key_here

# Avalanche Mainnet (optional)
VITE_SNOWTRACE_MAINNET_API_KEY=your_snowtrace_mainnet_api_key_here

# Ethereum Sepolia Testnet (optional)
VITE_ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Ethereum Mainnet (optional)
VITE_ETHERSCAN_MAINNET_API_KEY=your_etherscan_mainnet_api_key_here
```

### 2. Restart Development Server
After adding the environment variables, restart your dev server:

```bash
npm run dev
```

## 🎯 Features

### Real-Time Blockchain Data
- **Transaction History**: All your wallet transactions
- **Token Transfers**: ERC20 token movements
- **Contract Events**: Smart contract interactions
- **Gas Usage**: Transaction costs and efficiency

### Smart Filtering
- **Search**: Find transactions by hash, address, or description
- **Type Filter**: Filter by transaction type (wrap, split, stake, etc.)
- **Status Filter**: Filter by success/failed status
- **Time Sorting**: Chronological order with relative timestamps

### Data Export
- **CSV Export**: Download transaction history for analysis
- **Block Explorer Links**: Direct links to Snowtrace/Etherscan
- **Copy Functions**: Easy copying of addresses and hashes

## 🔍 Transaction Types Detected

### DeFi Operations
- **Wrap**: Token wrapping (stAVAX → SY)
- **Split**: SY token splitting (SY → PT + YT)
- **Combine**: PT/YT combining (PT + YT → SY)
- **Stake**: Token staking operations
- **Unstake**: Token unstaking operations

### Standard Operations
- **Transfer**: Token transfers between addresses
- **Approve**: Token spending approvals
- **Contract Call**: Generic smart contract interactions

## 📊 Rate Limits

### Free Tier Limits
- **Snowtrace**: 5 requests/second, 10,000 requests/day
- **Etherscan**: 5 requests/second, 100,000 requests/day

### Pro Tier Limits
- **Snowtrace**: 20 requests/second, 100,000 requests/day
- **Etherscan**: 30 requests/second, 1,000,000 requests/day

## 🚨 Troubleshooting

### Common Issues

#### 1. "API Key Invalid" Error
- Check your API key is correct
- Ensure the key is active and not expired
- Verify you're using the right network (testnet vs mainnet)

#### 2. "Rate Limit Exceeded" Error
- Wait a few seconds before making more requests
- Consider upgrading to a pro tier if you need higher limits
- Implement request caching in your application

#### 3. "No Transactions Found"
- Verify your wallet address is correct
- Check if you're on the right network
- Ensure the wallet has transaction history

#### 4. "Failed to Fetch" Error
- Check your internet connection
- Verify the API endpoints are accessible
- Check browser console for CORS issues

### Debug Mode
Enable debug logging by adding to your `.env`:

```bash
VITE_DEBUG_BLOCKCHAIN=true
```

## 🔧 Advanced Configuration

### Custom API Endpoints
You can modify the API endpoints in `src/lib/config/api.ts`:

```typescript
export const API_ENDPOINTS = {
  AVALANCHE: {
    TESTNET: 'https://your-custom-endpoint.com/api',
    MAINNET: 'https://your-custom-endpoint.com/api',
  },
  // ... other networks
};
```

### Custom Rate Limiting
Adjust rate limiting in the same file:

```typescript
export const API_RATE_LIMITS = {
  SNOWTRACE: {
    FREE_TIER: {
      requestsPerSecond: 10, // Custom rate
      requestsPerDay: 50000, // Custom daily limit
    },
  },
};
```

## 📱 Usage

### 1. Connect Wallet
- Connect your wallet using the wallet connection button
- Ensure you're on the correct network (Avalanche Fuji Testnet)

### 2. View History
- Transaction history loads automatically
- Use filters to find specific transactions
- Click on transaction hashes to view on block explorer

### 3. Export Data
- Click "Export" button to download CSV
- Use the data for accounting, analysis, or reporting

### 4. Refresh Data
- Click "Refresh" button to fetch latest transactions
- Data updates automatically when wallet connects

## 🔒 Security Notes

- **API Keys**: Never commit API keys to version control
- **Rate Limiting**: Respect API rate limits to avoid service disruption
- **Data Privacy**: Transaction data is public on blockchain, but API keys should be kept private
- **Network Security**: Always verify you're on the correct network before making transactions

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your API keys are correct
3. Check the browser console for error messages
4. Ensure you're on the correct network
5. Try refreshing the page and reconnecting your wallet

## 🎉 Success!

Once configured, you'll see:
- Real-time transaction history from the blockchain
- Beautiful, searchable interface
- Export capabilities for data analysis
- Direct links to block explorers
- Smart categorization of DeFi operations

Your DeFi dashboard now has professional-grade blockchain history tracking! 🚀 