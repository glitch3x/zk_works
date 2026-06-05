"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { useState } from 'react';

const tatumApiKey = process.env.NEXT_PUBLIC_TATUM_API_KEY;
const testnetUrl = tatumApiKey 
  ? `https://${tatumApiKey}.sui-testnet.tatum.io/` 
  : 'https://fullnode.testnet.sui.io:443';

const networks = {
  mainnet: { url: 'https://fullnode.mainnet.sui.io:443', network: 'mainnet' as const },
  testnet: { url: 'https://fullnode.testnet.sui.io:443', network: 'testnet' as const },
  devnet: { url: 'https://fullnode.devnet.sui.io:443', network: 'devnet' as const },
};

export default function Providers({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient instance per request
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
