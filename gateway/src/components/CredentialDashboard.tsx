"use client";

import React, { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClientQuery } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID } from '@/lib/constants';
import { Toaster, toast } from 'react-hot-toast';

export default function CredentialDashboard() {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  
  const [analyzing, setAnalyzing] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [minting, setMinting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pendingCredentials, setPendingCredentials] = useState<any>(null);

  // Fetch the user's Passport object
  const { data: ownedObjects, refetch } = useSuiClientQuery('getOwnedObjects', {
    owner: account?.address as string,
    filter: { StructType: `${PACKAGE_ID}::registry::Passport` },
    options: { showContent: true, showDisplay: true }
  }, {
    enabled: !!account,
    refetchInterval: 5000,
  });

  const passport = ownedObjects?.data?.[0];

  // Fetch ALL credentials robustly (handling package upgrades)
  const { data: allObjects, refetch: refetchCredentials } = useSuiClientQuery('getOwnedObjects', {
    owner: account?.address as string,
    options: { showContent: true, showType: true }
  }, {
    enabled: !!account && !!passport,
    refetchInterval: 5000,
  });

  const credentials = {
    data: allObjects?.data?.filter((obj: any) => 
      obj.data?.type?.includes(`${PACKAGE_ID}::registry::VerifiableCredential`)
    ) || []
  };

  const handleCreatePassport = () => {
    if (!account) return;
    
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::registry::create_passport`,
      arguments: [
        tx.pure.string(account.address.slice(0, 6) + " Agent"),
        tx.pure.vector('u8', Array.from(new TextEncoder().encode("https://api.dicebear.com/7.x/bottts/svg?seed=" + account.address))),
        tx.pure.u64(0)
      ]
    });

    signAndExecuteTransaction({ transaction: tx }, {
      onSuccess: () => {
        toast.success("Passport created! Waiting for network sync...");
        refetch();
      },
      onError: (err) => {
        console.error("Failed to create passport", err);
        toast.error("Failed to create passport");
      }
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && passport && account) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileUploaded(true);
      setAnalyzing(true);
      setPendingCredentials(null);
      
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch('/api/agent/parse', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        if (data.success) {
          setPendingCredentials(data.analysis);
        } else {
          throw new Error(data.error);
        }
      } catch (err: any) {
        toast.error("Agent failed to parse CV: " + err.message);
        setFileUploaded(false);
      } finally {
        setAnalyzing(false);
      }
    }
  };

  const handleMint = async () => {
    if (!pendingCredentials || !file || !passport || !account) return;
    setMinting(true);
    
    try {
      const formData = new FormData();
      formData.append('passportId', passport.data?.objectId || '');
      formData.append('recipient', account.address);
      formData.append('file', file);
      formData.append('tier', pendingCredentials.tier || 'Silver');
      formData.append('skills', JSON.stringify(pendingCredentials.matched_skills));
      formData.append('experiences', JSON.stringify(pendingCredentials.experiences));

      const response = await fetch('/api/issue-credential', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        console.log("Agent issued credential. Tx:", data.digest);
        setPendingCredentials(null);
        setTimeout(() => refetchCredentials(), 1000);
        setTimeout(() => refetchCredentials(), 3000);
        setTimeout(() => refetchCredentials(), 6000);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error("Failed to mint credentials: " + err.message);
    } finally {
      setMinting(false);
    }
  };

  if (!account) {
    return (
      <div className="neo-container" style={{ padding: '3rem', textAlign: 'center', border: '4px solid #000', borderRadius: '16px', background: '#fff' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Connect Wallet to View Dashboard</h3>
      </div>
    );
  }

  if (!passport) {
    return (
      <div className="neo-container" style={{ padding: '3rem', textAlign: 'center', border: '4px solid #000', borderRadius: '16px', background: '#fff' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No ZK-Work Passport Found</h3>
        <p style={{ marginBottom: '2rem' }}>You need an identity registry before agents can issue credentials to you.</p>
        <button className="neo-btn neo-btn-blue" onClick={handleCreatePassport} style={{ padding: '0.75rem 2rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
          Create Passport
        </button>
      </div>
    );
  }

  return (
    <div className="neo-container" style={{ padding: '2rem', border: '4px solid #000', borderRadius: '16px', background: '#fff' }}>
      <Toaster position="bottom-right" toastOptions={{ style: { border: '3px solid #000', borderRadius: '8px', fontWeight: 'bold' } }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '4px solid #000' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {(() => {
            const content = passport.data?.content as any;
            const bytes = content?.fields?.profile_picture_blob_id;
            const imageUrl = bytes ? String.fromCharCode(...bytes) : "https://api.dicebear.com/7.x/bottts/svg?seed=fallback";
            return <img src={imageUrl} alt="Avatar" style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid #000' }} />;
          })()}
          <div>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{((passport.data?.display?.data as any)?.name as string) || "Your Passport"}</h3>
            <span style={{ fontSize: '0.9rem', color: '#555' }}>ID: {passport.data?.objectId?.slice(0,8)}...</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>1. Upload Evidence</h3>
        <div style={{ 
          border: '4px dashed #000', 
          padding: '3rem', 
          textAlign: 'center', 
          borderRadius: '12px',
          background: fileUploaded ? 'var(--light-blue)' : '#fafafa',
          transition: 'all 0.3s ease',
          position: 'relative'
        }}>
          {!fileUploaded ? (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Drag & drop your Resume or PDF</p>
              <label className="neo-btn neo-btn-white" style={{ display: 'inline-block', cursor: 'pointer', padding: '0.5rem 1.5rem' }}>
                Browse Files
                <input type="file" style={{ display: 'none' }} onChange={handleUpload} accept=".pdf,.doc,.docx" />
              </label>
            </>
          ) : analyzing ? (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'spin 2s linear infinite' }}>⚙️</div>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Agent is reading document...</p>
              <p style={{ marginTop: '0.5rem' }}>Extracting verifiable skills...</p>
            </>
          ) : pendingCredentials ? (
            <div style={{ textAlign: 'left', background: '#fff', padding: '2rem', borderRadius: '12px', border: '3px solid #000' }}>
              <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--blue)' }}>Agent Analysis Complete</h4>
              <p style={{ marginBottom: '1.5rem' }}>The AI extracted the following verifiable credentials from your Resume:</p>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Skills Found:</strong>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {pendingCredentials.matched_skills?.map((skill: string) => (
                    <span key={skill} style={{ border: '2px solid #000', padding: '0.3rem 0.6rem', borderRadius: '4px', fontWeight: 'bold', background: '#f0f9ff' }}>{skill}</span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Proof of Work (Experiences):</strong>
                <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                  {pendingCredentials.experiences?.map((exp: string) => (
                    <li key={exp} style={{ marginBottom: '0.3rem', fontWeight: '500' }}>{exp}</li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button 
                  onClick={() => { setPendingCredentials(null); setFileUploaded(false); }} 
                  className="neo-btn neo-btn-white"
                  disabled={minting}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleMint} 
                  className="neo-btn neo-btn-blue"
                  disabled={minting}
                >
                  {minting ? "Minting to Blockchain..." : "Approve & Mint Credentials"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                  {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </span>
                <button onClick={() => disconnect()} className="neo-btn neo-btn-white" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  Disconnect
                </button>
              </div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Analysis Complete!</p>
              <p>Credential issued to your wallet.</p>
              <button 
                className="neo-btn neo-btn-white" 
                style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
                onClick={() => setFileUploaded(false)}
              >
                Upload Another
              </button>
            </>
          )}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>2. Verifiable Credentials</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          {credentials?.data?.map((cred) => {
            const fields = (cred.data?.content as any)?.fields;
            
            // Filter out any broken/legacy credentials that don't have valid data
            if (!fields || !fields.credential_type || !fields.zk_proof) {
              return null;
            }

            const isSkillCred = fields?.credential_type === "Skill Credential";
            const isPowCred = fields?.credential_type === "Proof of Work";
            const isSpecificCred = isSkillCred || isPowCred;
            const title = isSpecificCred && fields?.skill_tags?.[0] ? fields.skill_tags[0] : (fields?.credential_type || 'Unknown');
            
            const cardClass = isPowCred ? "nft-card nft-card-pow" : isSkillCred ? "nft-card nft-card-skill" : "nft-card";
            
            const customImage = isSkillCred && fields?.skill_tags?.[0] ? `https://api.dicebear.com/8.x/shapes/svg?seed=${title}&backgroundColor=121212` : undefined;

            return (
              <div key={cred.data?.objectId} className={cardClass}>
                
                {customImage && (
                  <div style={{ marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden', border: '3px solid #000', background: '#000' }}>
                    <img src={customImage} alt={title} style={{ width: '100%', height: '120px', display: 'block', objectFit: 'cover' }} />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div className={isPowCred ? "nft-badge nft-pow-badge" : "nft-badge"}>
                    {isPowCred ? "🏆" : isSkillCred ? "⚡" : "📄"}
                  </div>
                  <span className={isPowCred ? "nft-tag" : ""} style={{ background: isPowCred ? '' : 'var(--blue)', color: isPowCred ? '' : '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {fields?.tier || 'Standard'}
                  </span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.5rem', display: 'block', lineHeight: '1.2' }}>
                    {isPowCred && <span style={{ fontSize: '0.9rem', display: 'block', opacity: 0.8, marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Proof of Work</span>}
                    {title}
                  </span>
                </div>
                
                {!isSpecificCred && (
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>Skills Verified:</span>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      {fields?.skill_tags?.map((skill: string) => (
                        <span key={skill} style={{ border: '2px solid #000', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ background: '#f0f0f0', padding: '0.5rem', borderRadius: '4px', border: '2px solid #000', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                  <strong>ZK-Proof:</strong> {fields?.zk_proof?.slice ? fields.zk_proof.slice(0, 15) : "undefined"}...
                </div>
                
                
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {(() => {
                      const bytes = fields?.document_blob_id;
                      const blobStr = bytes ? String.fromCharCode(...bytes) : "unknown";
                      if (blobStr && blobStr !== "unknown") {
                        return (
                          <a 
                            href={`https://aggregator.walrus-testnet.walrus.space/v1/${blobStr}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="neo-btn neo-btn-white"
                            style={{ display: 'inline-block', padding: '0.3rem 0.8rem', fontSize: '0.8rem', textDecoration: 'none' }}
                          >
                            📄 View Original Document (Walrus)
                          </a>
                        );
                      }
                      return null;
                    })()}
                    
                    <button
                      className="neo-btn neo-btn-blue"
                      style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', fontWeight: 'bold' }}
                      onClick={() => {
                        const tx = new Transaction();
                        tx.moveCall({
                          target: `${PACKAGE_ID}::registry::verify_and_add_skills`,
                          arguments: [
                            tx.object(passport.data?.objectId!),
                            tx.object(cred.data?.objectId!)
                          ]
                        });
                        signAndExecuteTransaction({ transaction: tx }, {
                          onSuccess: () => {
                            toast.success("Skills verified and permanently added to your Passport!");
                            refetch();
                          },
                          onError: (err) => toast.error("Failed to add skills: " + err.message)
                        });
                      }}
                    >
                      🏅 Merge Skills to Passport
                    </button>
                  </div>
              </div>
            )
          })}
          
          {(!credentials?.data || credentials.data.length === 0) && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', border: '4px dashed #ccc', borderRadius: '12px' }}>
              No credentials yet. Upload a document to have the Agent issue one!
            </div>
          )}

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
