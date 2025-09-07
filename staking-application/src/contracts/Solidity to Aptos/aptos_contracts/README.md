# Bitmax Protocol - Move Implementation

A lightweight, production-ready implementation of the Bitmax DeFi protocol on Aptos blockchain using Move language.

## Overview

Bitmax solves the fundamental liquidity vs. yield dilemma in DeFi staking by splitting staked assets into two tradeable components:
- **Principal Tokens (PT)**: Represent the underlying staked amount
- **Yield Tokens (YT)**: Represent future yield earnings

This Move implementation provides the core functionality with minimal complexity while maintaining security and efficiency.

## Architecture

### Core Modules

#### 1. Yield Tokenization (`yield_tokenization.move`)
**Purpose**: Heart of the protocol - splits SY tokens into PT and YT tokens

**Key Functions**:
- `initialize()`: Set up the protocol with base configuration
- `create_maturity()`: Create new maturity dates for different investment horizons
- `split_tokens()`: Split SY tokens into PT + YT (1:1:1 ratio)
- `redeem_tokens()`: Redeem PT tokens for underlying SY at maturity
- `pause()/unpause()`: Emergency controls

**Usage Flow**:
1. User deposits SY tokens via `split_tokens`
2. Receives equal amounts of PT and YT tokens
3. At maturity, PT tokens redeemable for original SY tokens

#### 2. Standardized Wrapper (`standardized_wrapper.move`)
**Purpose**: Entry point - wraps multiple yield-bearing tokens into standardized format

**Key Functions**:
- `initialize()`: Set up wrapper with yield rate configuration
- `configure_token()`: Configure token ratios and enable/disable tokens
- `wrap_tokens()`: Combine multiple tokens into SY tokens based on ratios
- `unwrap_tokens()`: Convert SY tokens back to underlying tokens
- `set_yield_rate()`: Update yield rate for the wrapper

**Example**: 100 stCORE + 200 lstBTC → 150 SY tokens (based on configured ratios)

### Token Modules

#### 3. PT Token (`pt_token.move`)
**Purpose**: Principal tokens representing redemption rights at maturity

**Key Functions**:
- `initialize()`: Create PT token with maturity timestamp
- `mint()`: Mint new PT tokens (owner-controlled)
- `burn_from()`: Burn PT tokens during redemption
- `is_mature()`: Check if token has reached maturity

#### 4. YT Token (`yt_token.move`)
**Purpose**: Yield tokens capturing future yield until maturity

**Key Functions**:
- `initialize()`: Create YT token with maturity timestamp
- `mint()`: Mint new YT tokens (owner-controlled)
- `burn_from()`: Burn YT tokens during conversion
- `is_accruing_yield()`: Check if yield is still accruing

### Infrastructure Modules

#### 5. Simple AMM (`simple_amm.move`)
**Purpose**: Decentralized exchange for PT/YT token trading

**Key Functions**:
- `initialize()`: Set up AMM for token pair
- `add_liquidity()`: Provide liquidity to the pool
- `swap_a_for_b()` / `swap_b_for_a()`: Execute token swaps
- `get_amount_out()`: Calculate swap output using constant product formula
- `set_fee()`: Update swap fees

**Features**:
- Constant product formula (x * y = k)
- Configurable fees (default 0.3%)
- Slippage protection

#### 6. Price Oracle (`price_oracle.move`)
**Purpose**: Secure price feeds with validation and threshold monitoring

**Key Functions**:
- `initialize()`: Set up oracle with admin controls
- `add_price_updater()`: Authorize price feed providers
- `update_price()`: Update token prices with validation
- `set_threshold()`: Configure price thresholds for automation
- `threshold_reached()`: Check if price threshold triggered
- `activate_circuit_breaker()`: Emergency price feed halt

**Security Features**:
- Price deviation validation (max 10%)
- Staleness checks (1 hour threshold)
- Update frequency limits (5 minute minimum)
- Circuit breaker for emergencies

#### 7. Staking DApp (`staking_dapp.move`)
**Purpose**: Time-based staking rewards providing underlying yield

**Key Functions**:
- `initialize()`: Set up staking with reward token
- `stake()`: Stake tokens to earn rewards
- `unstake()`: Withdraw staked tokens
- `claim_rewards()`: Claim accumulated rewards
- `calculate_reward()`: View pending rewards

**Reward Mechanism**:
- 5 reward tokens every 10 seconds per staked unit
- Automatic reward calculation based on time
- Compound-friendly reward claiming

### Advanced Modules

#### 8. YT Auto Converter (`yt_auto_converter.move`)
**Purpose**: AI-powered automation for optimal YT to PT conversion

**Key Functions**:
- `initialize()`: Set up converter with oracle and AMM integration
- `configure()`: Set user preferences and price thresholds
- `add_maturity()` / `remove_maturity()`: Manage conversion targets
- `execute_conversion()`: Perform automated conversion when threshold reached
- `can_execute_conversion()`: Check if conversion conditions met

**AI Features**:
- Price threshold monitoring via oracle integration
- Automated execution when conditions met
- Slippage protection and deadline enforcement
- Fee mechanism for protocol sustainability

## Deployment Guide

### Prerequisites
- Aptos CLI installed
- Move compiler available
- Test account with sufficient APT for gas

### Steps

1. **Clone and Navigate**:
```bash
cd aptos_contracts
```

2. **Compile Contracts**:
```bash
aptos move compile
```

3. **Deploy to Testnet**:
```bash
aptos move publish --named-addresses bitmax=<your_address>
```

4. **Initialize Protocol**:
```bash
# Initialize yield tokenization
aptos move run --function-id <address>::yield_tokenization::initialize \
  --args string:"Bitmax Protocol" string:"BITMAX"

# Initialize standardized wrapper
aptos move run --function-id <address>::standardized_wrapper::initialize \
  --args string:"Standardized Yield" string:"SY" u64:500

# Configure tokens for wrapping
aptos move run --function-id <address>::standardized_wrapper::configure_token \
  --args u64:0 u64:5000 bool:true  # 50% ratio for first token
```

## Usage Examples

### Basic User Flow

1. **Wrap Tokens**:
```bash
aptos move run --function-id <address>::standardized_wrapper::wrap_tokens \
  --type-args <Token0> <Token1> --args u64:100 u64:200
```

2. **Split into PT/YT**:
```bash
aptos move run --function-id <address>::yield_tokenization::split_tokens \
  --type-args <SYToken> --args u64:150 u64:<maturity_timestamp>
```

3. **Trade on AMM**:
```bash
aptos move run --function-id <address>::simple_amm::swap_a_for_b \
  --type-args <YTToken> <PTToken> --args u64:50
```

4. **Redeem at Maturity**:
```bash
aptos move run --function-id <address>::yield_tokenization::redeem_tokens \
  --type-args <SYToken> --args u64:100 u64:<maturity_timestamp>
```

### Advanced Automation

1. **Configure Auto Converter**:
```bash
aptos move run --function-id <address>::yt_auto_converter::configure \
  --args bool:true u64:120000000  # Enable with $1.20 threshold
```

2. **Add Maturity for Conversion**:
```bash
aptos move run --function-id <address>::yt_auto_converter::add_maturity \
  --args u64:<maturity_timestamp>
```

## Security Considerations

### Access Controls
- All modules implement owner-based access control
- Critical functions restricted to authorized addresses
- Emergency pause functionality for all operations

### Validation
- Input validation on all public functions
- Overflow protection using Move's built-in safety
- Proper error handling with descriptive error codes

### Circuit Breakers
- Price oracle circuit breaker for emergency halts
- Pausable functionality across all modules
- Admin controls for emergency situations

## Gas Optimization

### Lightweight Design
- Minimal storage structures
- Efficient vector operations
- Reduced computational complexity

### Batch Operations
- Support for multiple token operations
- Efficient reward calculations
- Optimized AMM swap logic

## Testing

### Unit Tests
```bash
aptos move test
```

### Integration Tests
```bash
aptos move test --filter integration
```

## Monitoring and Analytics

### Events
All modules emit comprehensive events for:
- Token operations (mint, burn, transfer)
- AMM swaps and liquidity changes
- Price updates and threshold triggers
- Staking and reward activities

### View Functions
Query protocol state using view functions:
- `get_maturities()`: Available maturity dates
- `get_reserves()`: AMM liquidity status
- `calculate_reward()`: Pending staking rewards
- `threshold_reached()`: Price threshold status

## Upgrade Path

The modular design allows for:
- Individual module upgrades
- Feature additions without breaking changes
- Backward compatibility maintenance
- Gradual migration strategies

## Support

For technical support and questions:
- Review the inline documentation in each module
- Check the comprehensive error codes and messages
- Refer to the Move language documentation for advanced features

## License

MIT License - see LICENSE file for details.