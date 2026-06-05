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
    const passportId = formData.get('passportId') as string;
    const recipient = formData.get('recipient') as string;
    const file = formData.get('file') as File;
    const tier = formData.get('tier') as string || "Gold";
    const skillsStr = formData.get('skills') as string;
    const expsStr = formData.get('experiences') as string;

    if (!passportId || !recipient || !file) {
      return NextResponse.json({ success: false, error: "Missing required fields or file" });
    }

    const skillsToMint = skillsStr ? JSON.parse(skillsStr) : [];
    const expsToMint = expsStr ? JSON.parse(expsStr) : [];
    
    // Simulate ZK-Proof Hash
    const zk_proof = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');

    // 1. Upload to Walrus Decentralized Storage
    console.log("Uploading original document to Walrus...");
    const buffer = Buffer.from(await file.arrayBuffer());
    const publisherUrl = "https://publisher.walrus-testnet.walrus.space/v1/store?epochs=5";
    
    let document_blob_id = "unknown";
    try {
      const walrusRes = await fetch(publisherUrl, {
        method: "PUT",
        body: buffer,
      });
      if (walrusRes.ok) {
        const walrusData = await walrusRes.json();
        document_blob_id = walrusData.newlyCreated?.blobObject?.blobId || walrusData.alreadyCertified?.blobId || "unknown";
        console.log("Walrus Blob ID:", document_blob_id);
      } else {
        console.error("Walrus upload failed, continuing with 'unknown' blob ID");
      }
    } catch (e) {
      console.error("Walrus network error, continuing with 'unknown' blob ID", e);
    }

    // 2. Setup Sui Transaction
    console.log("Initializing Agent Sui Client...");
    const keypair = Ed25519Keypair.deriveKeypair(AGENT_MNEMONIC);
    const client = new SuiClient({ url: getFullnodeUrl('testnet') });
    
    const tx = new Transaction();
    
    // Loop through each matched skill and mint an individual NFT
    for (const skill of skillsToMint) {
      tx.moveCall({
        target: `${PACKAGE_ID}::registry::issue_credential`,
        arguments: [
          tx.object(AGENT_CAP_ID),
          tx.pure.id(passportId),
          tx.pure.address(recipient),
          tx.pure.string("Skill Credential"),
          tx.pure.string(tier),
          tx.makeMoveVec({
            elements: [tx.pure.string(skill)],
            type: '0x1::string::String'
          }),
          tx.pure.string(zk_proof),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(document_blob_id))),
          tx.pure.u64(5),
          tx.pure.u64(Date.now())
        ]
      });
    }

    // Loop through each experience and mint a Proof of Work NFT
    for (const exp of expsToMint) {
      tx.moveCall({
        target: `${PACKAGE_ID}::registry::issue_credential`,
        arguments: [
          tx.object(AGENT_CAP_ID),
          tx.pure.id(passportId),
          tx.pure.address(recipient),
          tx.pure.string("Proof of Work"),
          tx.pure.string(tier),
          tx.makeMoveVec({
            elements: [tx.pure.string(exp)],
            type: '0x1::string::String'
          }),
          tx.pure.string(zk_proof),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(document_blob_id))),
          tx.pure.u64(5),
          tx.pure.u64(Date.now())
        ]
      });
    }

    // 3. Execute Transaction
    console.log(`Agent batch minting ${skillsToMint.length + expsToMint.length} credentials on-chain...`);
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
