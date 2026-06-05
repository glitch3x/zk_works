module credential_registry::registry {
    use sui::tx_context::TxContext;
    use std::string::{Self, String};
    use sui::event;
    use sui::package;
    use sui::display;

    // =========================================================================
    //  Types & Capabilities
    // =========================================================================

    /// OTW for Display
    public struct REGISTRY has drop {}

    /// Capability granted to the deployer, allows minting AgentCaps
    public struct AdminCap has key {
        id: UID
    }

    /// Capability granted to authorized AI Agents, allows issuing credentials
    public struct AgentCap has key {
        id: UID
    }

    /// The main Passport object tied to a user
    public struct Passport has key {
        id: UID,
        owner: address,
        name: String,
        profile_picture_blob_id: vector<u8>,
        walrus_epochs: u64,
        reputation_score: u64,
        skills: vector<String>
    }

    /// Verifiable Credential data (Standalone Object)
    public struct VerifiableCredential has key, store {
        id: UID,
        passport_id: ID,
        issuer: address,
        credential_type: String,
        tier: String,
        skill_tags: vector<String>,
        zk_proof: String,
        document_blob_id: vector<u8>,
        walrus_epochs: u64,
        verified_at: u64
    }

    // =========================================================================
    //  Events
    // =========================================================================

    public struct PassportMinted has copy, drop {
        passport_id: ID,
        owner: address,
    }

    public struct CredentialIssued has copy, drop {
        credential_id: ID,
        passport_id: ID,
        issuer: address,
        credential_type: String,
    }

    const EInvalidCredentialForPassport: u64 = 1;

    // =========================================================================
    //  Init
    // =========================================================================

    fun init(otw: REGISTRY, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);

        // Setup Display for Passport
        let passport_keys = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url"),
            string::utf8(b"project_url"),
        ];

        let passport_values = vector[
            string::utf8(b"{name}'s ZK-Work Passport"),
            string::utf8(b"A portable Agentic Identity and Verifiable Credential Passport on Sui."),
            string::utf8(b"https://api.dicebear.com/8.x/glass/svg?seed={id}&backgroundColor=0a0a0a"),
            string::utf8(b"https://zk-work.sui"),
        ];

        let mut passport_display = display::new_with_fields<Passport>(
            &publisher, passport_keys, passport_values, ctx
        );
        display::update_version(&mut passport_display);

        // Setup Display for VerifiableCredential
        let cred_keys = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url"),
            string::utf8(b"project_url"),
            string::utf8(b"creator"),
        ];

        let cred_values = vector[
            string::utf8(b"{tier} {credential_type}"),
            string::utf8(b"Verified via ZK-Work Agent. Skills: {skill_tags}"),
            string::utf8(b"https://api.dicebear.com/8.x/shapes/svg?seed={id}&backgroundColor=121212"),
            string::utf8(b"https://zk-work.sui"),
            string::utf8(b"ZK-Work AI Agent"),
        ];

        let mut cred_display = display::new_with_fields<VerifiableCredential>(
            &publisher, cred_keys, cred_values, ctx
        );
        display::update_version(&mut cred_display);

        // Transfer AdminCap to deployer
        transfer::transfer(AdminCap {
            id: object::new(ctx)
        }, ctx.sender());

        // Transfer Publisher and Displays to deployer
        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(passport_display, ctx.sender());
        transfer::public_transfer(cred_display, ctx.sender());
    }

    // =========================================================================
    //  Admin Functions
    // =========================================================================

    /// Only Admin can mint a new AgentCap and send it to an AI Agent wallet
    public fun mint_agent_cap(_: &AdminCap, agent_address: address, ctx: &mut TxContext) {
        transfer::transfer(AgentCap {
            id: object::new(ctx)
        }, agent_address);
    }

    // =========================================================================
    //  Public Functions
    // =========================================================================

    /// Creates a new Passport for the transaction sender
    public fun create_passport(name: String, profile_picture_blob_id: vector<u8>, walrus_epochs: u64, ctx: &mut TxContext) {
        let sender = ctx.sender();
        let passport = Passport {
            id: object::new(ctx),
            owner: sender,
            name,
            profile_picture_blob_id,
            walrus_epochs,
            reputation_score: 0,
            skills: vector::empty<String>()
        };
        
        event::emit(PassportMinted {
            passport_id: passport.id.to_inner(),
            owner: sender,
        });

        transfer::transfer(passport, sender);
    }

    /// Allows the owner to update the on-chain lifetime record of the passport's profile picture
    /// after paying for more epochs on Walrus.
    public fun extend_passport_lifetime(
        passport: &mut Passport,
        new_epochs: u64,
        _: &mut TxContext
    ) {
        passport.walrus_epochs = new_epochs;
    }

    /// Only authorized agents can issue a credential. 
    /// The credential is a standalone object transferred to the user.
    public fun issue_credential(
        _: &AgentCap,
        passport_id: ID,
        recipient: address,
        credential_type: String,
        tier: String,
        skill_tags: vector<String>,
        zk_proof: String,
        document_blob_id: vector<u8>,
        walrus_epochs: u64,
        verified_at: u64,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        let credential = VerifiableCredential {
            id: object::new(ctx),
            passport_id,
            issuer: sender,
            credential_type,
            tier,
            skill_tags,
            zk_proof,
            document_blob_id,
            walrus_epochs,
            verified_at
        };

        event::emit(CredentialIssued {
            credential_id: credential.id.to_inner(),
            passport_id,
            issuer: sender,
            credential_type,
        });
        
        transfer::public_transfer(credential, recipient);
    }

    /// Allows the owner or agent to update the on-chain lifetime record of the credential document 
    /// after paying for more epochs on Walrus.
    public fun extend_credential_lifetime(
        cred: &mut VerifiableCredential,
        new_epochs: u64,
        _: &mut TxContext
    ) {
        cred.walrus_epochs = new_epochs;
    }

    /// Allows a user to verify a credential they own and merge its skills into their Passport
    public fun verify_and_add_skills(
        passport: &mut Passport,
        credential: &VerifiableCredential,
        _: &mut TxContext
    ) {
        assert!(credential.passport_id == object::id(passport), EInvalidCredentialForPassport);
        
        let mut i = 0;
        let len = credential.skill_tags.length();
        while (i < len) {
            let skill = credential.skill_tags[i];
            if (!passport.skills.contains(&skill)) {
                passport.skills.push_back(skill);
            };
            i = i + 1;
        };
    }
}
