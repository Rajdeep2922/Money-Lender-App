import { motion } from 'framer-motion';

const reviews = [
  {
    name: 'Rakesh Sharma',
    role: 'Small Business Owner',
    initials: 'RS',
    color: '#06b6d4',
    text: '"Money Lenders has simplified how we manage loans and track repayments. Highly recommended!"',
    stars: 5,
  },
  {
    name: 'Neha Verma',
    role: 'Finance Manager',
    initials: 'NV',
    color: '#10b981',
    text: '"The dashboard gives me complete visibility and helps me make better lending decisions."',
    stars: 5,
  },
  {
    name: 'Arjun Patel',
    role: 'Entrepreneur',
    initials: 'AP',
    color: '#8b5cf6',
    text: '"Quick approvals and transparent process. My go-to platform for all lending needs."',
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="pricing" className="section hide-mobile" style={{ background: '#020617' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.875rem', letterSpacing: '-0.02em' }}>
            Trusted by <span className="grad-text">Lenders Like You</span>
          </h2>
          <div className="section-divider" />
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.5rem' }}>
          {reviews.map((r, i) => (
            <motion.div key={r.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }}
              className="glass-card"
              style={{ padding: '1.75rem', transition: 'all 0.3s ease' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${r.color}40`; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 0 30px ${r.color}18`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Quote mark */}
              <div style={{ fontSize: '2.5rem', color: r.color, opacity: 0.3, lineHeight: 1, marginBottom: '0.5rem', fontFamily: 'Georgia, serif' }}>"</div>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '1.5rem' }}>{r.text}</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg,${r.color}33,${r.color}18)`, border: `2px solid ${r.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: r.color, flexShrink: 0 }}>
                  {r.initials}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9' }}>{r.name}</div>
                  <div style={{ fontSize: '0.775rem', color: '#475569' }}>{r.role}</div>
                </div>
                <div className="stars" style={{ marginLeft: 'auto', fontSize: '0.85rem' }}>
                  {'★'.repeat(r.stars)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
