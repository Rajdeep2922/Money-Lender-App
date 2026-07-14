import { useState, useEffect } from 'react';
import { Menu, X, Zap } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const links = ['Features', 'How It Works', 'Benefits', 'Pricing', 'Contact'];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isLandingPage = location.pathname === '/' || location.pathname === '/landing';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleNavLink = (label) => {
    const sectionId = label.toLowerCase().replace(/\s+/g, '-');
    setMenuOpen(false);
    if (isLandingPage) {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/landing');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    }
  };

  return (
    <>
      {/* ── Main navbar bar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(2,6,23,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link to="/landing" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', background: 'linear-gradient(135deg,#06b6d4,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(6,182,212,0.4)' }}>
              <Zap size={18} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9', letterSpacing: '-0.01em' }}>
              Money Lenders
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {links.map(l => (
              <button key={l} onClick={() => handleNavLink(l)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s', padding: 0 }}
                onMouseEnter={e => e.target.style.color = '#22d3ee'}
                onMouseLeave={e => e.target.style.color = '#94a3b8'}
              >{l}</button>
            ))}
            <Link to="/about"
              style={{ color: location.pathname === '/about' ? '#22d3ee' : '#94a3b8', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#22d3ee'}
              onMouseLeave={e => e.currentTarget.style.color = location.pathname === '/about' ? '#22d3ee' : '#94a3b8'}
            >About Us</Link>
          </div>

          {/* Desktop CTA */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/login" className="btn-ghost" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>Login</Link>
            <Link to="/register" className="btn-glow" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>Get Started</Link>
          </div>

          {/* Hamburger */}
          <button
            className="show-mobile"
            onClick={() => setMenuOpen(o => !o)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile dropdown — own fixed panel, immune to nav layout ── */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: '60px',
          left: 0,
          right: 0,
          zIndex: 99,
          background: 'rgba(4,11,31,0.99)',
          borderTop: '1px solid rgba(34,211,238,0.12)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: '0.75rem 0 1.25rem',
        }}>
          {/* Nav links */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {links.map(l => (
              <button key={l} onClick={() => handleNavLink(l)}
                style={{
                  background: 'none', border: 'none',
                  color: '#94a3b8', fontSize: '0.975rem', fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: '0.75rem 1.5rem',
                  display: 'block',
                  width: '100%',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#22d3ee'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
              >
                {l}
              </button>
            ))}
            <Link to="/about" onClick={() => setMenuOpen(false)}
              style={{
                color: location.pathname === '/about' ? '#22d3ee' : '#94a3b8',
                fontSize: '0.975rem', fontWeight: 500,
                textDecoration: 'none',
                padding: '0.75rem 1.5rem',
                display: 'block',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
              About Us
            </Link>
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', padding: '1rem 1.5rem 0' }}>
            <Link to="/login" onClick={() => setMenuOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0.75rem 1rem', borderRadius: '0.75rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem',
                textDecoration: 'none',
              }}>
              Login
            </Link>
            <Link to="/register" onClick={() => setMenuOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0.75rem 1rem', borderRadius: '0.75rem',
                background: 'linear-gradient(135deg,#06b6d4,#10b981)',
                color: '#fff', fontWeight: 600, fontSize: '0.9rem',
                textDecoration: 'none',
                boxShadow: '0 0 20px rgba(6,182,212,0.3)',
              }}>
              Get Started
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
