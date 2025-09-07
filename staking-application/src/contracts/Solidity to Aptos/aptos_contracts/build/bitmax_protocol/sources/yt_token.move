/// # Yield Token (YT) Module
/// 
/// Yield Tokens capture all future yield until maturity. They represent the yield-earning
/// component of the tokenized split, allowing users to trade future yield expectations.
/// 
/// ## Key Features:
/// - ERC20-like functionality with minting/burning controls
/// - Maturity timestamp after which no more yield accrues
/// - Owner-controlled minting (usually the tokenization contract)
/// - Tradeable on AMM for yield speculation

module bitmax::yt_token {
    use std::signer;
    use std::string::{Self, String};
    use aptos_framework::coin::{Self, MintCapability, BurnCapability};
    use aptos_framework::event;

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_INVALID_AMOUNT: u64 = 2;
    const E_INVALID_ADDRESS: u64 = 3;
    const E_INVALID_MATURITY: u64 = 4;

    /// YT Token coin type
    struct YTToken has key {}

    /// YT Token state
    struct YTTokenState has key {
        owner: address,
        maturity: u64,
        mint_cap: MintCapability<YTToken>,
        burn_cap: BurnCapability<YTToken>,
    }

    // Events
    #[event]
    struct TokenMinted has drop, store {
        to: address,
        amount: u64,
    }

    #[event]
    struct TokenBurned has drop, store {
        from: address,
        amount: u64,
    }

    /// Initialize YT token
    public entry fun initialize(
        owner: &signer,
        name: String,
        symbol: String,
        maturity: u64,
    ) {
        use aptos_framework::timestamp;
        
        assert!(maturity > timestamp::now_seconds(), E_INVALID_MATURITY);
        
        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<YTToken>(
            owner,
            string::utf8(b"YT Token"),
            string::utf8(b"YT"),
            8, // decimals
            true, // monitor_supply
        );

        coin::destroy_freeze_cap(freeze_cap);

        move_to(owner, YTTokenState {
            owner: signer::address_of(owner),
            maturity,
            mint_cap,
            burn_cap,
        });
    }

    /// Mint YT tokens
    public entry fun mint(
        owner: &signer,
        to: address,
        amount: u64,
    ) acquires YTTokenState {
        let owner_addr = signer::address_of(owner);
        let state = borrow_global<YTTokenState>(@bitmax);
        
        assert!(owner_addr == state.owner, E_NOT_AUTHORIZED);
        assert!(to != @0x0, E_INVALID_ADDRESS);
        assert!(amount > 0, E_INVALID_AMOUNT);

        let coins = coin::mint(amount, &state.mint_cap);
        coin::deposit(to, coins);

        event::emit(TokenMinted {
            to,
            amount,
        });
    }

    /// Burn YT tokens from an account
    public entry fun burn_from(
        owner: &signer,
        from: address,
        amount: u64,
    ) acquires YTTokenState {
        let owner_addr = signer::address_of(owner);
        let state = borrow_global<YTTokenState>(@bitmax);
        
        assert!(owner_addr == state.owner, E_NOT_AUTHORIZED);
        assert!(from != @0x0, E_INVALID_ADDRESS);
        assert!(amount > 0, E_INVALID_AMOUNT);

        // Note: In production, this would require proper approval mechanisms
        // For now, we'll just emit the burn event (actual burning would need user approval)
        // This is a simplified implementation for testing purposes

        event::emit(TokenBurned {
            from,
            amount,
        });
    }

    /// Get maturity timestamp
    public fun get_maturity(): u64 acquires YTTokenState {
        let state = borrow_global<YTTokenState>(@bitmax);
        state.maturity
    }

    /// Check if token has matured
    public fun is_mature(): bool acquires YTTokenState {
        use aptos_framework::timestamp;
        
        let state = borrow_global<YTTokenState>(@bitmax);
        timestamp::now_seconds() >= state.maturity
    }

    /// Check if yield is still accruing
    public fun is_accruing_yield(): bool acquires YTTokenState {
        !is_mature()
    }
}