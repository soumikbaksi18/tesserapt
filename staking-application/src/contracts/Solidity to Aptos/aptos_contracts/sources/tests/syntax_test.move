#[test_only]
module bitmax::syntax_test {
    use std::vector;
    use std::string;

    #[test]
    public fun test_basic_syntax() {
        // Test vector operations
        let v = vector::empty<u64>();
        vector::push_back(&mut v, 1);
        assert!(vector::length(&v) == 1, 1);

        // Test string operations
        let s = string::utf8(b"test");
        assert!(string::length(&s) == 4, 2);

        // Test basic arithmetic
        let a = 10u64;
        let b = 20u64;
        let c = a + b;
        assert!(c == 30, 3);
    }

    #[test]
    public fun test_conditional_expressions() {
        let amount = 100u64;
        let result = if (amount > 0) {
            amount * 2
        } else {
            0u64
        };
        assert!(result == 200, 4);
    }
}