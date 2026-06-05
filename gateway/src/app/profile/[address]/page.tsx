"use client";

import React, { useEffect, useState } from 'react';
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc';
import { PACKAGE_ID } from '@/lib/constants';
import Link from 'next/link';

export default function PublicProfile({ params }: { params: { address: string } }) {
  const [passport, setPassport] = useState<any>(null);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const client = new SuiJsonRpcClient({ url: getJsonRpcFullnodeUrl('testnet') });
        
        // Fetch Passport
        const passportRes = await client.getOwnedObjects({
          owner: params.address,
          filter: { StructType: `${PACKAGE_ID}::registry::Passport` },
          options: { showContent: true, showDisplay: true }
        });
        
        if (passportRes.data.length > 0) {
          setPassport(passportRes.data[0]);
        }

        // Fetch ALL objects to robustly handle package upgrades
        const credsRes = await client.getOwnedObjects({
          owner: params.address,
          options: { showContent: true, showType: true }
        });
        
        const filteredCreds = credsRes.data.filter((obj: any) => 
          obj.data?.type?.includes(`${PACKAGE_ID}::registry::VerifiableCredential`)
        );
        
        setCredentials(filteredCreds);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.address]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '2rem', fontWeight: 'bold' }}>
        Loading ZK-Work Profile...
      </div>
    );
  }

  if (!passport) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Profile Not Found</h1>
        <p>This user has not minted a ZK-Work Passport yet.</p>
        <Link href="/">
          <button className="neo-btn neo-btn-blue" style={{ marginTop: '2rem', padding: '0.75rem 2rem' }}>
            Go Home
          </button>
        </Link>
      </div>
    );
  }

  const avatar = passport.data?.display?.data?.image_url;
  const name = passport.data?.display?.data?.name;

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 'bold', fontSize: '1.5rem' }}>
            <span style={{ color: 'var(--blue)', fontSize: '1.5rem' }}>🤖</span>
            ZK-Work
          </div>
        </Link>
        <div className="neo-btn" style={{ background: '#eee', padding: '0.5rem 1rem', cursor: 'default', boxShadow: '4px 4px 0px #000' }}>
          Public Profile
        </div>
      </div>

      {/* Profile Card */}
      <div className="neo-container" style={{ padding: '3rem', border: '4px solid #000', borderRadius: '16px', background: 'var(--light-blue)', marginBottom: '4rem', textAlign: 'center' }}>
        <img src={avatar} alt="Avatar" style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #000', marginBottom: '1.5rem', background: '#fff' }} />
        <h1 style={{ fontSize: '3.5rem', margin: 0, lineHeight: 1.1, marginBottom: '0.5rem' }}>{name}</h1>
        <p style={{ fontSize: '1.2rem', color: '#333', fontWeight: 'bold' }}>Wallet: {params.address.slice(0,6)}...{params.address.slice(-4)}</p>
      </div>

      {/* Credentials Section */}
      <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Verified Credentials</h2>
      
      {credentials.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', border: '4px dashed #000', borderRadius: '12px' }}>
          No credentials issued yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {credentials.map((cred) => {
            const fields = (cred.data?.content as any)?.fields;
            
            // Filter out any broken/legacy credentials that don't have valid data
            if (!fields || !fields.credential_type || !fields.zk_proof) {
              return null;
            }

            const isSkillCred = fields?.credential_type === "Skill Credential";
            const isPowCred = fields?.credential_type === "Proof of Work";
            const isSpecificCred = isSkillCred || isPowCred;
            const title = isSpecificCred && fields?.skill_tags?.[0] ? fields.skill_tags[0] : (fields?.credential_type || 'Unknown');
            
            const cardClass = isPowCred ? "neo-card nft-card-pow" : isSkillCred ? "neo-card nft-card-skill" : "neo-card";
            
            const customImage = isSkillCred && fields?.skill_tags?.[0] ? `https://api.dicebear.com/8.x/shapes/svg?seed=${title}&backgroundColor=121212` : undefined;

            return (
              <div key={cred.data?.objectId} className={cardClass} style={{ padding: '2rem', border: '4px solid #000', borderRadius: '12px', background: '#fff' }}>
                
                {customImage && (
                  <div style={{ marginBottom: '1.5rem', borderRadius: '8px', overflow: 'hidden', border: '3px solid #000', background: '#000' }}>
                    <img src={customImage} alt={title} style={{ width: '100%', height: '140px', display: 'block', objectFit: 'cover' }} />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>
                    {isPowCred ? "🏆 " : isSkillCred ? "⚡ " : "📄 "}
                    {title}
                  </span>
                  <span style={{ background: isPowCred ? '#000' : 'var(--blue)', color: '#fff', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {fields?.tier || 'Standard'}
                  </span>
                </div>
                
                {!isSpecificCred && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '1rem', color: '#555', fontWeight: 'bold' }}>Verified Skills:</span>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                      {fields?.skill_tags?.map((skill: string) => (
                        <span key={skill} style={{ border: '2px solid #000', background: '#f9f9f9', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ background: '#f0f0f0', padding: '0.5rem', borderRadius: '4px', border: '2px solid #000', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                  <strong>ZK-Proof:</strong> {fields?.zk_proof?.slice(0, 15)}...
                </div>

                {(() => {
                  const bytes = fields?.document_blob_id;
                  const blobStr = bytes ? String.fromCharCode(...bytes) : "unknown";
                  if (blobStr && blobStr !== "unknown") {
                    return (
                      <div style={{ marginTop: '1rem' }}>
                        <a 
                          href={`https://aggregator.walrus-testnet.walrus.space/v1/${blobStr}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="neo-btn neo-btn-white"
                          style={{ display: 'inline-block', padding: '0.3rem 0.8rem', fontSize: '0.8rem', textDecoration: 'none' }}
                        >
                          📄 View Original Document (Walrus)
                        </a>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                <div style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '8px', border: '2px solid #000', fontSize: '0.85rem', wordBreak: 'break-all', marginTop: '1rem' }}>
                  <strong style={{ display: 'block', marginBottom: '0.5rem' }}>ZK-Proof Hash:</strong> 
                  <span style={{ fontFamily: 'monospace' }}>{fields?.zk_proof}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  );
}
