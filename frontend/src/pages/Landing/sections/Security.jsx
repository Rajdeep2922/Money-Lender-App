import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Server } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Security() {
  return (
    <section id="benefits" className="section" style={{ background: 'linear-gradient(180deg,#020617 0%,#071129 60%,#020617 100%)' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="glass-card security-card"
          style={{ padding: 'clamp(2rem,5vw,3.5rem)', background: 'linear-gradient(135deg,rgba(6,182,212,0.07),rgba(16,185,129,0.05))', borderColor: 'rgba(34,211,238,0.15)', boxShadow: '0 0 60px rgba(6,182,212,0.08)', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flex: 1, minWidth: 280 }}>
            {/* Icon container — larger with stronger glow */}
            <div style={{
              width: '5rem',
              height: '5rem',
              borderRadius: '1.25rem',
              background: 'linear-gradient(135deg,rgba(6,182,212,0.2),rgba(16,185,129,0.12))',
              border: '1px solid rgba(34,211,238,0.25)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 36px rgba(6,182,212,0.28), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}>
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
                {[
                  { icon: Lock,        text: 'Enterprise-grade security' },
                  { icon: ShieldCheck, text: 'Privacy-first architecture' },
                  { icon: Server,      text: 'Reliable infrastructure' },
                ].map(t => {
                  const Icon = t.icon;
                  return (
                    <div key={t.text} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                      <Icon size={14} color="#22d3ee" strokeWidth={1.75} />
                      {t.text}
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
      </div>
    </section>
  );
}
