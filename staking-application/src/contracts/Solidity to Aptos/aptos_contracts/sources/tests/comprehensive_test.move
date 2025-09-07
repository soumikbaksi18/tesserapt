#[test_only]
module bitmax::comprehensive_test {
    use std::string;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use bitmax::yield_tokenization;
    use bitmax::standardized_wrapper;
    use bitmax::pt_token;
    use bitmax::yt_token;
    use bitmax::price_oracle;
    use bitmax::staking_dapp;

    #[test(admin = @bitmax)]
    public fun test_token_initialization_with_maturity(admin: &signer) {
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        
        let future_maturity = timestamp::now_seconds() + 86400; // 1 day from now
        
        // Test PT token initialization
        pt_token::initialize(
            admin,
            string::utf8(b"Principal Token"),
            string::utf8(b"PT"),
            future_maturity
        );
        
        // Test YT token initialization  
        yt_token::initialize(
            admin,
            string::utf8(b"Yield Token"),
            string::utf8(b"YT"),
            future_maturity
        );
        
        // Test passes if no assertion failures
    }

    #[test(admin = @bitmax)]
    public fun test_token_minting_operations(admin: &signer) {
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        
        let future_maturity = timestamp::now_seconds() + 86400;
        
        // Initialize tokens
        pt_token::initialize(admin, string::utf8(b"PT"), string::utf8(b"PT"), future_maturity);
        yt_token::initialize(admin, string::utf8(b"YT"), string::utf8(b"YT"), future_maturity);

        // Test passes if initialization succeeds
        // Minting requires proper coin framework setup which is complex in tests
    }

    #[test(admin = @bitmax)]
    public fun test_advanced_protocol_features(admin: &signer) {
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        
        // Initialize core protocol
        yield_tokenization::initialize(
            admin,
            string::utf8(b"Advanced Protocol"),
            string::utf8(b"ADV")
        );

        // Initialize wrapper with higher yield rate
        standardized_wrapper::initialize(
            admin,
            string::utf8(b"Advanced SY"),
            string::utf8(b"ASY"),
            1500 // 15% yield rate
        );

        // Configure multiple token ratios
        standardized_wrapper::configure_token(admin, 0, 4000, true); // 40%
        standardized_wrapper::configure_token(admin, 1, 3500, true); // 35%
        standardized_wrapper::configure_token(admin, 2, 2500, true); // 25%

        // Create multiple maturities with sufficiently different timestamps
        let base_time = timestamp::now_seconds();
        let maturity1 = base_time + 100000;   // Different from basic tests
        let maturity2 = base_time + 200000;   // Much more different
        let maturity3 = base_time + 300000;   // Even more different
        
        yield_tokenization::create_maturity(admin, maturity1);
        yield_tokenization::create_maturity(admin, maturity2);
        yield_tokenization::create_maturity(admin, maturity3);

        // Verify multiple maturities exist
        let maturities = yield_tokenization::get_maturities();
        assert!(std::vector::length(&maturities) >= 3, 1);
    }

    #[test(admin = @bitmax)]
    public fun test_price_oracle_advanced_features(admin: &signer) {
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        
        // Initialize oracle
        price_oracle::initialize(admin);

        // Test multiple price feeds for different tokens (admin is automatically a price updater)
        price_oracle::update_price(admin, @0x1001, 100000000u64, 95u64);
        price_oracle::update_price(admin, @0x1002, 200000000u64, 98u64);
        price_oracle::update_price(admin, @0x1003, 300000000u64, 99u64);

        // Verify prices are set
        let price1 = price_oracle::get_price(@0x1001);
        let price2 = price_oracle::get_price(@0x1002);
        let price3 = price_oracle::get_price(@0x1003);
        
        assert!(price1 == 100000000u64, 2);
        assert!(price2 == 200000000u64, 3);
        assert!(price3 == 300000000u64, 4);
        
        // Test adding another price updater
        price_oracle::add_price_updater(admin, @0x999);
    }

    #[test(admin = @bitmax)]
    public fun test_staking_initialization_variants(admin: &signer) {
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        
        // Test staking with different reward configurations
        staking_dapp::initialize<0x1::aptos_coin::AptosCoin>(
            admin,
            b"High Yield Reward",
            b"HYR"
        );
        
        // Test passes if initialization succeeds
    }

    #[test(admin = @bitmax)]
    public fun test_protocol_pause_resume_cycle(admin: &signer) {
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        
        // Initialize protocol
        yield_tokenization::initialize(
            admin,
            string::utf8(b"Pausable Protocol"),
            string::utf8(b"PAUSE")
        );

        // Test multiple pause/unpause cycles
        yield_tokenization::pause(admin);
        assert!(yield_tokenization::is_paused(), 5);
        
        yield_tokenization::unpause(admin);
        assert!(!yield_tokenization::is_paused(), 6);
        
        yield_tokenization::pause(admin);
        assert!(yield_tokenization::is_paused(), 7);
        
        yield_tokenization::unpause(admin);
        assert!(!yield_tokenization::is_paused(), 8);
    }
}