import { motion } from 'framer-motion';
import { UserPlus, FilePlus2, TrendingUp, Rocket } from 'lucide-react';

const steps = [
  { icon: UserPlus,   num: 1, title: 'Create Account',    desc: 'Sign up in minutes and set up your lending account with full verification.' },
  { icon: FilePlus2,  num: 2, title: 'Add Loan Requests', desc: 'Add new loan requests and manage borrower details with ease.' },
  { icon: TrendingUp, num: 3, title: 'Track & Manage',    desc: 'Monitor repayments, collections, and loan performance in real time.' },
  { icon: Rocket,     num: 4, title: 'Grow Your Business',desc: 'Make data-driven decisions and scale your lending confidently.' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section" style={{ background: '#020617' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.875rem', letterSpacing: '-0.02em' }}>
            How It <span className="grad-text">Works</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>Simple steps to get started with Money Lenders</p>
          <div className="section-divider" />
        </motion.div>

        {/* Desktop horizontal timeline */}
        <div className="hide-mobile" style={{ position: 'relative' }}>
          {/* Connector line */}
          <div style={{ position: 'absolute', top: '2.75rem', left: '12%', right: '12%', height: 2, background: 'linear-gradient(90deg,#22d3ee,#34d399)', opacity: 0.25, zIndex: 0 }} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.num} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  {/* Icon circle */}
                  <div style={{
                    width: '5.5rem',
                    height: '5.5rem',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg,rgba(6,182,212,0.18),rgba(16,185,129,0.12))',
                    border: '1.5px solid rgba(34,211,238,0.3)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#22d3ee',
                    marginBottom: '1.25rem',
                    position: 'relative',
                    boxShadow: '0 0 28px rgba(6,182,212,0.18), inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}>
                    <Icon size={32} strokeWidth={1.6} />
                    {/* Step number badge */}
                    <div style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#06b6d4,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff', boxShadow: '0 0 10px rgba(6,182,212,0.4)' }}>
                      {s.num}
                    </div>
                  </div>
                  <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.5rem' }}>{s.title}</h3>
                  <p style={{ fontSize: '0.825rem', color: '#64748b', lineHeight: 1.6 }}>{s.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile vertical timeline */}
        <div className="show-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '0', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '2.5rem', top: 0, bottom: 0, width: 2, background: 'linear-gradient(180deg,#22d3ee,#34d399)', opacity: 0.2 }} />
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.num} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5 }}
                style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', paddingBottom: '2rem', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: '5rem',
                  height: '5rem',
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: 'linear-gradient(135deg,rgba(6,182,212,0.18),rgba(16,185,129,0.12))',
                  border: '1.5px solid rgba(34,211,238,0.3)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#22d3ee',
                  boxShadow: '0 0 24px rgba(6,182,212,0.18)',
                }}>
                  <Icon size={28} strokeWidth={1.6} />
                </div>
                <div style={{ paddingTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.65rem', color: '#22d3ee', fontWeight: 700, marginBottom: '0.25rem' }}>STEP {s.num}</div>
                  <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.375rem' }}>{s.title}</h3>
                  <p style={{ fontSize: '0.825rem', color: '#64748b', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
