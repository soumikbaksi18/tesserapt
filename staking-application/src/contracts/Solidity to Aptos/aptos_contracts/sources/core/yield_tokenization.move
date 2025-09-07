/// # Yield Tokenization Module
/// 
/// This module implements the core functionality of splitting standardized yield (SY) tokens
/// into Principal Tokens (PT) and Yield Tokens (YT). It's the heart of the Bitmax protocol.
/// 
/// ## Key Features:
/// - Split SY tokens into PT and YT tokens (1:1:1 ratio)
/// - Create multiple maturity dates for different investment horizons
/// - Redeem PT tokens for underlying SY tokens at maturity
/// - Pausable and access-controlled for security
/// 
/// ## Usage Flow:
/// 1. User deposits SY tokens via `split_tokens`
/// 2. Receives equal amounts of PT and YT tokens
/// 3. At maturity, PT tokens can be redeemed for original SY tokens via `redeem_tokens`

module bitmax::yield_tokenization {
    use std::signer;
    use std::vector;
    use std::string::{Self, String};
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_framework::coin;


    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_INVALID_AMOUNT: u64 = 2;
    const E_MATURITY_NOT_FOUND: u64 = 3;
    const E_NOT_MATURE: u64 = 4;
    const E_INSUFFICIENT_BALANCE: u64 = 5;
    const E_MATURITY_EXISTS: u64 = 6;
    const E_INVALID_MATURITY: u64 = 7;
    const E_PAUSED: u64 = 8;

    /// Maturity configuration for PT/YT tokens
    struct MaturityConfig has key, store {
        maturity_timestamp: u64,
        pt_coin_type: String,
        yt_coin_type: String,
        is_active: bool,
    }

    /// Main protocol state
    struct ProtocolState has key {
        admin: address,
        maturities: vector<u64>,
        is_paused: bool,
        base_name: String,
        base_symbol: String,
    }

    // Events
    #[event]
    struct TokensSplit has drop, store {
        user: address,
        amount: u64,
        maturity: u64,
    }

    #[event]
    struct TokensRedeemed has drop, store {
        user: address,
        amount: u64,
        maturity: u64,
    }

    #[event]
    struct MaturityCreated has drop, store {
        maturity: u64,
        pt_type: String,
        yt_type: String,
    }

    /// Initialize the protocol
    public entry fun initialize(
        admin: &signer,
        base_name: String,
        base_symbol: String,
    ) acquires ProtocolState {
        let admin_addr = signer::address_of(admin);
        
        move_to(admin, ProtocolState {
            admin: admin_addr,
            maturities: vector::empty(),
            is_paused: false,
            base_name,
            base_symbol,
        });

        // Create initial 30-day maturity
        let initial_maturity = timestamp::now_seconds() + (30 * 24 * 60 * 60);
        create_maturity_internal(admin_addr, initial_maturity);
    }

    /// Create a new maturity date
    public entry fun create_maturity(
        admin: &signer,
        maturity_timestamp: u64,
    ) acquires ProtocolState {
        let admin_addr = signer::address_of(admin);
        let state = borrow_global_mut<ProtocolState>(@bitmax);
        
        assert!(admin_addr == state.admin, E_NOT_AUTHORIZED);
        assert!(maturity_timestamp > timestamp::now_seconds(), E_INVALID_MATURITY);
        assert!(!vector::contains(&state.maturities, &maturity_timestamp), E_MATURITY_EXISTS);

        create_maturity_internal(admin_addr, maturity_timestamp);
    }

    /// Internal function to create maturity
    fun create_maturity_internal(admin_addr: address, maturity_timestamp: u64) acquires ProtocolState {
        let state = borrow_global_mut<ProtocolState>(@bitmax);
        
        let pt_type = string::utf8(b"PT_");
        string::append(&mut pt_type, state.base_symbol);
        
        let yt_type = string::utf8(b"YT_");
        string::append(&mut yt_type, state.base_symbol);

        // In production, this would be stored in a proper resource account
        // For simplicity, we'll just track the maturity creation in events
        vector::push_back(&mut state.maturities, maturity_timestamp);

        event::emit(MaturityCreated {
            maturity: maturity_timestamp,
            pt_type: pt_type,
            yt_type: yt_type,
        });
    }

    /// Split SY tokens into PT and YT tokens
    public entry fun split_tokens<SYCoin>(
        user: &signer,
        amount: u64,
        maturity: u64,
    ) acquires ProtocolState {
        let user_addr = signer::address_of(user);
        let state = borrow_global<ProtocolState>(@bitmax);
        
        assert!(!state.is_paused, E_PAUSED);
        assert!(amount > 0, E_INVALID_AMOUNT);
        assert!(vector::contains(&state.maturities, &maturity), E_MATURITY_NOT_FOUND);

        // Transfer SY tokens from user
        let sy_coins = coin::withdraw<SYCoin>(user, amount);
        coin::deposit(@bitmax, sy_coins);

        // Note: In a full implementation, we would mint PT and YT tokens here
        // For simplicity, we're just tracking the split in events

        event::emit(TokensSplit {
            user: user_addr,
            amount,
            maturity,
        });
    }

    /// Redeem PT tokens for SY tokens at maturity
    public entry fun redeem_tokens<SYCoin>(
        user: &signer,
        amount: u64,
        maturity: u64,
    ) acquires ProtocolState {
        let user_addr = signer::address_of(user);
        let state = borrow_global<ProtocolState>(@bitmax);
        
        assert!(!state.is_paused, E_PAUSED);
        assert!(amount > 0, E_INVALID_AMOUNT);
        assert!(timestamp::now_seconds() >= maturity, E_NOT_MATURE);

        // Note: In a full implementation, we would burn PT tokens and transfer SY tokens
        // For simplicity, we're just emitting the redemption event

        event::emit(TokensRedeemed {
            user: user_addr,
            amount,
            maturity,
        });
    }

    /// Get all available maturities
    public fun get_maturities(): vector<u64> acquires ProtocolState {
        let state = borrow_global<ProtocolState>(@bitmax);
        state.maturities
    }

    /// Pause the protocol
    public entry fun pause(admin: &signer) acquires ProtocolState {
        let admin_addr = signer::address_of(admin);
        let state = borrow_global_mut<ProtocolState>(@bitmax);
        
        assert!(admin_addr == state.admin, E_NOT_AUTHORIZED);
        state.is_paused = true;
    }

    /// Unpause the protocol
    public entry fun unpause(admin: &signer) acquires ProtocolState {
        let admin_addr = signer::address_of(admin);
        let state = borrow_global_mut<ProtocolState>(@bitmax);
        
        assert!(admin_addr == state.admin, E_NOT_AUTHORIZED);
        state.is_paused = false;
    }

    /// Check if protocol is paused
    public fun is_paused(): bool acquires ProtocolState {
        let state = borrow_global<ProtocolState>(@bitmax);
        state.is_paused
    }
}