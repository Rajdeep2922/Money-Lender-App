import { motion } from 'framer-motion';
import { ArrowUpRight, Search, CheckCircle2, Activity, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };

/* ── Mobile dashboard preview ─────────────────────── */
function MobileDashboard() {
  return (
    <div style={{
      background: '#0f172a',
      border: '1px solid rgba(34,211,238,0.18)',
      borderRadius: '1.25rem',
      overflow: 'hidden',
      boxShadow: '0 0 48px rgba(6,182,212,0.14), 0 24px 64px rgba(0,0,0,0.6)',
    }}>
      {/* App topbar */}
      <div style={{ background: '#0a1628', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg,#06b6d4,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff' }}>ML</div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0' }}>Money Lenders</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.18)', borderRadius: 999, padding: '0.2rem 0.6rem' }}>
          <Activity size={10} color="#22d3ee" strokeWidth={2} />
          <span style={{ fontSize: '0.6rem', color: '#22d3ee', fontWeight: 600, letterSpacing: '0.04em' }}>Live</span>
        </div>
      </div>

      <div style={{ padding: '1rem' }}>
        {/* Greeting */}
        <div style={{ marginBottom: '0.875rem' }}>
          <div style={{ fontSize: '0.6rem', color: '#475569', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>PORTFOLIO OVERVIEW</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>Welcome back, Rajdeep</div>
          <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '0.15rem' }}>Managing ₹24,900 across 3 active loans</div>
        </div>

        {/* 4 stat tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.875rem' }}>
          {[
            { label: 'PORTFOLIO', val: '₹24,900', sub: '3 active loans', color: '#22d3ee' },
            { label: 'INTEREST', val: '₹2,100', sub: 'projected', color: '#f59e0b' },
            { label: 'COLLECTED', val: '₹18,400', sub: '73% of total', color: '#34d399' },
            { label: 'CUSTOMERS', val: '5', sub: 'all on track', color: '#a78bfa' },
          ].map(s => (
            <div key={s.label} style={{ background: '#162032', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '0.625rem 0.75rem' }}>
              <div style={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.25rem' }}>{s.label}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: '0.55rem', color: '#475569', marginTop: '0.15rem' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Cash flow chart */}
        <div style={{ background: '#162032', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#e2e8f0' }}>Cash Flow</div>
              <div style={{ fontSize: '0.55rem', color: '#475569' }}>Last 6 months</div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ width: 8, height: 2, background: '#22d3ee', borderRadius: 1 }} />
                <span style={{ fontSize: '0.5rem', color: '#64748b' }}>Lent</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <svg width="10" height="2" viewBox="0 0 10 2"><line x1="0" y1="1" x2="10" y2="1" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 2" strokeLinecap="round" /></svg>
                <span style={{ fontSize: '0.5rem', color: '#64748b' }}>Collected</span>
              </div>
            </div>
          </div>
          <svg width="100%" height="52" viewBox="0 0 260 52" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,42 L52,34 L104,28 L156,36 L208,18 L260,22 L260,52 L0,52 Z" fill="url(#chartGrad)" />
            <polyline points="0,42 52,34 104,28 156,36 208,18 260,22" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="0,46 52,42 104,40 156,44 208,36 260,38" fill="none" stroke="#34d399" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" />
            {[0, 52, 104, 156, 208, 260].map((x, i) => (
              <circle key={i} cx={x} cy={[42, 34, 28, 36, 18, 22][i]} r="2.5" fill="#22d3ee" />
            ))}
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => (
              <span key={m} style={{ fontSize: '0.5rem', color: '#475569' }}>{m}</span>
            ))}
          </div>
        </div>

        {/* Recent loans */}
        <div style={{ background: '#162032', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '0.75rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.625rem' }}>Recent Loans</div>
          {[
            { name: 'Rakesh Sharma', amt: '₹8,000', status: 'Active', pct: 75 },
            { name: 'Priya Patel', amt: '₹5,500', status: 'Active', pct: 50 },
            { name: 'Amit Kumar', amt: '₹11,400', status: 'Active', pct: 88 },
          ].map(l => (
            <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#06b6d4,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {l.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.name}</div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 2 }}>
                  <div style={{ height: '100%', width: `${l.pct}%`, background: 'linear-gradient(90deg,#06b6d4,#10b981)', borderRadius: 2 }} />
                </div>
              </div>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#22d3ee', flexShrink: 0 }}>{l.amt}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Desktop dashboard preview (unchanged) ────────── */
function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
      style={{ position: 'relative', width: '100%' }}
    >
      <div className="glass-card" style={{ padding: '1.25rem', boxShadow: '0 0 60px rgba(6,182,212,0.12), 0 30px 80px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#06b6d4,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>ML</div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>Money Lenders</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem', color: '#64748b' }}>
            {['Dashboard', 'Customers', 'Loans', 'Payments'].map(t => (
              <span key={t} style={{ padding: '0.2rem 0.5rem', borderRadius: 6, background: t === 'Dashboard' ? 'rgba(6,182,212,0.15)' : 'transparent', color: t === 'Dashboard' ? '#22d3ee' : '#64748b' }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.6rem', color: '#475569', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>PORTFOLIO OVERVIEW</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>Welcome back, Rajdeep</div>
          <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: '0.2rem' }}>Portfolio Overview · All systems normal</div>
        </div>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.625rem', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.25rem' }}>Cash Flow</div>
            <div style={{ fontSize: '0.6rem', color: '#475569', marginBottom: '0.75rem' }}>Last 6 months</div>
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
      <div className="blob blob-cyan" style={{ width: 600, height: 600, top: -100, left: -200, opacity: 0.6 }} />
      <div className="blob blob-emerald" style={{ width: 400, height: 400, bottom: 0, right: -100, opacity: 0.5 }} />

      {/* ── DESKTOP LAYOUT (unchanged) ── */}
      <div className="container hide-mobile" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '4rem', alignItems: 'center' }}>
          <motion.div className="hero-text" variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6 }}>
            <div className="badge-pill" style={{ marginBottom: '1.5rem' }}>
              <Zap size={12} strokeWidth={2} /> Smart Lending, Simplified
            </div>
            <h1 style={{ fontSize: 'clamp(2rem,5vw,3.4rem)', fontWeight: 800, lineHeight: 1.1, color: '#f1f5f9', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
              Smart Lending for{' '}
              <span className="grad-text">Growing Businesses</span>
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 480 }}>
              An all-in-one platform to manage loan requests, track customers, handle collections, repayments, invoices, and analytics — all from one place.
            </p>
            <div className="hero-cta" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', marginBottom: '2rem' }}>
              <Link to="/login" className="btn-glow">Request a Loan <ArrowUpRight size={16} /></Link>
              <Link to="/login" className="btn-ghost">Check My Request <Search size={16} /></Link>
            </div>
            <div className="hero-trust" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
              {['Quick Approvals', 'Transparent Process', 'Secure & Reliable'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#64748b' }}>
                  <CheckCircle2 size={14} color="#34d399" /><span>{t}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <div className="hero-dashboard"><DashboardPreview /></div>
        </div>
      </div>

      {/* ── MOBILE LAYOUT (product-first) ── */}
      <div className="show-mobile" style={{ position: 'relative', zIndex: 1, width: '100%', padding: '0 1rem 2rem' }}>
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.55 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.22)', color: '#22d3ee', borderRadius: 9999, padding: '0.3rem 0.875rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
            <Zap size={11} strokeWidth={2} /> Smart Lending, Simplified
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(1.9rem,8vw,2.6rem)', fontWeight: 800, lineHeight: 1.1, color: '#f1f5f9', marginBottom: '0.875rem', letterSpacing: '-0.025em' }}>
            Manage Loans{' '}
            <span className="grad-text">Like a Pro</span>
          </h1>

          {/* Subtext */}
          <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Track loans, customers, collections, repayments, invoices and business growth from one powerful platform.
          </p>

          {/* Dashboard card */}
          <div style={{ marginBottom: '1.5rem' }}>
            <MobileDashboard />
          </div>

          {/* Trust pills */}
          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {['Quick Approvals', 'Secure & Reliable', 'Real-Time Tracking'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 9999, padding: '0.3rem 0.7rem', fontSize: '0.7rem', color: '#64748b' }}>
                <CheckCircle2 size={11} color="#34d399" /><span>{t}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <Link to="/register" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'linear-gradient(135deg,#06b6d4,#10b981)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', borderRadius: '0.875rem', padding: '0.875rem', textDecoration: 'none', boxShadow: '0 0 28px rgba(6,182,212,0.4), 0 4px 16px rgba(0,0,0,0.3)', border: 'none' }}>
              Get Started <ArrowUpRight size={16} />
            </Link>
            <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem', borderRadius: '0.875rem', padding: '0.875rem', textDecoration: 'none' }}>
              <Search size={15} /> Check My Request
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
