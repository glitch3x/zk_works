import { NextRequest, NextResponse } from 'next/server';
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiJsonRpcClient as SuiClient, getJsonRpcFullnodeUrl as getFullnodeUrl } from '@mysten/sui/jsonRpc';
import { PACKAGE_ID, AGENT_CAP_ID } from '@/lib/constants';

// The Backend Agent's Mnemonic
const AGENT_MNEMONIC = process.env.AGENT_MNEMONIC || "park pet reopen razor alter observe dragon alpha blur screen dose dose";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const recipient = formData.get('recipient') as string;
    const name = formData.get('name') as string || "ZK-Work Passport";
    const file = formData.get('file') as File | null;

    if (!recipient) {
      return NextResponse.json({ success: false, error: "Missing recipient address" });
    }

    let document_blob_id = "unknown";

    // 1. Upload Profile Picture to Walrus if provided
    if (file) {
      console.log("Uploading Profile Picture to Walrus...");
      const buffer = Buffer.from(await file.arrayBuffer());
      const publisherUrl = "https://publisher.walrus-testnet.walrus.space/v1/store?epochs=5";
      
      try {
        const walrusRes = await fetch(publisherUrl, {
          method: "PUT",
          body: buffer,
        });
        if (walrusRes.ok) {
          const walrusData = await walrusRes.json();
          document_blob_id = walrusData.newlyCreated?.blobObject?.blobId || walrusData.alreadyCertified?.blobId || "unknown";
          console.log("Walrus PFP Blob ID:", document_blob_id);
        } else {
          console.error("Walrus upload failed, continuing with 'unknown' blob ID");
        }
      } catch (e) {
        console.error("Walrus network error, continuing with 'unknown' blob ID", e);
      }
    }

    // 2. Setup Sui Transaction
    console.log("Initializing Agent Sui Client for Gasless Onboarding...");
    const keypair = Ed25519Keypair.deriveKeypair(AGENT_MNEMONIC);
    const client = new SuiClient({ url: getFullnodeUrl('testnet') } as any);
    
    const tx = new Transaction();
    
    // Call the newly created agent_create_passport function
    tx.moveCall({
      target: `${PACKAGE_ID}::registry::agent_create_passport`,
      arguments: [
        tx.object(AGENT_CAP_ID),
        tx.pure.string(name),
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(document_blob_id))),
        tx.pure.u64(5),
        tx.pure.address(recipient)
      ]
    });

    // 3. Execute Transaction (Agent pays gas)
    console.log(`Agent minting Passport for ${recipient}...`);
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: { showEffects: true }
    });

    if (result.effects?.status.status !== "success") {
      throw new Error(`Sui transaction failed: ${result.effects?.status.error}`);
    }
    
    return NextResponse.json({ success: true, digest: result.digest });

  } catch (error: any) {
    console.error("Agent Issuance Error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
