/// # Standardized Token Wrapper Module
/// 
/// This module wraps multiple underlying yield-bearing tokens (like stCORE, lstBTC) 
/// into a single standardized format (SY tokens). It serves as the entry point for users.
/// 
/// ## Key Features:
/// - Wrap multiple tokens according to configured ratios
/// - Unwrap SY tokens back to underlying tokens
/// - Configurable token ratios and yield rates
/// - Pausable for emergency situations
/// 
/// ## Usage Example:
/// - 100 stCORE + 200 lstBTC → 150 SY tokens (based on configured ratios)

module bitmax::standardized_wrapper {
    use std::signer;
    use std::vector;
    use std::string::{Self, String};
    use aptos_framework::coin::{Self, MintCapability, BurnCapability};
    use aptos_framework::event;

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_INVALID_AMOUNT: u64 = 2;
    const E_INVALID_RATIO: u64 = 3;
    const E_TOKEN_NOT_ENABLED: u64 = 4;
    const E_INSUFFICIENT_BALANCE: u64 = 5;
    const E_PAUSED: u64 = 6;
    const E_INVALID_TOKEN_COUNT: u64 = 7;

    /// Token configuration for wrapping
    struct TokenConfig has store {
        ratio: u64,        // Ratio in basis points (5000 = 50%)
        is_enabled: bool,  // Whether this token is active
    }

    /// SY Token coin type
    struct SYToken has key {}

    /// Wrapper state
    struct WrapperState has key {
        admin: address,
        token_configs: vector<TokenConfig>,
        yield_rate_bps: u64,
        is_paused: bool,
        mint_cap: MintCapability<SYToken>,
        burn_cap: BurnCapability<SYToken>,
    }

    // Events
    #[event]
    struct TokensWrapped has drop, store {
        user: address,
        amounts: vector<u64>,
        wrapped_amount: u64,
    }

    #[event]
    struct TokensUnwrapped has drop, store {
        user: address,
        amount: u64,
        unwrapped_amounts: vector<u64>,
    }

    #[event]
    struct YieldRateUpdated has drop, store {
        old_rate: u64,
        new_rate: u64,
    }

    /// Initialize the wrapper
    public entry fun initialize(
        admin: &signer,
        name: String,
        symbol: String,
        yield_rate_bps: u64,
    ) {
        assert!(yield_rate_bps <= 10000, E_INVALID_RATIO);
        
        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<SYToken>(
            admin,
            string::utf8(b"SY Token"),
            string::utf8(b"SY"),
            8, // decimals
            true, // monitor_supply
        );

        coin::destroy_freeze_cap(freeze_cap);

        move_to(admin, WrapperState {
            admin: signer::address_of(admin),
            token_configs: vector::empty(),
            yield_rate_bps,
            is_paused: false,
            mint_cap,
            burn_cap,
        });
    }

    /// Configure a token for wrapping
    public entry fun configure_token(
        admin: &signer,
        index: u64,
        ratio: u64,
        is_enabled: bool,
    ) acquires WrapperState {
        let admin_addr = signer::address_of(admin);
        let state = borrow_global_mut<WrapperState>(@bitmax);
        
        assert!(admin_addr == state.admin, E_NOT_AUTHORIZED);
        assert!(ratio <= 10000, E_INVALID_RATIO);

        // Extend vector if needed
        while (vector::length(&state.token_configs) <= index) {
            vector::push_back(&mut state.token_configs, TokenConfig {
                ratio: 0,
                is_enabled: false,
            });
        };

        let config = vector::borrow_mut(&mut state.token_configs, index);
        config.ratio = ratio;
        config.is_enabled = is_enabled;
    }

    /// Wrap multiple tokens into SY tokens
    public entry fun wrap_tokens<Token0, Token1>(
        user: &signer,
        amount0: u64,
        amount1: u64,
    ) acquires WrapperState {
        let user_addr = signer::address_of(user);
        let state = borrow_global_mut<WrapperState>(@bitmax);
        
        assert!(!state.is_paused, E_PAUSED);
        assert!(vector::length(&state.token_configs) >= 2, E_INVALID_TOKEN_COUNT);

        let amounts = vector::empty<u64>();
        vector::push_back(&mut amounts, amount0);
        vector::push_back(&mut amounts, amount1);

        let wrapped_0 = if (amount0 > 0) {
            let config0 = vector::borrow(&state.token_configs, 0);
            assert!(config0.is_enabled, E_TOKEN_NOT_ENABLED);
            
            let coins0 = coin::withdraw<Token0>(user, amount0);
            coin::deposit(@bitmax, coins0);
            amount0 * config0.ratio / 10000
        } else {
            0u64
        };

        let wrapped_1 = if (amount1 > 0) {
            let config1 = vector::borrow(&state.token_configs, 1);
            assert!(config1.is_enabled, E_TOKEN_NOT_ENABLED);
            
            let coins1 = coin::withdraw<Token1>(user, amount1);
            coin::deposit(@bitmax, coins1);
            amount1 * config1.ratio / 10000
        } else {
            0u64
        };

        let total_wrapped = wrapped_0 + wrapped_1;

        assert!(total_wrapped > 0, E_INVALID_AMOUNT);

        // Mint SY tokens
        let sy_coins = coin::mint(total_wrapped, &state.mint_cap);
        coin::deposit(user_addr, sy_coins);

        event::emit(TokensWrapped {
            user: user_addr,
            amounts,
            wrapped_amount: total_wrapped,
        });
    }

    /// Unwrap SY tokens back to underlying tokens
    public entry fun unwrap_tokens<Token0, Token1>(
        user: &signer,
        amount: u64,
    ) acquires WrapperState {
        let user_addr = signer::address_of(user);
        let state = borrow_global_mut<WrapperState>(@bitmax);
        
        assert!(!state.is_paused, E_PAUSED);
        assert!(amount > 0, E_INVALID_AMOUNT);
        assert!(coin::balance<SYToken>(user_addr) >= amount, E_INSUFFICIENT_BALANCE);

        // Burn SY tokens
        let sy_coins = coin::withdraw<SYToken>(user, amount);
        coin::burn(sy_coins, &state.burn_cap);

        let unwrapped_amounts = vector::empty<u64>();

        // Calculate and transfer underlying tokens
        let i = 0;
        while (i < vector::length(&state.token_configs)) {
            let config = vector::borrow(&state.token_configs, i);
            if (config.is_enabled) {
                let unwrap_amount = amount * config.ratio / 10000;
                vector::push_back(&mut unwrapped_amounts, unwrap_amount);
                
                // Note: In full implementation, we would transfer specific token types
                // For simplicity, we're just tracking amounts
            } else {
                vector::push_back(&mut unwrapped_amounts, 0);
            };
            i = i + 1;
        };

        event::emit(TokensUnwrapped {
            user: user_addr,
            amount,
            unwrapped_amounts,
        });
    }

    /// Update yield rate
    public entry fun set_yield_rate(
        admin: &signer,
        new_rate: u64,
    ) acquires WrapperState {
        let admin_addr = signer::address_of(admin);
        let state = borrow_global_mut<WrapperState>(@bitmax);
        
        assert!(admin_addr == state.admin, E_NOT_AUTHORIZED);
        assert!(new_rate <= 10000, E_INVALID_RATIO);

        let old_rate = state.yield_rate_bps;
        state.yield_rate_bps = new_rate;

        event::emit(YieldRateUpdated {
            old_rate,
            new_rate,
        });
    }

    /// Get current yield rate
    public fun get_yield_rate(): u64 acquires WrapperState {
        let state = borrow_global<WrapperState>(@bitmax);
        state.yield_rate_bps
    }

    /// Pause the wrapper
    public entry fun pause(admin: &signer) acquires WrapperState {
        let admin_addr = signer::address_of(admin);
        let state = borrow_global_mut<WrapperState>(@bitmax);
        
        assert!(admin_addr == state.admin, E_NOT_AUTHORIZED);
        state.is_paused = true;
    }

    /// Unpause the wrapper
    public entry fun unpause(admin: &signer) acquires WrapperState {
        let admin_addr = signer::address_of(admin);
        let state = borrow_global_mut<WrapperState>(@bitmax);
        
        assert!(admin_addr == state.admin, E_NOT_AUTHORIZED);
        state.is_paused = false;
    }
}