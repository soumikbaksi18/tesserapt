# Petra Wallet Integration

This document describes the Petra Wallet integration for Aptos blockchain support in the staking application.

## Overview

The application now supports both Ethereum-compatible wallets (MetaMask, Core) and Aptos wallets (Petra) through a unified wallet system. Users can choose between different wallet types and switch between them seamlessly.

## Features

### Multi-Chain Wallet Support
- **Ethereum Wallets**: MetaMask, Core Wallet, and other Ethereum-compatible wallets
- **Aptos Wallets**: Petra Wallet integration
- **Unified Interface**: Single wallet selector component that handles both wallet types
- **Automatic Switching**: Only one wallet can be connected at a time

### Petra Wallet Features
- **Connection Management**: Connect and disconnect Petra wallet
- **Message Signing**: Sign arbitrary messages using Petra wallet
- **Transaction Signing**: Sign and submit transactions to Aptos network
- **Account Management**: Display connected account address and wallet type

## Architecture

### Context Providers
1. **AptosWalletContext**: Manages Petra wallet connection and operations
2. **UnifiedWalletContext**: Combines Ethereum and Aptos wallet functionality
3. **WalletProvider**: Original Ethereum wallet context (unchanged)

### Components
1. **WalletSelector**: Unified wallet connection component with dropdown for wallet type selection
2. **WalletDemo**: Demo page showcasing Petra wallet functionality

## Installation

The following packages were added to support Petra Wallet:

```bash
npm install @aptos-labs/wallet-adapter-react @aptos-labs/wallet-adapter-ant-design petra-plugin-wallet-adapter @aptos-labs/ts-sdk
```

## Usage

### Connecting Petra Wallet

1. Install the Petra Wallet browser extension
2. Click "Connect Wallet" in the navbar
3. Select "Aptos Wallets" from the dropdown
4. Approve the connection in Petra Wallet

### Using the Unified Wallet Context

```tsx
import { useUnifiedWallet } from '../contexts/UnifiedWalletContext';

const MyComponent = () => {
  const { 
    isConnected, 
    walletAddress, 
    walletType, 
    connectAptosWallet,
    signMessage 
  } = useUnifiedWallet();

  // Check if Aptos wallet is connected
  if (walletType === 'aptos' && isConnected) {
    // Use Aptos-specific functionality
  }
};
```

### Signing Messages

```tsx
const handleSignMessage = async () => {
  try {
    const signature = await signMessage('Hello from Aptos!');
    console.log('Signature:', signature);
  } catch (error) {
    console.error('Failed to sign message:', error);
  }
};
```

## File Structure

```
src/
├── contexts/
│   ├── AptosWalletContext.tsx      # Petra wallet context
│   ├── UnifiedWalletContext.tsx    # Unified wallet management
│   └── WalletContext.tsx           # Original Ethereum context
├── components/
│   ├── WalletSelector.tsx          # Unified wallet selector
│   └── layout/
│       └── Navbar.tsx              # Updated navbar with wallet selector
└── pages/
    └── WalletDemo.tsx              # Demo page for testing
```

## Testing

### Wallet Demo Page
Visit `/wallet-demo` to test Petra wallet functionality:
- Connection status display
- Message signing demo
- Wallet type identification

### Prerequisites
1. Install Petra Wallet browser extension
2. Create or import an Aptos account
3. Ensure you have some testnet APT for transactions

## Network Support

### Ethereum Networks
- Avalanche Fuji Testnet (Primary)
- Avalanche Mainnet
- Ethereum Mainnet
- Goerli Testnet

### Aptos Networks
- Aptos Testnet (Default)
- Aptos Mainnet

## Error Handling

The integration includes comprehensive error handling for:
- Wallet connection failures
- Network switching issues
- Transaction signing errors
- Message signing failures

## Future Enhancements

1. **Transaction Support**: Full transaction building and submission
2. **Token Management**: Aptos token balance queries
3. **Smart Contract Interaction**: Aptos Move contract calls
4. **Network Switching**: Aptos network switching support
5. **Multi-Account Support**: Multiple Aptos accounts

## Troubleshooting

### Common Issues

1. **Petra Wallet Not Detected**
   - Ensure Petra Wallet extension is installed and enabled
   - Refresh the page after installing the extension

2. **Connection Fails**
   - Check if Petra Wallet is unlocked
   - Ensure you're on a supported network

3. **Message Signing Fails**
   - Verify wallet is connected
   - Check if the message is valid

### Debug Information

Enable console logging to see detailed wallet connection information:
- Wallet provider detection
- Connection status changes
- Error messages and stack traces

## Security Considerations

1. **Private Key Security**: Petra Wallet handles all private key operations
2. **Transaction Validation**: Always validate transactions before signing
3. **Network Verification**: Ensure you're connected to the correct network
4. **Message Validation**: Validate message content before signing

## Contributing

When adding new Petra wallet features:
1. Update the AptosWalletContext with new functionality
2. Add corresponding methods to UnifiedWalletContext
3. Update the WalletDemo page for testing
4. Add proper error handling and user feedback
5. Update this documentation
