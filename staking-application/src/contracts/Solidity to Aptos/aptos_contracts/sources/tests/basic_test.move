#[test_only]
module bitmax::basic_test {
    use std::string;
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use bitmax::yield_tokenization;
    use bitmax::standardized_wrapper;
    use bitmax::price_oracle;
    use bitmax::staking_dapp;

    #[test(admin = @bitmax)]
    public fun test_initialize_protocol(admin: &signer) {
        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        
        // Test yield tokenization initialization
        yield_tokenization::initialize(
            admin,
            string::utf8(b"Test Protocol"),
            string::utf8(b"TEST")
        );

        // Test standardized wrapper initialization
        standardized_wrapper::initialize(
            admin,
            string::utf8(b"Test SY"),
            string::utf8(b"TSY"),
            500 // 5% yield rate
        );

        // Verify protocol is not paused
        assert!(!yield_tokenization::is_paused(), 1);
        
        // Verify yield rate is set correctly
        assert!(standardized_wrapper::get_yield_rate() == 500, 2);
    }

    #[test(admin = @bitmax)]
    public fun test_create_maturity(admin: &signer) {
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        
        yield_tokenization::initialize(
            admin,
            string::utf8(b"Test Protocol"),
            string::utf8(b"TEST")
        );

        let future_time = timestamp::now_seconds() + 86400; // 1 day from now
        yield_tokenization::create_maturity(admin, future_time);

        let maturities = yield_tokenization::get_maturities();
        assert!(vector::length(&maturities) >= 1, 3);
    }

    #[test(admin = @bitmax)]
    public fun test_configure_wrapper_tokens(admin: &signer) {
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        
        standardized_wrapper::initialize(
            admin,
            string::utf8(b"Test SY"),
            string::utf8(b"TSY"),
            500
        );

        // Configure two tokens
        standardized_wrapper::configure_token(admin, 0, 6000, true); // 60%
        standardized_wrapper::configure_token(admin, 1, 4000, true); // 40%
        
        // Test passes if no assertion failures
    }

    #[test(admin = @bitmax)]
    public fun test_price_oracle_initialization(admin: &signer) {
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        
        price_oracle::initialize(admin);
        
        // Test passes if no assertion failures during initialization
    }

    #[test(admin = @bitmax)]
    public fun test_staking_initialization(admin: &signer) {
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        
        staking_dapp::initialize<0x1::aptos_coin::AptosCoin>(
            admin,
            b"Test Reward",
            b"TREWARD"
        );
        
        // Test passes if no assertion failures during initialization
    }

    #[test(admin = @bitmax)]
    public fun test_pause_unpause_functionality(admin: &signer) {
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        
        yield_tokenization::initialize(
            admin,
            string::utf8(b"Test Protocol"),
            string::utf8(b"TEST")
        );

        // Test pause
        yield_tokenization::pause(admin);
        assert!(yield_tokenization::is_paused(), 4);

        // Test unpause
        yield_tokenization::unpause(admin);
        assert!(!yield_tokenization::is_paused(), 5);
    }
}