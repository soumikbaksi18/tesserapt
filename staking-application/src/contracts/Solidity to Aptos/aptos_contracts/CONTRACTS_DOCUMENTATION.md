# Bitmax Protocol - Detailed Contract Documentation

## Table of Contents
1. [Core Protocol Contracts](#core-protocol-contracts)
2. [Token Contracts](#token-contracts)
3. [Infrastructure Contracts](#infrastructure-contracts)
4. [Advanced Contracts](#advanced-contracts)
5. [Error Codes Reference](#error-codes-reference)
6. [Event Reference](#event-reference)

---

## Core Protocol Contracts

### 1. Yield Tokenization (`yield_tokenization.move`)

**Purpose**: The heart of the Bitmax protocol that splits standardized yield (SY) tokens into Principal Tokens (PT) and Yield Tokens (YT).

#### State Structures

```move
struct MaturityConfig has key, store {
    maturity_timestamp: u64,    // When tokens mature
    pt_coin_type: String,       // PT token type identifier
    yt_coin_type: String,       // YT token type identifier
    is_active: bool,            // Whether this maturity is active
}

struct ProtocolState has key {
    admin: address,             // Protocol administrator
    maturities: vector<u64>,    // List of available maturities
    is_paused: bool,           // Emergency pause state
    base_name: String,         // Base name for token creation
    base_symbol: String,       // Base symbol for token creation
}
```

#### Key Functions

**`initialize(admin: &signer, base_name: String, base_symbol: String)`**
- Initializes the protocol with basic configuration
- Creates initial 30-day maturity
- Sets up admin permissions
- **Access**: Admin only
- **Gas**: ~1,000 units

**`create_maturity(admin: &signer, maturity_timestamp: u64)`**
- Creates new maturity date with corresponding PT/YT tokens
- Validates maturity is in the future
- Prevents duplicate maturities
- **Access**: Admin only
- **Gas**: ~2,000 units

**`split_tokens<SYCoin>(user: &signer, amount: u64, maturity: u64)`**
- Splits SY tokens into PT and YT tokens (1:1:1 ratio)
- Transfers SY tokens from user to protocol
- Mints equal amounts of PT and YT tokens
- **Access**: Public (when not paused)
- **Gas**: ~1,500 units

**`redeem_tokens<SYCoin>(user: &signer, amount: u64, maturity: u64)`**
- Redeems PT tokens for underlying SY tokens at maturity
- Burns PT tokens and transfers SY tokens back
- Only available after maturity timestamp
- **Access**: Public (when not paused)
- **Gas**: ~1,200 units

#### Usage Patterns

```move
// Initialize protocol
yield_tokenization::initialize(admin, string::utf8(b"Bitmax"), string::utf8(b"BITMAX"));

// Create 90-day maturity
let maturity = timestamp::now_seconds() + (90 * 24 * 60 * 60);
yield_tokenization::create_maturity(admin, maturity);

// Split 1000 SY tokens
yield_tokenization::split_tokens<SYToken>(user, 1000, maturity);

// Redeem 500 PT tokens at maturity
yield_tokenization::redeem_tokens<SYToken>(user, 500, maturity);
```

---

### 2. Standardized Wrapper (`standardized_wrapper.move`)

**Purpose**: Entry point that wraps multiple underlying yield-bearing tokens into a single standardized format (SY tokens).

#### State Structures

```move
struct TokenConfig has store {
    ratio: u64,        // Conversion ratio in basis points (5000 = 50%)
    is_enabled: bool,  // Whether this token is active for wrapping
}

struct WrapperState has key {
    admin: address,                           // Contract administrator
    token_configs: vector<TokenConfig>,       // Configuration for each token
    yield_rate_bps: u64,                     // Yield rate in basis points
    is_paused: bool,                         // Emergency pause state
    mint_cap: MintCapability<SYToken>,       // Capability to mint SY tokens
    burn_cap: BurnCapability<SYToken>,       // Capability to burn SY tokens
}
```

#### Key Functions

**`initialize(admin: &signer, name: String, symbol: String, yield_rate_bps: u64)`**
- Sets up the SY token with specified parameters
- Initializes token capabilities for minting/burning
- Validates yield rate is within acceptable bounds (≤100%)
- **Access**: Admin only
- **Gas**: ~1,500 units

**`configure_token(admin: &signer, index: u64, ratio: u64, is_enabled: bool)`**
- Configures wrapping parameters for underlying tokens
- Sets conversion ratios and enable/disable status
- Extends configuration vector as needed
- **Access**: Admin only
- **Gas**: ~800 units

**`wrap_tokens<Token0, Token1>(user: &signer, amount0: u64, amount1: u64)`**
- Wraps multiple tokens according to configured ratios
- Calculates total SY tokens based on individual contributions
- Mints SY tokens to user proportional to wrapped value
- **Access**: Public (when not paused)
- **Gas**: ~2,000 units

**`unwrap_tokens<Token0, Token1>(user: &signer, amount: u64)`**
- Unwraps SY tokens back to underlying tokens
- Burns SY tokens and transfers underlying tokens proportionally
- Respects original wrapping ratios for fair distribution
- **Access**: Public (when not paused)
- **Gas**: ~1,800 units

#### Configuration Examples

```move
// Configure first token with 60% ratio
standardized_wrapper::configure_token(admin, 0, 6000, true);

// Configure second token with 40% ratio
standardized_wrapper::configure_token(admin, 1, 4000, true);

// Wrap 100 Token0 + 150 Token1 = ~100 SY tokens
standardized_wrapper::wrap_tokens<Token0, Token1>(user, 100, 150);
```

---

## Token Contracts

### 3. PT Token (`pt_token.move`)

**Purpose**: Principal Tokens represent the right to redeem the original SY amount at maturity.

#### State Structure

```move
struct PTTokenState has key {
    owner: address,                          // Token contract owner
    maturity: u64,                          // Maturity timestamp
    mint_cap: MintCapability<PTToken>,      // Minting capability
    burn_cap: BurnCapability<PTToken>,      // Burning capability
}
```

#### Key Functions

**`initialize(owner: &signer, name: String, symbol: String, maturity: u64)`**
- Creates PT token with specified maturity
- Validates maturity is in the future
- Sets up minting and burning capabilities
- **Access**: Owner only
- **Gas**: ~1,200 units

**`mint(owner: &signer, to: address, amount: u64)`**
- Mints PT tokens to specified address
- Used during token splitting process
- Validates recipient and amount
- **Access**: Owner only (typically tokenization contract)
- **Gas**: ~600 units

**`burn_from(owner: &signer, from: address, amount: u64)`**
- Burns PT tokens from specified address
- Used during redemption process
- Requires sufficient balance
- **Access**: Owner only
- **Gas**: ~500 units

### 4. YT Token (`yt_token.move`)

**Purpose**: Yield Tokens capture all future yield until maturity.

#### State Structure

```move
struct YTTokenState has key {
    owner: address,                          // Token contract owner
    maturity: u64,                          // Maturity timestamp
    mint_cap: MintCapability<YTToken>,      // Minting capability
    burn_cap: BurnCapability<YTToken>,      // Burning capability
}
```

#### Key Functions

Similar to PT Token but with additional yield-specific functionality:

**`is_accruing_yield(): bool`**
- Checks if token is still accruing yield (before maturity)
- Used by yield distribution mechanisms
- **Access**: Public view
- **Gas**: ~100 units

---

## Infrastructure Contracts

### 5. Simple AMM (`simple_amm.move`)

**Purpose**: Automated Market Maker for PT/YT token trading using constant product formula.

#### State Structure

```move
struct AMMState<phantom TokenA, phantom TokenB> has key {
    admin: address,     // AMM administrator
    reserve_a: u64,     // Reserve of token A
    reserve_b: u64,     // Reserve of token B
    fee: u64,          // Fee rate (3 = 0.3%)
    is_paused: bool,   // Emergency pause state
}
```

#### Key Functions

**`initialize<TokenA, TokenB>(admin: &signer)`**
- Sets up AMM for specific token pair
- Initializes with zero reserves and default 0.3% fee
- **Access**: Admin only
- **Gas**: ~800 units

**`add_liquidity<TokenA, TokenB>(user: &signer, amount_a: u64, amount_b: u64)`**
- Adds liquidity to the pool
- Updates reserves proportionally
- No LP tokens in this simplified implementation
- **Access**: Public (when not paused)
- **Gas**: ~1,000 units

**`swap_a_for_b<TokenA, TokenB>(user: &signer, amount_in: u64)`**
- Swaps Token A for Token B using constant product formula
- Applies fee and slippage protection
- Updates reserves after swap
- **Access**: Public (when not paused)
- **Gas**: ~1,200 units

**`get_amount_out(amount_in: u64, reserve_in: u64, reserve_out: u64, fee: u64): u64`**
- Calculates output amount for given input
- Uses formula: `(amount_in * (1000 - fee) * reserve_out) / (reserve_in * 1000 + amount_in * (1000 - fee))`
- **Access**: Public view
- **Gas**: ~200 units

#### AMM Formula

The constant product formula ensures:
```
reserve_a * reserve_b = k (constant)
```

With fees applied:
```
amount_out = (amount_in_with_fee * reserve_out) / (reserve_in + amount_in_with_fee)
where amount_in_with_fee = amount_in * (1000 - fee) / 1000
```

### 6. Price Oracle (`price_oracle.move`)

**Purpose**: Secure price feeds with validation, staleness checks, and threshold monitoring.

#### State Structures

```move
struct PriceData has store {
    price: u64,           // Price scaled by 10^8
    timestamp: u64,       // Last update timestamp
    confidence: u64,      // Confidence level (0-10000 basis points)
    updater: address,     // Address that updated the price
}

struct ThresholdData has store {
    threshold: u64,       // Threshold price for automation
    is_active: bool,      // Whether monitoring is active
    setter: address,      // Who set the threshold
    set_timestamp: u64,   // When threshold was set
}

struct OracleState has key {
    admin: address,                    // Oracle administrator
    price_updaters: vector<address>,   // Authorized price updaters
    circuit_breaker_active: bool,      // Emergency circuit breaker
    is_paused: bool,                  // Pause state
}
```

#### Key Functions

**`update_price(updater: &signer, token: address, new_price: u64, confidence: u64)`**
- Updates token price with comprehensive validation
- Checks price deviation (max 10%), update frequency (min 5 min)
- Validates updater authorization and confidence level
- **Access**: Authorized updaters only
- **Gas**: ~1,500 units

**`set_threshold(setter: &signer, token: address, threshold: u64)`**
- Sets price threshold for automated triggers
- Used by auto-converter for execution conditions
- **Access**: Authorized updaters or admin
- **Gas**: ~800 units

**`get_price(token: address): u64`**
- Returns current price with staleness validation
- Ensures price is not older than 1 hour
- **Access**: Public view
- **Gas**: ~300 units

**`threshold_reached(token: address): bool`**
- Checks if price has reached configured threshold
- Used by automation systems for trigger conditions
- **Access**: Public view
- **Gas**: ~400 units

#### Security Features

1. **Price Deviation Protection**: Maximum 10% change per update
2. **Update Frequency Limits**: Minimum 5 minutes between updates
3. **Staleness Checks**: Prices expire after 1 hour
4. **Circuit Breaker**: Emergency halt for all price updates
5. **Authorization**: Only approved updaters can modify prices

### 7. Staking DApp (`staking_dapp.move`)

**Purpose**: Time-based staking rewards providing the underlying yield for tokenization.

#### State Structures

```move
struct Stake has store {
    amount: u64,           // Amount of tokens staked
    last_reward_time: u64, // Last reward calculation timestamp
}

struct StakingState has key {
    admin: address,                           // Contract administrator
    stakes: vector<Stake>,                    // User stake information
    user_addresses: vector<address>,          // Corresponding user addresses
    reward_balances: vector<u64>,            // Pending reward balances
    is_paused: bool,                         // Emergency pause state
    reward_mint_cap: MintCapability<RewardToken>, // Reward token minting
}
```

#### Key Functions

**`stake<StakingToken>(user: &signer, amount: u64)`**
- Stakes tokens to earn time-based rewards
- Updates existing stake or creates new one
- Calculates and saves pending rewards before staking
- **Access**: Public (when not paused)
- **Gas**: ~1,200 units

**`unstake<StakingToken>(user: &signer, amount: u64)`**
- Withdraws staked tokens
- Calculates pending rewards before unstaking
- Transfers tokens back to user
- **Access**: Public (when not paused)
- **Gas**: ~1,000 units

**`claim_rewards(user: &signer)`**
- Claims all accumulated rewards
- Mints reward tokens to user
- Resets reward calculation timestamp
- **Access**: Public (when not paused)
- **Gas**: ~800 units

**`calculate_reward(user: address): u64`**
- Calculates pending rewards based on time and stake amount
- Formula: `intervals * REWARD_AMOUNT * stake_amount / 10^9`
- Where intervals = `time_passed / REWARD_INTERVAL`
- **Access**: Public view
- **Gas**: ~200 units

#### Reward Mechanism

- **Rate**: 5 reward tokens per 10-second interval
- **Calculation**: Proportional to staked amount and time
- **Precision**: Scaled by 10^9 for accurate small amounts
- **Compound**: Rewards can be claimed and restaked

---

## Advanced Contracts

### 8. YT Auto Converter (`yt_auto_converter.move`)

**Purpose**: AI-powered automation engine for optimal YT to PT conversion based on market conditions.

#### State Structures

```move
struct UserConfig has store {
    enabled: bool,                    // Whether auto-conversion is enabled
    threshold_price: u64,            // Price threshold for conversion trigger
    maturities: vector<u64>,         // Maturities to monitor for conversion
}

struct ConverterState has key {
    admin: address,              // Contract administrator
    oracle_address: address,     // Price oracle for threshold monitoring
    tokenization_address: address, // Tokenization contract address
    reference_token: address,    // Token for price monitoring
    amm_address: address,       // AMM for executing conversions
    conversion_fee: u64,        // Fee in basis points (30 = 0.3%)
    is_paused: bool,           // Emergency pause state
}
```

#### Key Functions

**`configure(user: &signer, enabled: bool, threshold_price: u64)`**
- Configures user's auto-conversion preferences
- Sets price threshold for conversion triggers
- Creates or updates existing configuration
- **Access**: Public
- **Gas**: ~600 units

**`add_maturity(user: &signer, maturity: u64)`**
- Adds maturity to user's conversion list
- Validates maturity exists in tokenization contract
- Prevents duplicate entries
- **Access**: Public
- **Gas**: ~400 units

**`execute_conversion<YTToken, PTToken>(executor: &signer, user: address, maturity: u64, min_pt_amount: u64, deadline: u64)`**
- Executes YT to PT conversion when conditions are met
- Validates threshold reached and user configuration
- Performs market-based conversion through AMM
- Applies conversion fee and slippage protection
- **Access**: Public (when conditions met)
- **Gas**: ~2,500 units

**`can_execute_conversion(user: address, maturity: u64): bool`**
- Checks if conversion can be executed for user/maturity
- Validates user configuration, execution status, and price threshold
- Used by automation systems to determine execution eligibility
- **Access**: Public view
- **Gas**: ~500 units

#### AI Integration Points

1. **Price Monitoring**: Integrates with price oracle for threshold detection
2. **Market Execution**: Uses AMM for real market-based conversions
3. **Risk Management**: Configurable thresholds and slippage protection
4. **Automation**: Event-driven execution when conditions are met

#### Conversion Process

1. **Threshold Check**: Price oracle confirms threshold reached
2. **Balance Validation**: Confirms user has YT tokens to convert
3. **Fee Calculation**: Deducts conversion fee from amount
4. **Market Conversion**: Executes swap through AMM with slippage protection
5. **Token Transfer**: Delivers PT tokens to user
6. **Status Update**: Marks conversion as executed to prevent duplicates

---

## Error Codes Reference

### Common Error Codes (Used Across Modules)

| Code | Name | Description |
|------|------|-------------|
| 1 | `E_NOT_AUTHORIZED` | Caller lacks required permissions |
| 2 | `E_INVALID_AMOUNT` | Amount is zero or invalid |
| 3 | `E_INSUFFICIENT_BALANCE` | Insufficient token balance |
| 4 | `E_PAUSED` | Contract is paused |
| 5 | `E_INVALID_ADDRESS` | Address is zero or invalid |

### Module-Specific Error Codes

#### Yield Tokenization
| Code | Name | Description |
|------|------|-------------|
| 3 | `E_MATURITY_NOT_FOUND` | Specified maturity doesn't exist |
| 4 | `E_NOT_MATURE` | Tokens haven't reached maturity |
| 6 | `E_MATURITY_EXISTS` | Maturity already created |
| 7 | `E_INVALID_MATURITY` | Maturity timestamp is invalid |

#### Price Oracle
| Code | Name | Description |
|------|------|-------------|
| 4 | `E_UPDATE_TOO_FREQUENT` | Price update too soon after last |
| 5 | `E_PRICE_DEVIATION_TOO_LARGE` | Price change exceeds 10% limit |
| 6 | `E_CIRCUIT_BREAKER_ACTIVE` | Emergency circuit breaker engaged |
| 7 | `E_NO_PRICE_AVAILABLE` | No price data for token |
| 8 | `E_PRICE_STALE` | Price data is too old |

#### YT Auto Converter
| Code | Name | Description |
|------|------|-------------|
| 2 | `E_CONVERSION_NOT_ENABLED` | User hasn't enabled auto-conversion |
| 3 | `E_CONVERSION_ALREADY_EXECUTED` | Conversion already completed |
| 4 | `E_THRESHOLD_NOT_REACHED` | Price threshold not met |
| 7 | `E_TRANSACTION_EXPIRED` | Transaction past deadline |
| 10 | `E_INSUFFICIENT_OUTPUT` | Swap output below minimum |

---

## Event Reference

### Core Events

#### TokensSplit
```move
struct TokensSplit has drop, store {
    user: address,     // User who split tokens
    amount: u64,       // Amount of SY tokens split
    maturity: u64,     // Maturity timestamp
}
```

#### TokensRedeemed
```move
struct TokensRedeemed has drop, store {
    user: address,     // User who redeemed tokens
    amount: u64,       // Amount of PT tokens redeemed
    maturity: u64,     // Maturity timestamp
}
```

#### ConversionExecuted
```move
struct ConversionExecuted has drop, store {
    user: address,     // User whose tokens were converted
    maturity: u64,     // Maturity of converted tokens
    yt_amount: u64,    // Amount of YT tokens converted
    pt_amount: u64,    // Amount of PT tokens received
}
```

### AMM Events

#### Swap
```move
struct Swap has drop, store {
    user: address,      // User who performed swap
    amount_in: u64,     // Input token amount
    amount_out: u64,    // Output token amount
    is_a_to_b: bool,   // Direction of swap
}
```

#### LiquidityAdded
```move
struct LiquidityAdded has drop, store {
    user: address,      // Liquidity provider
    amount_a: u64,      // Amount of token A added
    amount_b: u64,      // Amount of token B added
}
```

### Oracle Events

#### PriceUpdated
```move
struct PriceUpdated has drop, store {
    token: address,     // Token whose price was updated
    old_price: u64,     // Previous price
    new_price: u64,     // New price
    confidence: u64,    // Confidence level
    updater: address,   // Who updated the price
}
```

#### ThresholdReached
```move
struct ThresholdReached has drop, store {
    token: address,        // Token that reached threshold
    current_price: u64,    // Current price
    threshold: u64,        // Threshold that was reached
}
```

### Staking Events

#### Staked
```move
struct Staked has drop, store {
    user: address,     // User who staked
    amount: u64,       // Amount staked
}
```

#### RewardClaimed
```move
struct RewardClaimed has drop, store {
    user: address,     // User who claimed rewards
    amount: u64,       // Amount of rewards claimed
}
```

---

## Integration Patterns

### Cross-Module Integration

1. **Tokenization ↔ Wrapper**: SY tokens flow from wrapper to tokenization
2. **Tokenization ↔ PT/YT**: Token creation and management
3. **AMM ↔ PT/YT**: Trading and liquidity provision
4. **Oracle ↔ Auto Converter**: Price monitoring and threshold detection
5. **Auto Converter ↔ AMM**: Automated conversion execution
6. **Staking ↔ Wrapper**: Yield generation for tokenization

### Event-Driven Architecture

The protocol uses events for:
- **Monitoring**: Track all protocol activities
- **Analytics**: Calculate TVL, volume, and yields
- **Automation**: Trigger off-chain processes
- **Integration**: Connect with external systems

### Security Model

1. **Access Control**: Role-based permissions with admin oversight
2. **Pausability**: Emergency stops for all critical functions
3. **Validation**: Comprehensive input validation and bounds checking
4. **Circuit Breakers**: Automatic halts for abnormal conditions
5. **Upgrade Safety**: Modular design for safe upgrades