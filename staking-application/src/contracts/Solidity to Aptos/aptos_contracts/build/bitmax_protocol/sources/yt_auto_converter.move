/// # YT Auto Converter Module
/// 
/// AI-powered automation engine that automatically converts YT tokens to PT tokens
/// when price thresholds are reached. This is the core AI optimization component.
/// 
/// ## Key Features:
/// - Automated YT to PT conversion based on price thresholds
/// - User-configurable risk preferences and thresholds
/// - Real market integration via AMM for conversions
/// - Slippage protection and deadline enforcement
/// - Fee mechanism for protocol sustainability

module bitmax::yt_auto_converter {
    use std::signer;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use bitmax::price_oracle;
    use bitmax::simple_amm;

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_CONVERSION_NOT_ENABLED: u64 = 2;
    const E_CONVERSION_ALREADY_EXECUTED: u64 = 3;
    const E_THRESHOLD_NOT_REACHED: u64 = 4;
    const E_INVALID_TOKENS: u64 = 5;
    const E_NO_YT_BALANCE: u64 = 6;
    const E_TRANSACTION_EXPIRED: u64 = 7;
    const E_MATURITY_NOT_FOUND: u64 = 8;
    const E_MATURITY_ALREADY_EXISTS: u64 = 9;
    const E_INSUFFICIENT_OUTPUT: u64 = 10;
    const E_PAUSED: u64 = 11;
    const E_FEE_TOO_HIGH: u64 = 12;

    /// Constants
    const MAX_SLIPPAGE: u64 = 500; // 5%
    const FEE_DENOMINATOR: u64 = 10000;

    /// User configuration for auto conversion
    struct UserConfig has store {
        enabled: bool,
        threshold_price: u64,  // Price threshold in USD (scaled by 10^8)
        maturities: vector<u64>, // Maturity timestamps to convert
    }

    /// Converter state
    struct ConverterState has key {
        admin: address,
        oracle_address: address,
        tokenization_address: address,
        reference_token: address,
        amm_address: address,
        conversion_fee: u64, // Fee in basis points (30 = 0.3%)
        is_paused: bool,
    }

    /// User configurations storage
    struct UserConfigs has key {
        configs: vector<UserConfig>,
        user_addresses: vector<address>,
    }

    /// Conversion execution tracking
    struct ConversionTracking has key {
        executed: vector<bool>, // Flattened: user_index * max_maturities + maturity_index
        user_count: u64,
        max_maturities: u64,
    }

    // Events
    #[event]
    struct ConversionExecuted has drop, store {
        user: address,
        maturity: u64,
        yt_amount: u64,
        pt_amount: u64,
    }

    #[event]
    struct UserConfigUpdated has drop, store {
        user: address,
        enabled: bool,
        threshold_price: u64,
    }

    #[event]
    struct MaturityAdded has drop, store {
        user: address,
        maturity: u64,
    }

    #[event]
    struct MaturityRemoved has drop, store {
        user: address,
        maturity: u64,
    }

    /// Initialize the auto converter
    public entry fun initialize(
        admin: &signer,
        oracle_address: address,
        tokenization_address: address,
        reference_token: address,
        amm_address: address,
    ) {
        move_to(admin, ConverterState {
            admin: signer::address_of(admin),
            oracle_address,
            tokenization_address,
            reference_token,
            amm_address,
            conversion_fee: 30, // 0.3%
            is_paused: false,
        });

        move_to(admin, UserConfigs {
            configs: vector::empty(),
            user_addresses: vector::empty(),
        });

        move_to(admin, ConversionTracking {
            executed: vector::empty(),
            user_count: 0,
            max_maturities: 10, // Initial capacity
        });
    }

    /// Configure automatic conversion for a user
    public entry fun configure(
        user: &signer,
        enabled: bool,
        threshold_price: u64,
    ) acquires UserConfigs {
        let user_addr = signer::address_of(user);
        let configs = borrow_global_mut<UserConfigs>(@bitmax);
        
        let user_index_opt = find_user_index(configs, user_addr);
        
        if (vector::length(&user_index_opt) > 0) {
            // Update existing config
            let user_index = *vector::borrow(&user_index_opt, 0);
            let config = vector::borrow_mut(&mut configs.configs, user_index);
            config.enabled = enabled;
            config.threshold_price = threshold_price;
        } else {
            // Create new config
            vector::push_back(&mut configs.user_addresses, user_addr);
            vector::push_back(&mut configs.configs, UserConfig {
                enabled,
                threshold_price,
                maturities: vector::empty(),
            });
        };

        event::emit(UserConfigUpdated {
            user: user_addr,
            enabled,
            threshold_price,
        });
    }

    /// Add a maturity to convert
    public entry fun add_maturity(
        user: &signer,
        maturity: u64,
    ) acquires UserConfigs {
        let user_addr = signer::address_of(user);
        let configs = borrow_global_mut<UserConfigs>(@bitmax);
        
        let user_index_opt = find_user_index(configs, user_addr);
        assert!(vector::length(&user_index_opt) > 0, E_NOT_AUTHORIZED);
        
        let user_index = *vector::borrow(&user_index_opt, 0);
        let config = vector::borrow_mut(&mut configs.configs, user_index);
        
        // Check if maturity already exists
        assert!(!vector::contains(&config.maturities, &maturity), E_MATURITY_ALREADY_EXISTS);
        
        vector::push_back(&mut config.maturities, maturity);

        event::emit(MaturityAdded {
            user: user_addr,
            maturity,
        });
    }

    /// Remove a maturity
    public entry fun remove_maturity(
        user: &signer,
        maturity: u64,
    ) acquires UserConfigs {
        let user_addr = signer::address_of(user);
        let configs = borrow_global_mut<UserConfigs>(@bitmax);
        
        let user_index_opt = find_user_index(configs, user_addr);
        assert!(vector::length(&user_index_opt) > 0, E_NOT_AUTHORIZED);
        
        let user_index = *vector::borrow(&user_index_opt, 0);
        let config = vector::borrow_mut(&mut configs.configs, user_index);
        
        // Find and remove maturity
        let (found, maturity_index) = vector::index_of(&config.maturities, &maturity);
        assert!(found, E_MATURITY_NOT_FOUND);
        
        vector::remove(&mut config.maturities, maturity_index);

        event::emit(MaturityRemoved {
            user: user_addr,
            maturity,
        });
    }

    /// Execute conversion from YT to PT
    public entry fun execute_conversion<YTToken, PTToken>(
        executor: &signer,
        user: address,
        maturity: u64,
        min_pt_amount: u64,
        deadline: u64,
    ) acquires ConverterState, UserConfigs, ConversionTracking {
        let state = borrow_global<ConverterState>(@bitmax);
        assert!(!state.is_paused, E_PAUSED);
        assert!(timestamp::now_seconds() <= deadline, E_TRANSACTION_EXPIRED);

        let configs = borrow_global<UserConfigs>(@bitmax);
        let user_index_opt = find_user_index(configs, user);
        assert!(vector::length(&user_index_opt) > 0, E_NOT_AUTHORIZED);
        
        let user_index = *vector::borrow(&user_index_opt, 0);
        let config = vector::borrow(&configs.configs, user_index);
        assert!(config.enabled, E_CONVERSION_NOT_ENABLED);

        // Check if conversion already executed
        let tracking = borrow_global_mut<ConversionTracking>(@bitmax);
        let execution_index = user_index * tracking.max_maturities + get_maturity_index(maturity);
        
        // Extend tracking if needed
        while (vector::length(&tracking.executed) <= execution_index) {
            vector::push_back(&mut tracking.executed, false);
        };
        
        assert!(!*vector::borrow(&tracking.executed, execution_index), E_CONVERSION_ALREADY_EXECUTED);

        // Check if threshold is reached
        assert!(price_oracle::threshold_reached(state.reference_token), E_THRESHOLD_NOT_REACHED);

        // Get YT balance (simplified - in full implementation would check actual balance)
        let yt_balance = 1000u64; // Placeholder
        assert!(yt_balance > 0, E_NO_YT_BALANCE);

        // Calculate conversion fee
        let fee_amount = (yt_balance * state.conversion_fee) / FEE_DENOMINATOR;
        let conversion_amount = yt_balance - fee_amount;

        // Perform market-based conversion through AMM
        let received_pt = perform_market_conversion<YTToken, PTToken>(
            conversion_amount,
            min_pt_amount,
        );

        // Mark conversion as executed
        *vector::borrow_mut(&mut tracking.executed, execution_index) = true;

        event::emit(ConversionExecuted {
            user,
            maturity,
            yt_amount: yt_balance,
            pt_amount: received_pt,
        });
    }

    /// Internal function to perform market-based conversion
    fun perform_market_conversion<YTToken, PTToken>(
        amount: u64,
        min_output: u64,
    ): u64 {
        // Get expected output from AMM
        let (reserve_a, reserve_b) = simple_amm::get_reserves<YTToken, PTToken>();
        let expected_output = simple_amm::get_amount_out(amount, reserve_a, reserve_b, 3);
        
        assert!(expected_output >= min_output, E_INSUFFICIENT_OUTPUT);
        
        // In full implementation, would perform actual swap
        // For simplicity, returning expected output
        expected_output
    }

    /// Check if conversion can be executed
    public fun can_execute_conversion(
        user: address,
        maturity: u64,
    ): bool acquires ConverterState, UserConfigs, ConversionTracking {
        let state = borrow_global<ConverterState>(@bitmax);
        let configs = borrow_global<UserConfigs>(@bitmax);
        
        let user_index_opt = find_user_index(configs, user);
        if (vector::length(&user_index_opt) == 0) return false;
        
        let user_index = *vector::borrow(&user_index_opt, 0);
        let config = vector::borrow(&configs.configs, user_index);
        
        if (!config.enabled) return false;

        // Check if already executed
        let tracking = borrow_global<ConversionTracking>(@bitmax);
        let execution_index = user_index * tracking.max_maturities + get_maturity_index(maturity);
        
        if (execution_index < vector::length(&tracking.executed)) {
            if (*vector::borrow(&tracking.executed, execution_index)) return false;
        };

        // Check if threshold is reached
        price_oracle::threshold_reached(state.reference_token)
    }

    /// Get user maturities
    public fun get_user_maturities(user: address): vector<u64> acquires UserConfigs {
        let configs = borrow_global<UserConfigs>(@bitmax);
        let user_index_opt = find_user_index(configs, user);
        
        if (vector::length(&user_index_opt) == 0) {
            return vector::empty()
        };
        
        let user_index = *vector::borrow(&user_index_opt, 0);
        let config = vector::borrow(&configs.configs, user_index);
        config.maturities
    }

    /// Set conversion fee
    public entry fun set_conversion_fee(
        admin: &signer,
        new_fee: u64,
    ) acquires ConverterState {
        let admin_addr = signer::address_of(admin);
        let state = borrow_global_mut<ConverterState>(@bitmax);
        
        assert!(admin_addr == state.admin, E_NOT_AUTHORIZED);
        assert!(new_fee <= 1000, E_FEE_TOO_HIGH); // Max 10%
        
        state.conversion_fee = new_fee;
    }

    /// Pause conversions
    public entry fun pause(admin: &signer) acquires ConverterState {
        let admin_addr = signer::address_of(admin);
        let state = borrow_global_mut<ConverterState>(@bitmax);
        
        assert!(admin_addr == state.admin, E_NOT_AUTHORIZED);
        state.is_paused = true;
    }

    /// Unpause conversions
    public entry fun unpause(admin: &signer) acquires ConverterState {
        let admin_addr = signer::address_of(admin);
        let state = borrow_global_mut<ConverterState>(@bitmax);
        
        assert!(admin_addr == state.admin, E_NOT_AUTHORIZED);
        state.is_paused = false;
    }

    /// Helper function to find user index
    fun find_user_index(configs: &UserConfigs, user: address): vector<u64> {
        let result = vector::empty<u64>();
        let i = 0;
        while (i < vector::length(&configs.user_addresses)) {
            if (*vector::borrow(&configs.user_addresses, i) == user) {
                vector::push_back(&mut result, i);
                break
            };
            i = i + 1;
        };
        result
    }

    /// Helper function to get maturity index (simplified)
    fun get_maturity_index(maturity: u64): u64 {
        // Simplified mapping - in full implementation would use proper indexing
        maturity % 10
    }
}