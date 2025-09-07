script {
    // Deployment script for Bitmax Protocol
    // This script initializes all core components of the protocol
    use std::string;
    use bitmax::yield_tokenization;
    use bitmax::standardized_wrapper;
    use bitmax::price_oracle;
    use bitmax::staking_dapp;
    use bitmax::yt_auto_converter;

    /// Initialize the complete Bitmax protocol
    fun deploy_protocol(deployer: &signer) {
        // 1. Initialize yield tokenization (core protocol)
        yield_tokenization::initialize(
            deployer,
            string::utf8(b"Bitmax Protocol"),
            string::utf8(b"BITMAX")
        );

        // 2. Initialize standardized wrapper (entry point)
        standardized_wrapper::initialize(
            deployer,
            string::utf8(b"Standardized Yield Token"),
            string::utf8(b"SY"),
            500 // 5% annual yield rate
        );

        // 3. Initialize price oracle
        price_oracle::initialize(deployer);

        // 4. Initialize staking dapp (yield source)
        staking_dapp::initialize<0x1::aptos_coin::AptosCoin>(
            deployer,
            b"Reward Token",
            b"REWARD"
        );

        // 5. Initialize auto converter (AI component)
        yt_auto_converter::initialize(
            deployer,
            @bitmax, // oracle address
            @bitmax, // tokenization address  
            @0x1,    // reference token (APT)
            @bitmax  // AMM address
        );

        // 6. Configure initial token ratios for wrapper
        standardized_wrapper::configure_token(deployer, 0, 6000, true); // 60% ratio
        standardized_wrapper::configure_token(deployer, 1, 4000, true); // 40% ratio
    }
}