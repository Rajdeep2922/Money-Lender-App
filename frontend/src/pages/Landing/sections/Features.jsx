import { motion } from 'framer-motion';
import { WalletCards, UsersRound, IndianRupee, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: WalletCards,
    title: 'Loan Management',
    desc: 'Create, manage, and track loan requests from one place. Full lifecycle visibility from request to closure.',
    mobileDesc: 'Create, manage and track loan requests from one place.',
    iconColor: '#22d3ee',
    bgColor: 'rgba(6,182,212,0.12)',
    borderColor: 'rgba(6,182,212,0.2)',
    glowColor: 'rgba(6,182,212,0.18)',
    accentBg: 'rgba(6,182,212,0.05)',
    preview: [
      { label: 'Loan #001', name: 'Rakesh Sharma', amt: '₹8,000', status: 'Active', pct: 75 },
      { label: 'Loan #002', name: 'Priya Patel', amt: '₹5,500', status: 'Active', pct: 50 },
      { label: 'Loan #003', name: 'Amit Kumar', amt: '₹11,400', status: 'Active', pct: 88 },
    ],
  },
  {
    icon: UsersRound,
    title: 'Customer Tracking',
    desc: 'Keep all customer information organised and accessible. Know your borrowers inside and out.',
    mobileDesc: 'Organize borrower information and repayment history.',
    iconColor: '#34d399',
    bgColor: 'rgba(52,211,153,0.12)',
    borderColor: 'rgba(52,211,153,0.2)',
    glowColor: 'rgba(52,211,153,0.18)',
    accentBg: 'rgba(52,211,153,0.05)',
    preview: [
      { name: 'Rakesh Sharma', role: 'Borrower', status: 'Active' },
      { name: 'Priya Patel', role: 'Borrower', status: 'Active' },
      { name: 'Amit Kumar', role: 'Borrower', status: 'Active' },
    ],
  },
  {
    icon: IndianRupee,
    title: 'Payments & Collections',
    desc: 'Track payments, manage dues, and stay on top of collections with smart reminders.',
    mobileDesc: 'Monitor repayments and collections in real time.',
    iconColor: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.12)',
    borderColor: 'rgba(245,158,11,0.2)',
    glowColor: 'rgba(245,158,11,0.18)',
    accentBg: 'rgba(245,158,11,0.05)',
    stats: [
      { label: 'Today Collected', val: '₹4,900', delta: '+12.6%' },
      { label: 'This Month', val: '₹18,400', delta: '+25.8%' },
      { label: 'Outstanding', val: '₹6,500', delta: '-8.2%' },
    ],
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    desc: 'Get real-time insights and make better lending decisions backed by data.',
    mobileDesc: 'Track business growth, collection performance and lending insights.',
    iconColor: '#60a5fa',
    bgColor: 'rgba(59,130,246,0.12)',
    borderColor: 'rgba(59,130,246,0.2)',
    glowColor: 'rgba(59,130,246,0.18)',
    accentBg: 'rgba(59,130,246,0.05)',
    bars: [65, 42, 88, 55, 73, 91],
  },
];

const card = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.5 } }),
};

/* ── Mobile feature card preview area ─────────────── */
function MobilePreview({ feature }) {
  const f = feature;

  if (f.preview && f.title === 'Loan Management') {
    return (
      <div style={{ background: 'rgba(10,22,40,0.8)', border: `1px solid ${f.borderColor}`, borderRadius: '0.875rem', padding: '0.875rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, marginBottom: '0.625rem' }}>ACTIVE LOANS</div>
        {f.preview.map(l => (
          <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: f.bgColor, border: `1px solid ${f.borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: f.iconColor, flexShrink: 0 }}>{l.name[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#e2e8f0' }}>{l.name}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: f.iconColor }}>{l.amt}</span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${l.pct}%`, background: `linear-gradient(90deg,${f.iconColor},#10b981)`, borderRadius: 2 }} />
              </div>
            </div>
            <div style={{ fontSize: '0.55rem', color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 4, padding: '0.15rem 0.4rem', flexShrink: 0 }}>{l.status}</div>
          </div>
        ))}
      </div>
    );
  }

  if (f.preview && f.title === 'Customer Tracking') {
    return (
      <div style={{ background: 'rgba(10,22,40,0.8)', border: `1px solid ${f.borderColor}`, borderRadius: '0.875rem', padding: '0.875rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, marginBottom: '0.625rem' }}>CUSTOMERS</div>
        {f.preview.map(c => (
          <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: f.bgColor, border: `1px solid ${f.borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: f.iconColor, flexShrink: 0 }}>{c.name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#e2e8f0' }}>{c.name}</div>
              <div style={{ fontSize: '0.6rem', color: '#64748b' }}>{c.role}</div>
            </div>
            <div style={{ fontSize: '0.55rem', color: f.iconColor, background: f.bgColor, border: `1px solid ${f.borderColor}`, borderRadius: 4, padding: '0.15rem 0.5rem' }}>{c.status}</div>
          </div>
        ))}
      </div>
    );
  }

  if (f.stats) {
    return (
      <div style={{ background: 'rgba(10,22,40,0.8)', border: `1px solid ${f.borderColor}`, borderRadius: '0.875rem', padding: '0.875rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, marginBottom: '0.625rem' }}>COLLECTIONS OVERVIEW</div>
        {f.stats.map(s => (
          <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{s.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f1f5f9' }}>{s.val}</span>
              <span style={{ fontSize: '0.6rem', color: s.delta.startsWith('+') ? '#34d399' : '#f87171', background: s.delta.startsWith('+') ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', borderRadius: 4, padding: '0.1rem 0.4rem' }}>{s.delta}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (f.bars) {
    const max = Math.max(...f.bars);
    return (
      <div style={{ background: 'rgba(10,22,40,0.8)', border: `1px solid ${f.borderColor}`, borderRadius: '0.875rem', padding: '0.875rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, marginBottom: '0.75rem' }}>MONTHLY PERFORMANCE</div>
        <div style={{ display: 'flex', align: 'flex-end', gap: '0.375rem', height: 48, alignItems: 'flex-end' }}>
          {f.bars.map((v, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '100%', height: `${(v / max) * 40}px`, background: `linear-gradient(180deg,${f.iconColor},${f.iconColor}88)`, borderRadius: '3px 3px 0 0', minHeight: 4 }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem' }}>
          {['J', 'F', 'M', 'A', 'M', 'J'].map(m => (
            <span key={m} style={{ fontSize: '0.5rem', color: '#475569', flex: 1, textAlign: 'center' }}>{m}</span>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export default function Features() {
  return (
    <section id="features-section" className="section" style={{ background: 'linear-gradient(180deg,#020617 0%,#071129 100%)' }}>
      <div className="container">
        {/* ── SHARED HEADING ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.875rem', letterSpacing: '-0.02em' }}>
            Everything You Need to <span className="grad-text">Lend Smarter</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: 520, margin: '0 auto' }}>
            Powerful tools to help you manage loans, customers, and repayments efficiently.
          </p>
          <div className="section-divider" />
        </motion.div>

        {/* ── DESKTOP: original small cards ── */}
        <div className="hide-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.5rem' }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} custom={i} variants={card} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="glass-card"
                style={{ padding: '1.75rem', transition: 'border-color 0.3s, transform 0.3s, box-shadow 0.3s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = f.borderColor; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 0 30px ${f.glowColor}`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: f.bgColor, border: `1px solid ${f.borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', boxShadow: `0 0 28px ${f.glowColor}` }}>
                  <Icon size={24} color={f.iconColor} strokeWidth={1.75} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.625rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.65 }}>{f.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* ── MOBILE: large showcase cards ── */}
        <div className="show-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                style={{
                  background: '#0d1c2e',
                  border: `1px solid ${f.borderColor}`,
                  borderRadius: '1.25rem',
                  padding: '1.25rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Subtle corner accent */}
                <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: f.bgColor, opacity: 0.4, pointerEvents: 'none' }} />

                {/* Icon + title row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.625rem', position: 'relative' }}>
                  <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.875rem', background: f.bgColor, border: `1px solid ${f.borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 20px ${f.glowColor}` }}>
                    <Icon size={20} color={f.iconColor} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{f.title}</h3>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.2rem 0 0', lineHeight: 1.5 }}>{f.mobileDesc}</p>
                  </div>
                </div>

                {/* Dashboard mini-preview */}
                <MobilePreview feature={f} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
