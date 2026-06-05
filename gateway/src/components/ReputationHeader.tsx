"use client";

import React, { useState } from 'react';

export default function ReputationHeader() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-panel" style={{ padding: '1rem 2rem', marginBottom: '2rem', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
            A
          </div>
          <div>
            <h4 style={{ margin: 0 }}>Agent Interaction Mode</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Broadcasting ZK Identity to Web3 Agents</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="reputation-badge">Trust Score: 98/100</span>
          <span className="reputation-badge" style={{ borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }}>Sui Native</span>
        </div>
      </div>
      
      {expanded && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ fontSize: '0.875rem', lineHeight: '1.5', color: 'rgba(255,255,255,0.8)' }}>
            <strong>Sent Header:</strong> <br />
            <code>X-Agentic-ID: zkp_0x9a8b7c...</code><br />
            <code>X-Trust-Claims: Github(Verified), SuiFoundation(Builder), Hashi(BTC)</code>
          </p>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>
            This header allows other agents to instantly verify your credentials without revealing underlying PII.
          </p>
        </div>
      )}
    </div>
  );
}
