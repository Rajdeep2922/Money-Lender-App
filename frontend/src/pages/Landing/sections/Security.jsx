import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Server } from 'lucide-react';
import { Link } from 'react-router-dom';

const securityFeatures = [
  { icon: Lock, text: 'Enterprise-grade security' },
  { icon: ShieldCheck, text: 'Privacy-first architecture' },
  { icon: Server, text: 'Reliable infrastructure' },
];

export default function Security() {
  return (
    <section id="benefits" className="section" style={{ background: 'linear-gradient(180deg,#020617 0%,#071129 60%,#020617 100%)' }}>
      <div className="container">

        {/* ── DESKTOP: horizontal card (unchanged) ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }}
          className="glass-card hide-mobile security-card"
          style={{ padding: 'clamp(2rem,5vw,3.5rem)', background: 'linear-gradient(135deg,rgba(6,182,212,0.07),rgba(16,185,129,0.05))', borderColor: 'rgba(34,211,238,0.15)', boxShadow: '0 0 60px rgba(6,182,212,0.08)', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flex: 1, minWidth: 280 }}>
            <div style={{ width: '5rem', height: '5rem', borderRadius: '1.25rem', background: 'rgba(6,182,212,0.18)', border: '1px solid rgba(34,211,238,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 36px rgba(6,182,212,0.28)' }}>
              <ShieldCheck size={34} color="#22d3ee" strokeWidth={1.6} />
            </div>
            <div>
              <h2 style={{ fontSize: 'clamp(1.3rem,3vw,2rem)', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>
                Secure. Reliable. <span className="grad-text">Built for You.</span>
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                Your data is safe with enterprise-grade security and a privacy-first architecture.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {securityFeatures.map(t => {
                  const Icon = t.icon;
                  return (
                    <div key={t.text} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                      <Icon size={14} color="#22d3ee" strokeWidth={1.75} />{t.text}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <Link to="/register" className="btn-glow" style={{ flexShrink: 0 }}>
            Get Started Now →
          </Link>
        </motion.div>

        {/* ── MOBILE: premium centered security card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.55 }}
          className="show-mobile"
          style={{
            background: 'linear-gradient(135deg,rgba(6,182,212,0.08),rgba(16,185,129,0.04))',
            border: '1px solid rgba(34,211,238,0.18)',
            borderRadius: '1.5rem',
            padding: '2rem 1.25rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background glow */}
          <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 200, height: 200, borderRadius: '50%', background: 'rgba(6,182,212,0.06)', pointerEvents: 'none' }} />

          {/* Large shield icon */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ width: '5rem', height: '5rem', borderRadius: '1.5rem', background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(34,211,238,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 40px rgba(6,182,212,0.25), 0 0 80px rgba(6,182,212,0.08)' }}>
              <ShieldCheck size={40} color="#22d3ee" strokeWidth={1.5} />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: 9999, padding: '0.25rem 0.75rem', fontSize: '0.65rem', fontWeight: 700, color: '#22d3ee', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              🔐 Bank-Grade Protection
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.75rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Secure. Reliable.<br /><span className="grad-text">Built for You.</span>
            </h2>

            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.75, marginBottom: '1.75rem', maxWidth: 300, margin: '0 auto 1.75rem' }}>
              Your data is protected with enterprise-grade security and a privacy-first architecture designed for financial platforms.
            </p>

            {/* Feature pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.75rem' }}>
              {securityFeatures.map(t => {
                const Icon = t.icon;
                return (
                  <div key={t.text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '0.625rem', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color="#22d3ee" strokeWidth={1.75} />
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>{t.text}</span>
                  </div>
                );
              })}
            </div>

            <Link to="/register" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'linear-gradient(135deg,#06b6d4,#10b981)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', borderRadius: '0.875rem', padding: '0.875rem', textDecoration: 'none', boxShadow: '0 0 28px rgba(6,182,212,0.4)', border: 'none', width: '100%' }}>
              Get Started Now →
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
