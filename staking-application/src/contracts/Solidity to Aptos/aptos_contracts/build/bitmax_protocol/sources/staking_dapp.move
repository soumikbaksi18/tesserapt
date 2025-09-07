/// # Staking DApp Module
/// 
/// Manages staking of tokens and distribution of time-based rewards.
/// Provides the underlying yield that gets tokenized by the protocol.
/// 
/// ## Key Features:
/// - Time-based staking rewards (5 tokens every 10 seconds)
/// - Stake and unstake functionality
/// - Automatic reward calculation and claiming
/// - Pausable for emergency situations

module bitmax::staking_dapp {
    use std::signer;
    use std::string;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::coin::{Self, MintCapability};
    use aptos_framework::event;

    /// Error codes
    const E_INVALID_AMOUNT: u64 = 1;
    const E_INSUFFICIENT_STAKED: u64 = 2;
    const E_NO_REWARDS: u64 = 3;
    const E_PAUSED: u64 = 4;
    const E_NOT_AUTHORIZED: u64 = 5;

    /// Constants
    const REWARD_AMOUNT: u64 = 5;
    const REWARD_INTERVAL: u64 = 10; // seconds

    /// Reward token type
    struct RewardToken has key {}

    /// Stake information for a user
    struct Stake has store {
        amount: u64,
        last_reward_time: u64,
    }

    /// Staking state
    struct StakingState has key {
        admin: address,
        stakes: vector<Stake>,
        user_addresses: vector<address>,
        reward_balances: vector<u64>,
        is_paused: bool,
        reward_mint_cap: MintCapability<RewardToken>,
    }

    // Events
    #[event]
    struct Staked has drop, store {
        user: address,
        amount: u64,
    }

    #[event]
    struct Unstaked has drop, store {
        user: address,
        amount: u64,
    }

    #[event]
    struct RewardClaimed has drop, store {
        user: address,
        amount: u64,
    }

    /// Initialize the staking contract
    public entry fun initialize<StakingToken>(
        admin: &signer,
        reward_name: vector<u8>,
        reward_symbol: vector<u8>,
    ) {
        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<RewardToken>(
            admin,
            string::utf8(reward_name),
            string::utf8(reward_symbol),
            8, // decimals
            true, // monitor_supply
        );

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_freeze_cap(freeze_cap);

        move_to(admin, StakingState {
            admin: signer::address_of(admin),
            stakes: vector::empty(),
            user_addresses: vector::empty(),
            reward_balances: vector::empty(),
            is_paused: false,
            reward_mint_cap: mint_cap,
        });
    }

    /// Stake tokens
    public entry fun stake<StakingToken>(
        user: &signer,
        amount: u64,
    ) acquires StakingState {
        let user_addr = signer::address_of(user);
        let state = borrow_global_mut<StakingState>(@bitmax);
        
        assert!(!state.is_paused, E_PAUSED);
        assert!(amount > 0, E_INVALID_AMOUNT);

        let user_index_opt = find_user_index(state, user_addr);
        
        if (vector::length(&user_index_opt) > 0) {
            // Update existing stake
            let user_index = *vector::borrow(&user_index_opt, 0);
            let stake = vector::borrow_mut(&mut state.stakes, user_index);
            
            // Calculate and update reward balance before changing stake
            let pending_reward = calculate_reward_internal(stake);
            if (pending_reward > 0) {
                let current_balance = vector::borrow_mut(&mut state.reward_balances, user_index);
                *current_balance = *current_balance + pending_reward;
            };
            
            stake.amount = stake.amount + amount;
            stake.last_reward_time = timestamp::now_seconds();
        } else {
            // Create new stake
            vector::push_back(&mut state.user_addresses, user_addr);
            vector::push_back(&mut state.stakes, Stake {
                amount,
                last_reward_time: timestamp::now_seconds(),
            });
            vector::push_back(&mut state.reward_balances, 0);
        };

        // Transfer staking tokens (simplified for demo - in production would use proper resource account)
        // For now, we'll just track the staking amount without actual token transfer

        event::emit(Staked {
            user: user_addr,
            amount,
        });
    }

    /// Unstake tokens
    public entry fun unstake<StakingToken>(
        user: &signer,
        amount: u64,
    ) acquires StakingState {
        let user_addr = signer::address_of(user);
        let state = borrow_global_mut<StakingState>(@bitmax);
        
        assert!(!state.is_paused, E_PAUSED);
        assert!(amount > 0, E_INVALID_AMOUNT);

        let user_index_opt = find_user_index(state, user_addr);
        assert!(vector::length(&user_index_opt) > 0, E_INSUFFICIENT_STAKED);
        
        let user_index = *vector::borrow(&user_index_opt, 0);
        let stake = vector::borrow_mut(&mut state.stakes, user_index);
        assert!(stake.amount >= amount, E_INSUFFICIENT_STAKED);

        // Calculate and update reward balance before unstaking
        let pending_reward = calculate_reward_internal(stake);
        if (pending_reward > 0) {
            let current_balance = vector::borrow_mut(&mut state.reward_balances, user_index);
            *current_balance = *current_balance + pending_reward;
        };

        stake.amount = stake.amount - amount;
        stake.last_reward_time = timestamp::now_seconds();

        // Transfer staking tokens back (simplified - in production would use proper resource account)
        // For now, we'll just emit the event to track the unstaking

        event::emit(Unstaked {
            user: user_addr,
            amount,
        });
    }

    /// Claim accumulated rewards
    public entry fun claim_rewards(
        user: &signer,
    ) acquires StakingState {
        let user_addr = signer::address_of(user);
        let state = borrow_global_mut<StakingState>(@bitmax);
        
        assert!(!state.is_paused, E_PAUSED);

        let user_index_opt = find_user_index(state, user_addr);
        assert!(vector::length(&user_index_opt) > 0, E_NO_REWARDS);
        
        let user_index = *vector::borrow(&user_index_opt, 0);
        let stake = vector::borrow_mut(&mut state.stakes, user_index);
        
        let pending_reward = calculate_reward_internal(stake);
        let reward_balance = vector::borrow_mut(&mut state.reward_balances, user_index);
        let total_reward = *reward_balance + pending_reward;
        
        assert!(total_reward > 0, E_NO_REWARDS);

        *reward_balance = 0;
        stake.last_reward_time = timestamp::now_seconds();

        // Mint and transfer reward tokens
        let reward_coins = coin::mint(total_reward, &state.reward_mint_cap);
        coin::deposit(user_addr, reward_coins);

        event::emit(RewardClaimed {
            user: user_addr,
            amount: total_reward,
        });
    }

    /// Calculate pending rewards for a user
    public fun calculate_reward(user: address): u64 acquires StakingState {
        let state = borrow_global<StakingState>(@bitmax);
        let user_index_opt = find_user_index(state, user);
        
        if (vector::length(&user_index_opt) == 0) {
            return 0
        };
        
        let user_index = *vector::borrow(&user_index_opt, 0);
        let stake = vector::borrow(&state.stakes, user_index);
        calculate_reward_internal(stake)
    }

    /// Get total rewards for a user (claimed + pending)
    public fun get_total_rewards(user: address): u64 acquires StakingState {
        let state = borrow_global<StakingState>(@bitmax);
        let user_index_opt = find_user_index(state, user);
        
        if (vector::length(&user_index_opt) == 0) {
            return 0
        };
        
        let user_index = *vector::borrow(&user_index_opt, 0);
        let stake = vector::borrow(&state.stakes, user_index);
        let reward_balance = *vector::borrow(&state.reward_balances, user_index);
        
        reward_balance + calculate_reward_internal(stake)
    }

    /// Get staked amount for a user
    public fun get_staked_amount(user: address): u64 acquires StakingState {
        let state = borrow_global<StakingState>(@bitmax);
        let user_index_opt = find_user_index(state, user);
        
        if (vector::length(&user_index_opt) == 0) {
            return 0
        };
        
        let user_index = *vector::borrow(&user_index_opt, 0);
        let stake = vector::borrow(&state.stakes, user_index);
        stake.amount
    }

    /// Internal function to calculate rewards
    fun calculate_reward_internal(stake: &Stake): u64 {
        if (stake.amount == 0) {
            return 0
        };
        
        let time_passed = timestamp::now_seconds() - stake.last_reward_time;
        let intervals = time_passed / REWARD_INTERVAL;
        intervals * REWARD_AMOUNT * stake.amount / 1000000000 // Scaled by 10^9
    }

    /// Helper function to find user index
    fun find_user_index(state: &StakingState, user: address): vector<u64> {
        let result = vector::empty<u64>();
        let i = 0;
        while (i < vector::length(&state.user_addresses)) {
            if (*vector::borrow(&state.user_addresses, i) == user) {
                vector::push_back(&mut result, i);
                break
            };
            i = i + 1;
        };
        result
    }

    /// Pause staking
    public entry fun pause(admin: &signer) acquires StakingState {
        let admin_addr = signer::address_of(admin);
        let state = borrow_global_mut<StakingState>(@bitmax);
        
        assert!(admin_addr == state.admin, E_NOT_AUTHORIZED);
        state.is_paused = true;
    }

    /// Unpause staking
    public entry fun unpause(admin: &signer) acquires StakingState {
        let admin_addr = signer::address_of(admin);
        let state = borrow_global_mut<StakingState>(@bitmax);
        
        assert!(admin_addr == state.admin, E_NOT_AUTHORIZED);
        state.is_paused = false;
    }
}