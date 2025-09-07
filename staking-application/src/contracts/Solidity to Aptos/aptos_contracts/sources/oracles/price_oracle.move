/// # Price Oracle Module
/// 
/// Production-ready price oracle with multiple price sources and validation.
/// Provides reliable price feeds with circuit breakers and threshold monitoring.
/// 
/// ## Key Features:
/// - Secure price updates with authorization controls
/// - Price deviation validation and staleness checks
/// - Threshold monitoring for automated triggers
/// - Circuit breaker for emergency situations
/// - Confidence levels for price data quality

module bitmax::price_oracle {
    use std::signer;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::event;

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_INVALID_PRICE: u64 = 2;
    const E_INVALID_CONFIDENCE: u64 = 3;
    const E_UPDATE_TOO_FREQUENT: u64 = 4;
    const E_PRICE_DEVIATION_TOO_LARGE: u64 = 5;
    const E_CIRCUIT_BREAKER_ACTIVE: u64 = 6;
    const E_NO_PRICE_AVAILABLE: u64 = 7;
    const E_PRICE_STALE: u64 = 8;
    const E_INVALID_THRESHOLD: u64 = 9;

    /// Constants
    const MAX_PRICE_DEVIATION: u64 = 1000; // 10% in basis points
    const MIN_UPDATE_INTERVAL: u64 = 300;  // 5 minutes
    const STALENESS_THRESHOLD: u64 = 3600; // 1 hour

    /// Price data structure
    struct PriceData has store {
        price: u64,           // Price scaled by 10^8
        timestamp: u64,       // Last update timestamp
        confidence: u64,      // Confidence level (0-10000 basis points)
        updater: address,     // Address that last updated the price
    }

    /// Threshold data structure
    struct ThresholdData has store {
        threshold: u64,       // Threshold price
        is_active: bool,      // Whether threshold monitoring is active
        setter: address,      // Who set the threshold
        set_timestamp: u64,   // When the threshold was set
    }

    /// Oracle state
    struct OracleState has key {
        admin: address,
        price_updaters: vector<address>,
        circuit_breaker_active: bool,
        is_paused: bool,
    }

    /// Price storage for tokens
    struct TokenPrices has key {
        prices: vector<PriceData>,
        thresholds: vector<ThresholdData>,
        token_addresses: vector<address>,
    }

    // Events
    #[event]
    struct PriceUpdated has drop, store {
        token: address,
        old_price: u64,
        new_price: u64,
        confidence: u64,
        updater: address,
    }

    #[event]
    struct ThresholdSet has drop, store {
        token: address,
        threshold: u64,
        setter: address,
    }

    #[event]
    struct ThresholdReached has drop, store {
        token: address,
        current_price: u64,
        threshold: u64,
    }

    #[event]
    struct PriceUpdaterAdded has drop, store {
        updater: address,
    }

    #[event]
    struct CircuitBreakerTriggered has drop, store {
        trigger: address,
    }

    /// Initialize the oracle
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        move_to(admin, OracleState {
            admin: admin_addr,
            price_updaters: vector::singleton(admin_addr),
            circuit_breaker_active: false,
            is_paused: false,
        });

        move_to(admin, TokenPrices {
            prices: vector::empty(),
            thresholds: vector::empty(),
            token_addresses: vector::empty(),
        });

        event::emit(PriceUpdaterAdded {
            updater: admin_addr,
        });
    }

    /// Add a price updater
    public entry fun add_price_updater(
        admin: &signer,
        updater: address,
    ) acquires OracleState {
        let admin_addr = signer::address_of(admin);
        let state = borrow_global_mut<OracleState>(@bitmax);
        
        assert!(admin_addr == state.admin, E_NOT_AUTHORIZED);
        assert!(!vector::contains(&state.price_updaters, &updater), E_NOT_AUTHORIZED);

        vector::push_back(&mut state.price_updaters, updater);

        event::emit(PriceUpdaterAdded {
            updater,
        });
    }

    /// Update price with validation
    public entry fun update_price(
        updater: &signer,
        token: address,
        new_price: u64,
        confidence: u64,
    ) acquires OracleState, TokenPrices {
        let updater_addr = signer::address_of(updater);
        let state = borrow_global<OracleState>(@bitmax);
        let prices = borrow_global_mut<TokenPrices>(@bitmax);
        
        assert!(!state.is_paused, E_NOT_AUTHORIZED);
        assert!(vector::contains(&state.price_updaters, &updater_addr), E_NOT_AUTHORIZED);
        assert!(new_price > 0, E_INVALID_PRICE);
        assert!(confidence <= 10000, E_INVALID_CONFIDENCE);
        assert!(!state.circuit_breaker_active, E_CIRCUIT_BREAKER_ACTIVE);

        // Find or create token index
        let token_index = find_or_create_token_index(prices, token);
        let price_data = vector::borrow_mut(&mut prices.prices, token_index);

        // Check minimum update interval (skip check for initial price updates)
        if (price_data.price > 0) {
            assert!(
                timestamp::now_seconds() >= price_data.timestamp + MIN_UPDATE_INTERVAL,
                E_UPDATE_TOO_FREQUENT
            );
        };

        let old_price = price_data.price;

        // Validate price deviation for existing prices
        if (old_price > 0) {
            let deviation = if (old_price > new_price) {
                ((old_price - new_price) * 10000) / old_price
            } else {
                ((new_price - old_price) * 10000) / old_price
            };
            
            assert!(deviation <= MAX_PRICE_DEVIATION, E_PRICE_DEVIATION_TOO_LARGE);
        };

        // Update price data
        price_data.price = new_price;
        price_data.timestamp = timestamp::now_seconds();
        price_data.confidence = confidence;
        price_data.updater = updater_addr;

        event::emit(PriceUpdated {
            token,
            old_price,
            new_price,
            confidence,
            updater: updater_addr,
        });

        // Check threshold
        check_threshold_internal(prices, token_index, new_price);
    }

    /// Set price threshold for a token
    public entry fun set_threshold(
        setter: &signer,
        token: address,
        threshold: u64,
    ) acquires OracleState, TokenPrices {
        let setter_addr = signer::address_of(setter);
        let state = borrow_global<OracleState>(@bitmax);
        let prices = borrow_global_mut<TokenPrices>(@bitmax);
        
        assert!(threshold > 0, E_INVALID_THRESHOLD);
        assert!(
            vector::contains(&state.price_updaters, &setter_addr) || setter_addr == state.admin,
            E_NOT_AUTHORIZED
        );

        let token_index = find_or_create_token_index(prices, token);
        let threshold_data = vector::borrow_mut(&mut prices.thresholds, token_index);

        threshold_data.threshold = threshold;
        threshold_data.is_active = true;
        threshold_data.setter = setter_addr;
        threshold_data.set_timestamp = timestamp::now_seconds();

        event::emit(ThresholdSet {
            token,
            threshold,
            setter: setter_addr,
        });
    }

    /// Get current price for a token
    public fun get_price(token: address): u64 acquires TokenPrices {
        let prices = borrow_global<TokenPrices>(@bitmax);
        let token_index_opt = find_token_index(prices, token);
        
        assert!(vector::length(&token_index_opt) > 0, E_NO_PRICE_AVAILABLE);
        let token_index = *vector::borrow(&token_index_opt, 0);
        
        let price_data = vector::borrow(&prices.prices, token_index);
        assert!(price_data.price > 0, E_NO_PRICE_AVAILABLE);
        assert!(
            timestamp::now_seconds() <= price_data.timestamp + STALENESS_THRESHOLD,
            E_PRICE_STALE
        );
        
        price_data.price
    }

    /// Check if threshold has been reached
    public fun threshold_reached(token: address): bool acquires TokenPrices {
        let prices = borrow_global<TokenPrices>(@bitmax);
        let token_index_opt = find_token_index(prices, token);
        
        if (vector::length(&token_index_opt) == 0) return false;
        let token_index = *vector::borrow(&token_index_opt, 0);
        
        let threshold_data = vector::borrow(&prices.thresholds, token_index);
        if (!threshold_data.is_active) return false;

        let price_data = vector::borrow(&prices.prices, token_index);
        if (price_data.price == 0) return false;

        // Check if price data is fresh
        if (timestamp::now_seconds() > price_data.timestamp + STALENESS_THRESHOLD) {
            return false
        };

        price_data.price >= threshold_data.threshold
    }

    /// Internal function to find or create token index
    fun find_or_create_token_index(prices: &mut TokenPrices, token: address): u64 {
        let token_index_opt = find_token_index(prices, token);
        
        if (vector::length(&token_index_opt) > 0) {
            *vector::borrow(&token_index_opt, 0)
        } else {
            // Create new entry
            let new_index = vector::length(&prices.token_addresses);
            vector::push_back(&mut prices.token_addresses, token);
            let current_time = timestamp::now_seconds();
            let initial_timestamp = if (current_time > MIN_UPDATE_INTERVAL + 1) {
                current_time - MIN_UPDATE_INTERVAL - 1
            } else {
                0
            };
            vector::push_back(&mut prices.prices, PriceData {
                price: 0,
                timestamp: initial_timestamp,
                confidence: 0,
                updater: @0x0,
            });
            vector::push_back(&mut prices.thresholds, ThresholdData {
                threshold: 0,
                is_active: false,
                setter: @0x0,
                set_timestamp: 0,
            });
            new_index
        }
    }

    /// Internal function to find token index
    fun find_token_index(prices: &TokenPrices, token: address): vector<u64> {
        let result = vector::empty<u64>();
        let i = 0;
        while (i < vector::length(&prices.token_addresses)) {
            if (*vector::borrow(&prices.token_addresses, i) == token) {
                vector::push_back(&mut result, i);
                break
            };
            i = i + 1;
        };
        result
    }

    /// Internal function to check threshold
    fun check_threshold_internal(prices: &TokenPrices, token_index: u64, current_price: u64) {
        let threshold_data = vector::borrow(&prices.thresholds, token_index);
        if (threshold_data.is_active && current_price >= threshold_data.threshold) {
            let token = *vector::borrow(&prices.token_addresses, token_index);
            event::emit(ThresholdReached {
                token,
                current_price,
                threshold: threshold_data.threshold,
            });
        }
    }

    /// Activate circuit breaker
    public entry fun activate_circuit_breaker(admin: &signer) acquires OracleState {
        let admin_addr = signer::address_of(admin);
        let state = borrow_global_mut<OracleState>(@bitmax);
        
        assert!(admin_addr == state.admin, E_NOT_AUTHORIZED);
        state.circuit_breaker_active = true;

        event::emit(CircuitBreakerTriggered {
            trigger: admin_addr,
        });
    }

    /// Reset circuit breaker
    public entry fun reset_circuit_breaker(admin: &signer) acquires OracleState {
        let admin_addr = signer::address_of(admin);
        let state = borrow_global_mut<OracleState>(@bitmax);
        
        assert!(admin_addr == state.admin, E_NOT_AUTHORIZED);
        state.circuit_breaker_active = false;
    }
}