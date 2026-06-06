import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, ArrowUpRight, MessageSquare } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section id="contact" className="section" style={{ background: 'linear-gradient(180deg,#020617 0%,#071129 100%)', position: 'relative', overflow: 'hidden' }}>
      <div className="blob blob-cyan" style={{ width: 500, height: 500, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.4 }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── DESKTOP: unchanged centered layout ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="hide-mobile"
          style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
          <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: 'linear-gradient(135deg,#06b6d4,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 30px rgba(6,182,212,0.4)' }}>
            <Zap size={22} color="#fff" fill="#fff" />
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem,5vw,3rem)', fontWeight: 800, color: '#f1f5f9', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Ready to Grow Your <span className="grad-text">Lending Business?</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Join thousands of lenders who trust Money Lenders to manage their portfolio efficiently and professionally.
          </p>
          <div className="cta-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/register" className="btn-glow" style={{ padding: '0.9rem 2.25rem', fontSize: '1rem' }}>Get Started →</Link>
            <Link to="/login" className="btn-ghost" style={{ padding: '0.9rem 2.25rem', fontSize: '1rem' }}>Contact Sales</Link>
          </div>
        </motion.div>

        {/* ── MOBILE: premium closing card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.55 }}
          className="show-mobile"
          style={{
            background: 'linear-gradient(135deg,rgba(6,182,212,0.09),rgba(16,185,129,0.05))',
            border: '1px solid rgba(34,211,238,0.2)',
            borderRadius: '1.5rem',
            padding: '2rem 1.25rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Glow top */}
          <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 280, height: 160, borderRadius: '50%', background: 'rgba(6,182,212,0.08)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Icon */}
            <div style={{ width: '3.75rem', height: '3.75rem', borderRadius: '1.125rem', background: 'linear-gradient(135deg,#06b6d4,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 0 32px rgba(6,182,212,0.45), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
              <Zap size={26} color="#fff" fill="#fff" />
            </div>

            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.75rem', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
              Ready to Grow Your{' '}
              <span className="grad-text">Lending Business?</span>
            </h2>

            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.75, marginBottom: '1.75rem' }}>
              Join lenders who use Money Lenders to manage customers, loans and collections professionally.
            </p>

            {/* Social proof strip */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.75rem' }}>
              {[
                { val: '100%', label: 'Uptime' },
                { val: '∞', label: 'Records' },
                { val: '24/7', label: 'Access' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#22d3ee' }}>{s.val}</div>
                  <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: '0.1rem' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <Link to="/register" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'linear-gradient(135deg,#06b6d4,#10b981)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', borderRadius: '0.875rem', padding: '0.875rem', textDecoration: 'none', boxShadow: '0 0 28px rgba(6,182,212,0.4)' }}>
                Get Started <ArrowUpRight size={16} />
              </Link>
              <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem', borderRadius: '0.875rem', padding: '0.875rem', textDecoration: 'none' }}>
                <MessageSquare size={15} /> Contact Us
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
