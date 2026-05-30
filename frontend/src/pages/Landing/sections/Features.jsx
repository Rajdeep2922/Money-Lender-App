import { motion } from 'framer-motion';
import { WalletCards, UsersRound, IndianRupee, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: WalletCards,
    title: 'Loan Management',
    desc: 'Create, manage, and track loan requests from one place. Full lifecycle visibility from request to closure.',
    iconColor: '#22d3ee',
    bgColor: 'rgba(6,182,212,0.15)',
    borderColor: 'rgba(6,182,212,0.2)',
    glowColor: 'rgba(6,182,212,0.18)',
  },
  {
    icon: UsersRound,
    title: 'Customer Tracking',
    desc: 'Keep all customer information organised and accessible. Know your borrowers inside and out.',
    iconColor: '#a78bfa',
    bgColor: 'rgba(139,92,246,0.15)',
    borderColor: 'rgba(139,92,246,0.2)',
    glowColor: 'rgba(139,92,246,0.18)',
  },
  {
    icon: IndianRupee,
    title: 'Payments & Collections',
    desc: 'Track payments, manage dues, and stay on top of collections with smart reminders.',
    iconColor: '#fbbf24',
    bgColor: 'rgba(245,158,11,0.15)',
    borderColor: 'rgba(245,158,11,0.2)',
    glowColor: 'rgba(245,158,11,0.18)',
  },
  {
    icon: BarChart3,
    title: 'Insights & Reports',
    desc: 'Get real-time insights and make better lending decisions backed by data.',
    iconColor: '#60a5fa',
    bgColor: 'rgba(59,130,246,0.15)',
    borderColor: 'rgba(59,130,246,0.2)',
    glowColor: 'rgba(59,130,246,0.18)',
  },
];

const card = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.5 } }),
};

export default function Features() {
  return (
    <section id="features-section" className="section" style={{ background: 'linear-gradient(180deg,#020617 0%,#071129 100%)' }}>
      <div className="container">
        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.875rem', letterSpacing: '-0.02em' }}>
            Everything You Need to <span className="grad-text">Lend Smarter</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: 520, margin: '0 auto' }}>
            Powerful tools to help you manage loans, customers, and repayments efficiently.
          </p>
          <div className="section-divider" />
        </motion.div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.5rem' }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} custom={i} variants={card} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="glass-card"
                style={{ padding: '1.75rem', transition: 'all 0.3s ease', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = f.borderColor; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 0 30px ${f.glowColor}`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Icon container */}
                <div style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: '1rem',
                  background: f.bgColor,
                  border: `1px solid ${f.borderColor}`,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  boxShadow: `0 0 28px ${f.glowColor}`,
                  flexShrink: 0,
                }}>
                  <Icon size={24} color={f.iconColor} strokeWidth={1.75} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.625rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.65 }}>{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
