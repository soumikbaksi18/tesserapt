// Deployment script for BTC Lending Platform
// This script initializes all contracts in the correct order with proper dependencies

script {
    use btc_lending_platform::interest_rate_model;
    use btc_lending_platform::collateral_vault;
    use btc_lending_platform::loan_manager;
    use btc_lending_platform::ctrl_btc_token;
    use btc_lending_platform::ln_btc_token;

    fun deploy(admin: &signer) {
        let admin_address = std::signer::address_of(admin);
        
        // Step 1: Initialize InterestRateModel with default rates
        let interest_rate_model_address = interest_rate_model::initialize(admin);
        
        // Step 2: Initialize CollateralVault (temporary loan manager address)
        let temp_loan_manager = admin_address; // Will be updated after LoanManager is created
        let collateral_vault_address = collateral_vault::initialize(admin, temp_loan_manager);
        
        // Step 3: Initialize LoanManager with contract addresses
        let loan_manager_address = loan_manager::initialize(
            admin,
            collateral_vault_address,
            interest_rate_model_address
        );
        
        // Step 4: Update CollateralVault with correct LoanManager address
        collateral_vault::update_loan_manager_address(admin, loan_manager_address);
        
        // Step 5: Initialize ctrlBTC token with CollateralVault authorization
        let _ctrl_btc_metadata = ctrl_btc_token::initialize(admin, collateral_vault_address);
        
        // Step 6: Initialize lnBTC token with LoanManager authorization
        let _ln_btc_metadata = ln_btc_token::initialize(admin, loan_manager_address);
        
        // Deployment complete - all contracts are now properly initialized and connected
        // The platform is ready for use with the following addresses:
        // - InterestRateModel: {interest_rate_model_address}
        // - CollateralVault: {collateral_vault_address}
        // - LoanManager: {loan_manager_address}
        // - ctrlBTC Token: {ctrl_btc_metadata}
        // - lnBTC Token: {ln_btc_metadata}
    }
}