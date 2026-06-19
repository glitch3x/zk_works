import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navigation */}
      <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #000', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem', fontWeight: 'bold', letterSpacing: '-1px' }}>
          <img src="/logo.png" alt="ZK-Work Logo" style={{ width: '48px', height: '48px', border: '3px solid #000', borderRadius: '8px', background: '#fff' }} />
          <div>ZK-<span className="text-gradient">Work</span></div>
        </div>
        <Link href="/dashboard" className="neo-btn neo-btn-blue" style={{ fontSize: '1.1rem' }}>
          Launch App &rarr;
        </Link>
      </nav>

      {/* Hero Section */}
      <section style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem', textAlign: 'center', background: 'var(--bg-color)' }}>
        <div style={{ maxWidth: '900px' }}>
          <h1 style={{ fontSize: '6rem', lineHeight: '1', marginBottom: '2rem', textTransform: 'uppercase' }}>
            Prove Your <br />
            <span style={{ background: 'var(--blue)', color: '#fff', padding: '0 1rem', display: 'inline-block', transform: 'rotate(-2deg)' }}>Skills</span>
            <span style={{ display: 'inline-block', width: '20px' }}></span>
            On-Chain
          </h1>
          <p style={{ fontSize: '1.5rem', color: '#111', marginBottom: '3rem', lineHeight: '1.6', fontWeight: '500', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
            Don't manually fill out forms. Upload your resume or connect your socials, and our AI orchestrator will mint verifiable <span style={{ color: 'var(--blue)', fontWeight: 'bold' }}>Zero-Knowledge Proofs</span> directly to your Sui wallet.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <Link href="/dashboard" className="neo-btn neo-btn-blue" style={{ padding: '1rem 3rem', fontSize: '1.25rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Start Uploading Now
            </Link>
            <a href="#how-it-works" className="neo-btn neo-btn-white" style={{ padding: '1rem 3rem', fontSize: '1.25rem' }}>
              How it Works &darr;
            </a>
          </div>
        </div>
      </section>

      {/* Features / How it works */}
      <section id="how-it-works" style={{ padding: '6rem 2rem', background: '#fff', borderTop: '4px solid #000' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '4rem', marginBottom: '4rem', textAlign: 'center', textTransform: 'uppercase' }}>
            Agentic AI <span style={{ color: 'var(--blue)' }}>+</span> ZK
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
            
            {/* Feature 1 */}
            <div className="neo-container" style={{ padding: '3rem', background: '#fef3c7', position: 'relative' }}>
              <div className="neo-pill" style={{ position: 'absolute', top: '-20px', left: '-20px', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#fff' }}>1</div>
              <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Upload Evidence</h3>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.6', fontWeight: '500' }}>
                Drop your CV, portfolio link, or GitHub profile. No more tedious manual entry. 
              </p>
            </div>

            {/* Feature 2 */}
            <div className="neo-container" style={{ padding: '3rem', background: '#e0e7ff', position: 'relative', transform: 'translateY(2rem)' }}>
              <div className="neo-pill" style={{ position: 'absolute', top: '-20px', left: '-20px', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#fff' }}>2</div>
              <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>AI Parsing</h3>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.6', fontWeight: '500' }}>
                Our backend orchestrator agent uses advanced LLMs to extract, verify, and structure your skills and experiences.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="neo-container" style={{ padding: '3rem', background: '#dcfce7', position: 'relative' }}>
              <div className="neo-pill" style={{ position: 'absolute', top: '-20px', left: '-20px', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#fff' }}>3</div>
              <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>ZK-Proof Issuance</h3>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.6', fontWeight: '500' }}>
                Receive a Verifiable Credential on Sui. Prove your qualifications to employers without revealing underlying personal data.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ padding: '8rem 2rem', background: 'var(--blue)', color: '#fff', textAlign: 'center', borderTop: '4px solid #000' }}>
        <h2 style={{ fontSize: '4rem', marginBottom: '2rem', textTransform: 'uppercase', color: '#000' }}>Ready to own your professional identity?</h2>
        <Link href="/dashboard" className="neo-btn neo-btn-white" style={{ padding: '1.25rem 4rem', fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Create Your Passport
        </Link>
      </section>

      <footer style={{ background: 'var(--blue)', color: '#000', padding: '5rem 2rem 2rem 2rem', borderTop: '4px solid #000', fontWeight: 'bold' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
            {/* Project Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h4 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#000', textTransform: 'uppercase', borderBottom: '3px solid #000', paddingBottom: '0.5rem', display: 'inline-block', width: 'fit-content' }}>Project</h4>
              <Link href="/dashboard" style={{ color: '#000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                Launch App
              </Link>
              <Link href="#how-it-works" style={{ color: '#000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                How It Works
              </Link>
            </div>

            {/* Community Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h4 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#000', textTransform: 'uppercase', borderBottom: '3px solid #000', paddingBottom: '0.5rem', display: 'inline-block', width: 'fit-content' }}>Community</h4>
              <a href="https://github.com/glitch3x/zk_works" target="_blank" rel="noopener noreferrer" style={{ color: '#000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                GitHub
              </a>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderTop: '4px solid #000', paddingTop: '2.5rem', color: '#000', fontSize: '1rem', fontWeight: 'bold' }}>
            <div>
              Built for the Sui ecosystem &middot; GPL-3.0 &middot; &copy; {new Date().getFullYear()} ZK-Work
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#fff', padding: '0.5rem 1rem', border: '3px solid #000', boxShadow: '3px 3px 0px #000' }}>
              Made by glitch3x
            </div>
          </div>

        </div>
      </footer>
    </main>
  );
}
