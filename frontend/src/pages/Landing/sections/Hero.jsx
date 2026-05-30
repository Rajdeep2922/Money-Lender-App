import { motion } from 'framer-motion';
import { ArrowUpRight, Search, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };

function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
      style={{ position: 'relative', width: '100%' }}
    >
      {/* Main mock dashboard */}
      <div className="glass-card" style={{ padding: '1.25rem', boxShadow: '0 0 60px rgba(6,182,212,0.12), 0 30px 80px rgba(0,0,0,0.5)' }}>
        {/* Topbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#06b6d4,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>ML</div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>Money Lenders</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem', color: '#64748b' }}>
            {['Dashboard','Customers','Loans','Payments'].map(t => (
              <span key={t} style={{ padding: '0.2rem 0.5rem', borderRadius: 6, background: t === 'Dashboard' ? 'rgba(6,182,212,0.15)' : 'transparent', color: t === 'Dashboard' ? '#22d3ee' : '#64748b' }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Greeting */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.65rem', color: '#22d3ee', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>MONEY LENDERS</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>Good afternoon 👋</div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
          {[
            { label: 'PORTFOLIO', val: '₹0', sub: '0 active loans', color: '#818cf8' },
            { label: 'INTEREST', val: '₹0', sub: 'projected earnings', color: '#f59e0b' },
            { label: 'COLLECTED', val: '₹0', sub: '0% of total lent', color: '#22d3ee' },
            { label: 'CUSTOMERS', val: '0', sub: 'all on track', color: '#34d399' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.625rem', padding: '0.6rem 0.75rem' }}>
              <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.3rem' }}>{s.label}</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: s.color, marginBottom: '0.15rem' }}>{s.val}</div>
              <div style={{ fontSize: '0.6rem', color: '#475569' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.625rem', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.25rem' }}>Cash Flow</div>
            <div style={{ fontSize: '0.6rem', color: '#475569', marginBottom: '0.75rem' }}>Last 6 months</div>
            {/* Fake chart lines */}
            <svg width="100%" height="60" viewBox="0 0 200 60">
              <polyline points="0,50 40,40 80,35 120,42 160,28 200,32" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />
              <polyline points="0,55 40,50 80,48 120,52 160,44 200,48" fill="none" stroke="#34d399" strokeWidth="1.5" strokeDasharray="4 2" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.625rem', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.25rem' }}>Recent Loans</div>
            <div style={{ marginTop: '1rem', textAlign: 'center', color: '#475569', fontSize: '0.65rem' }}>No loans yet</div>
            <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '0.6rem', color: '#22d3ee' }}>Create your first loan →</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge — Quick Approval */}
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="glass-card"
        style={{ position: 'absolute', bottom: '-1.5rem', left: '-1.5rem', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 0 24px rgba(52,211,153,0.2)' }}>
        <CheckCircle2 size={16} color="#34d399" />
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f1f5f9' }}>Loan Approved</div>
          <div style={{ fontSize: '0.6rem', color: '#64748b' }}>₹50,000 · Just now</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section id="features" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '5rem', position: 'relative', overflow: 'hidden' }}>
      {/* Background blobs */}
      <div className="blob blob-cyan" style={{ width: 600, height: 600, top: -100, left: -200, opacity: 0.6 }} />
      <div className="blob blob-emerald" style={{ width: 400, height: 400, bottom: 0, right: -100, opacity: 0.5 }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '4rem', alignItems: 'center' }}>
          {/* Left — text */}
          <motion.div className="hero-text" variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6 }}>
            <div className="badge-pill" style={{ marginBottom: '1.5rem' }}>
              <span>⚡</span> Smart Lending, Simplified
            </div>

            <h1 style={{ fontSize: 'clamp(2rem,5vw,3.4rem)', fontWeight: 800, lineHeight: 1.1, color: '#f1f5f9', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
              Smart Lending for{' '}
              <span className="grad-text">Growing Businesses</span>
            </h1>

            <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 480 }}>
              An all-in-one platform to manage loan requests, track customers, handle collections, repayments, invoices, and analytics — all from one place.
            </p>

            <div className="hero-cta" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', marginBottom: '2rem' }}>
              <Link to="/login" className="btn-glow">
                Request a Loan <ArrowUpRight size={16} />
              </Link>
              <Link to="/login" className="btn-ghost">
                Check My Request <Search size={16} />
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="hero-trust" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
              {['Quick Approvals', 'Transparent Process', 'Secure & Reliable'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#64748b' }}>
                  <CheckCircle2 size={14} color="#34d399" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — dashboard preview (hidden on mobile via CSS) */}
          <div className="hero-dashboard">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
