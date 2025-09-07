// API Configuration
// Get your free API keys from:
// - Snowtrace (Avalanche): https://testnet.snowtrace.io/
// - Etherscan (Ethereum): https://etherscan.io/apis

export const API_KEYS = {
  SNOWTRACE_TESTNET: process.env.VITE_SNOWTRACE_API_KEY || 'YourApiKeyToken',
  SNOWTRACE_MAINNET: process.env.VITE_SNOWTRACE_MAINNET_API_KEY || 'YourApiKeyToken',
  ETHERSCAN_SEPOLIA: process.env.VITE_ETHERSCAN_API_KEY || 'YourApiKeyToken',
  ETHERSCAN_MAINNET: process.env.VITE_ETHERSCAN_MAINNET_API_KEY || 'YourApiKeyToken',
};

export const API_ENDPOINTS = {
  AVALANCHE: {
    TESTNET: 'https://api-testnet.snowtrace.io/api',
    MAINNET: 'https://api.snowtrace.io/api',
  },
  ETHEREUM: {
    SEPOLIA: 'https://api-sepolia.etherscan.io/api',
    MAINNET: 'https://api.etherscan.io/api',
  },
};

// Rate limiting settings
export const API_RATE_LIMITS = {
  SNOWTRACE: {
    FREE_TIER: {
      requestsPerSecond: 5,
      requestsPerDay: 10000,
    },
    PRO_TIER: {
      requestsPerSecond: 20,
      requestsPerDay: 100000,
    },
  },
  ETHERSCAN: {
    FREE_TIER: {
      requestsPerSecond: 5,
      requestsPerDay: 100000,
    },
    PRO_TIER: {
      requestsPerSecond: 30,
      requestsPerDay: 1000000,
    },
  },
};

// Instructions for getting API keys
export const API_SETUP_INSTRUCTIONS = {
  SNOWTRACE: {
    url: 'https://testnet.snowtrace.io/',
    steps: [
      '1. Go to https://testnet.snowtrace.io/',
      '2. Click "Sign In" or create an account',
      '3. Go to your profile and find "API Keys"',
      '4. Create a new API key',
      '5. Copy the key and add it to your .env file:',
      '   VITE_SNOWTRACE_API_KEY=your_api_key_here',
    ],
  },
  ETHERSCAN: {
    url: 'https://etherscan.io/apis',
    steps: [
      '1. Go to https://etherscan.io/apis',
      '2. Click "Sign Up" or sign in',
      '3. Go to "My Account" > "API Keys"',
      '4. Create a new API key',
      '5. Copy the key and add it to your .env file:',
      '   VITE_ETHERSCAN_API_KEY=your_api_key_here',
    ],
  },
}; 