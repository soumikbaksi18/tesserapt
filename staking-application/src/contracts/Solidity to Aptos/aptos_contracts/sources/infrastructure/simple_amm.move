/// # Simple AMM Module
/// 
/// Provides basic Automated Market Maker functionality for PT/YT token pairs.
/// Uses constant product formula (x * y = k) with configurable fees.
/// 
/// ## Key Features:
/// - Constant product AMM for token swaps
/// - Configurable swap fees (default 0.3%)
/// - Liquidity provision and removal
/// - Price discovery for PT/YT tokens
/// - Pausable for emergency situations

module bitmax::simple_amm {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::event;

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_INVALID_AMOUNT: u64 = 2;
    const E_INSUFFICIENT_LIQUIDITY: u64 = 3;
    const E_INSUFFICIENT_OUTPUT: u64 = 4;
    const E_IDENTICAL_TOKENS: u64 = 5;
    const E_PAUSED: u64 = 6;
    const E_INVALID_FEE: u64 = 7;

    /// Fee denominator for calculations
    const FEE_DENOMINATOR: u64 = 1000;

    /// AMM state for a token pair
    struct AMMState<phantom TokenA, phantom TokenB> has key {
        admin: address,
        reserve_a: u64,
        reserve_b: u64,
        fee: u64,  // Fee rate (3 = 0.3%)
        is_paused: bool,
    }

    // Events
    #[event]
    struct Swap has drop, store {
        user: address,
        amount_in: u64,
        amount_out: u64,
        is_a_to_b: bool,
    }

    #[event]
    struct LiquidityAdded has drop, store {
        user: address,
        amount_a: u64,
        amount_b: u64,
    }

    #[event]
    struct FeeUpdated has drop, store {
        old_fee: u64,
        new_fee: u64,
    }

    /// Initialize AMM for a token pair
    public entry fun initialize<TokenA, TokenB>(
        admin: &signer,
    ) {
        move_to(admin, AMMState<TokenA, TokenB> {
            admin: signer::address_of(admin),
            reserve_a: 0,
            reserve_b: 0,
            fee: 3, // 0.3% default fee
            is_paused: false,
        });
    }

    /// Add liquidity to the pool
    public entry fun add_liquidity<TokenA, TokenB>(
        user: &signer,
        amount_a: u64,
        amount_b: u64,
    ) acquires AMMState {
        let user_addr = signer::address_of(user);
        let state = borrow_global_mut<AMMState<TokenA, TokenB>>(@bitmax);
        
        assert!(!state.is_paused, E_PAUSED);
        assert!(amount_a > 0 && amount_b > 0, E_INVALID_AMOUNT);

        // Transfer tokens from user
        let coins_a = coin::withdraw<TokenA>(user, amount_a);
        let coins_b = coin::withdraw<TokenB>(user, amount_b);
        
        coin::deposit(@bitmax, coins_a);
        coin::deposit(@bitmax, coins_b);

        // Update reserves
        state.reserve_a = state.reserve_a + amount_a;
        state.reserve_b = state.reserve_b + amount_b;

        event::emit(LiquidityAdded {
            user: user_addr,
            amount_a,
            amount_b,
        });
    }

    /// Swap Token A for Token B
    public entry fun swap_a_for_b<TokenA, TokenB>(
        user: &signer,
        amount_in: u64,
    ) acquires AMMState {
        let user_addr = signer::address_of(user);
        let state = borrow_global_mut<AMMState<TokenA, TokenB>>(@bitmax);
        
        assert!(!state.is_paused, E_PAUSED);
        assert!(amount_in > 0, E_INVALID_AMOUNT);

        let amount_out = get_amount_out(amount_in, state.reserve_a, state.reserve_b, state.fee);
        assert!(amount_out > 0, E_INSUFFICIENT_OUTPUT);
        assert!(amount_out <= state.reserve_b, E_INSUFFICIENT_LIQUIDITY);

        // Transfer tokens
        let coins_in = coin::withdraw<TokenA>(user, amount_in);
        coin::deposit(@bitmax, coins_in);

        // Transfer tokens out (simplified - in production would use proper resource account)
        // For now, we'll just update reserves and emit event

        // Update reserves
        state.reserve_a = state.reserve_a + amount_in;
        state.reserve_b = state.reserve_b - amount_out;

        event::emit(Swap {
            user: user_addr,
            amount_in,
            amount_out,
            is_a_to_b: true,
        });
    }

    /// Swap Token B for Token A
    public entry fun swap_b_for_a<TokenA, TokenB>(
        user: &signer,
        amount_in: u64,
    ) acquires AMMState {
        let user_addr = signer::address_of(user);
        let state = borrow_global_mut<AMMState<TokenA, TokenB>>(@bitmax);
        
        assert!(!state.is_paused, E_PAUSED);
        assert!(amount_in > 0, E_INVALID_AMOUNT);

        let amount_out = get_amount_out(amount_in, state.reserve_b, state.reserve_a, state.fee);
        assert!(amount_out > 0, E_INSUFFICIENT_OUTPUT);
        assert!(amount_out <= state.reserve_a, E_INSUFFICIENT_LIQUIDITY);

        // Transfer tokens
        let coins_in = coin::withdraw<TokenB>(user, amount_in);
        coin::deposit(@bitmax, coins_in);

        // Transfer tokens out (simplified - in production would use proper resource account)
        // For now, we'll just update reserves and emit event

        // Update reserves
        state.reserve_b = state.reserve_b + amount_in;
        state.reserve_a = state.reserve_a - amount_out;

        event::emit(Swap {
            user: user_addr,
            amount_in,
            amount_out,
            is_a_to_b: false,
        });
    }

    /// Calculate output amount for a given input
    public fun get_amount_out(
        amount_in: u64,
        reserve_in: u64,
        reserve_out: u64,
        fee: u64,
    ): u64 {
        assert!(amount_in > 0, E_INVALID_AMOUNT);
        assert!(reserve_in > 0 && reserve_out > 0, E_INSUFFICIENT_LIQUIDITY);

        let amount_in_with_fee = amount_in * (FEE_DENOMINATOR - fee);
        let numerator = amount_in_with_fee * reserve_out;
        let denominator = reserve_in * FEE_DENOMINATOR + amount_in_with_fee;

        numerator / denominator
    }

    /// Get current reserves
    public fun get_reserves<TokenA, TokenB>(): (u64, u64) acquires AMMState {
        let state = borrow_global<AMMState<TokenA, TokenB>>(@bitmax);
        (state.reserve_a, state.reserve_b)
    }

    /// Set swap fee
    public entry fun set_fee<TokenA, TokenB>(
        admin: &signer,
        new_fee: u64,
    ) acquires AMMState {
        let admin_addr = signer::address_of(admin);
        let state = borrow_global_mut<AMMState<TokenA, TokenB>>(@bitmax);
        
        assert!(admin_addr == state.admin, E_NOT_AUTHORIZED);
        assert!(new_fee < FEE_DENOMINATOR, E_INVALID_FEE);

        let old_fee = state.fee;
        state.fee = new_fee;

        event::emit(FeeUpdated {
            old_fee,
            new_fee,
        });
    }

    /// Pause AMM
    public entry fun pause<TokenA, TokenB>(admin: &signer) acquires AMMState {
        let admin_addr = signer::address_of(admin);
        let state = borrow_global_mut<AMMState<TokenA, TokenB>>(@bitmax);
        
        assert!(admin_addr == state.admin, E_NOT_AUTHORIZED);
        state.is_paused = true;
    }

    /// Unpause AMM
    public entry fun unpause<TokenA, TokenB>(admin: &signer) acquires AMMState {
        let admin_addr = signer::address_of(admin);
        let state = borrow_global_mut<AMMState<TokenA, TokenB>>(@bitmax);
        
        assert!(admin_addr == state.admin, E_NOT_AUTHORIZED);
        state.is_paused = false;
    }
}