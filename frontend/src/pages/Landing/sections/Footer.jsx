import { useState } from 'react';
import { Zap, Twitter, Github, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const cols = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features-section', internal: false },
      { label: 'Pricing', href: '#pricing', internal: false },
      { label: 'How It Works', href: '#how-it-works', internal: false },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about', internal: true },
      { label: 'Contact', href: '#contact', internal: false },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '#', internal: false },
      { label: 'Privacy Policy', href: '/privacy-policy', internal: true },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const scrollTo = (href) => {
    if (href.startsWith('#')) {
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer style={{ background: '#020617', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '3.5rem 0 1.5rem' }}>
      <div className="container">
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
              <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg,#06b6d4,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(6,182,212,0.35)' }}>
                <Zap size={14} color="#fff" fill="#fff" />
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.975rem', color: '#f1f5f9' }}>Money Lenders</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.65, marginBottom: '1.25rem' }}>
              Smart lending for growing businesses. Manage your portfolio with confidence.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a key={i} href="#" style={{ width: 34, height: 34, borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.2s', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#22d3ee'; e.currentTarget.style.borderColor = 'rgba(34,211,238,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.title}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1rem' }}>{col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {col.links.map(({ label, href, internal }) =>
                  internal ? (
                    <Link key={label} to={href}
                      style={{ fontSize: '0.85rem', color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = '#22d3ee'}
                      onMouseLeave={e => e.target.style.color = '#64748b'}>
                      {label}
                    </Link>
                  ) : (
                    <a key={label} href={href} onClick={e => { if (href.startsWith('#')) { e.preventDefault(); scrollTo(href); } }}
                      style={{ fontSize: '0.85rem', color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = '#22d3ee'}
                      onMouseLeave={e => e.target.style.color = '#64748b'}>
                      {label}
                    </a>
                  )
                )}
              </div>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1rem' }}>Stay Updated</div>
            <p style={{ fontSize: '0.825rem', color: '#475569', marginBottom: '0.875rem', lineHeight: 1.6 }}>
              Subscribe to get the latest updates and product news.
            </p>
            {subscribed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>✓</span> Thanks for subscribing!
              </div>
            ) : (
              <form className="footer-newsletter-form" onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  style={{ flex: 1, minWidth: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.625rem', padding: '0.6rem 0.875rem', fontSize: '0.82rem', color: '#f1f5f9', outline: 'none' }}
                />
                <button type="submit" className="btn-glow" style={{ padding: '0.6rem 0.875rem', fontSize: '0.82rem', borderRadius: '0.625rem', flexShrink: 0, width: 'auto' }}>→</button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '0.8rem', color: '#334155' }}>© 2026 Money Lenders. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <Link to="/privacy-policy" style={{ fontSize: '0.8rem', color: '#334155', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#22d3ee'}
              onMouseLeave={e => e.target.style.color = '#334155'}>Privacy Policy</Link>
            <a href="#" style={{ fontSize: '0.8rem', color: '#334155', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#22d3ee'}
              onMouseLeave={e => e.target.style.color = '#334155'}>Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
