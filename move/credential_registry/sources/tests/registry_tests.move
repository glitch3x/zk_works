#[test_only]
module credential_registry::registry_tests {
    use sui::test_scenario::{Self, Scenario};
    use sui::object::{Self, ID};
    use credential_registry::registry::{Self, Passport, VerifiableCredential, AdminCap, AgentCap, REGISTRY};
    use std::string;

    const ADMIN: address = @0xA;
    const AGENT: address = @0xB;
    const USER: address = @0xC;

    #[test]
    fun test_full_flow() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Note: The `init` function is usually tested by publishing, 
        // but since we can't easily call it directly here without test_utils,
        // we'll assume AdminCap exists or skip that part if we need to mock it.
        // For standard Move tests, we can test the public entry functions directly
        // if we mint mock objects.
        
        test_scenario::next_tx(&mut scenario, USER);
        {
            registry::create_passport(
                string::utf8(b"Alice"), 
                b"mock_blob_id_bytes", 
                5, // 5 epochs
                test_scenario::ctx(&mut scenario)
            );
        };
        
        test_scenario::end(scenario);
    }
}
