import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section id="contact" className="section" style={{ background: 'linear-gradient(180deg,#020617 0%,#071129 100%)', position: 'relative', overflow: 'hidden' }}>
      <div className="blob blob-cyan" style={{ width: 500, height: 500, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.4 }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
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
            <Link to="/register" className="btn-glow" style={{ padding: '0.9rem 2.25rem', fontSize: '1rem' }}>
              Get Started →
            </Link>
            <Link to="/login" className="btn-ghost" style={{ padding: '0.9rem 2.25rem', fontSize: '1rem' }}>
              Contact Sales
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
