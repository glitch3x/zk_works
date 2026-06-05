"use client";

import React from 'react';
import { ConnectModal, useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';

export default function WalletConnect() {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div className="neo-pill flex-between" style={{ padding: '1rem 2rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 'bold', fontSize: '1.5rem' }}>
        <img src="/logo.png" alt="ZK-Work Logo" style={{ width: '36px', height: '36px', border: '2px solid #000', borderRadius: '6px', background: '#fff' }} />
        ZK-Work
      </div>

      <div>
        {currentAccount ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="neo-btn" style={{ padding: '0.5rem 1rem', background: '#e0e0e0', cursor: 'default', transform: 'none', boxShadow: '4px 4px 0px #000' }}>
              {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
            </div>
            <button className="neo-btn neo-btn-white" onClick={handleDisconnect} style={{ padding: '0.5rem 1rem' }}>
              Disconnect
            </button>
          </div>
        ) : (
          <ConnectModal
            trigger={
              <button className="neo-btn neo-btn-blue" style={{ padding: '0.5rem 1.5rem' }}>
                Connect Wallet
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}
