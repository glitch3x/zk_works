import WalletConnect from "@/components/WalletConnect";
import CredentialDashboard from "@/components/CredentialDashboard";

export default function DashboardPage() {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <a href="/" className="neo-btn neo-btn-white" style={{ padding: '0.5rem 1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          &larr; Back to Home
        </a>
        <div style={{ flex: '1' }} />
      </div>
      
      <WalletConnect />

      <div id="dashboard" style={{ marginTop: '3rem' }}>
        <CredentialDashboard />
      </div>
    </main>
  );
}
