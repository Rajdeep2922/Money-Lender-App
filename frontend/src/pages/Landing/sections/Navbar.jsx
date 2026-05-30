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

  const handleNavLink = (label) => {
    const sectionId = label.toLowerCase().replace(/\s+/g, '-');
    setMenuOpen(false);

    if (isLandingPage) {
      // Already on landing — just scroll
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Navigate to landing, then scroll after mount
      navigate('/landing');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    }
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      transition: 'all 0.3s ease',
      background: scrolled ? 'rgba(2,6,23,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
        {/* Logo */}
        <Link to="/landing" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
          <div style={{
            width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem',
            background: 'linear-gradient(135deg,#06b6d4,#10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(6,182,212,0.4)'
          }}>
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
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#22d3ee'}
              onMouseLeave={e => e.target.style.color = '#94a3b8'}
            >{l}</button>
          ))}
          <Link to="/about"
            style={{
              color: location.pathname === '/about' ? '#22d3ee' : '#94a3b8',
              fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s'
            }}
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
        <button className="show-mobile" onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(7,17,41,0.98)', backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem'
        }}>
          {links.map(l => (
            <button key={l} onClick={() => handleNavLink(l)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left', padding: '0.25rem 0' }}>
              {l}
            </button>
          ))}
          <Link to="/about" onClick={() => setMenuOpen(false)}
            style={{ color: location.pathname === '/about' ? '#22d3ee' : '#94a3b8', fontSize: '1rem', fontWeight: 500, textDecoration: 'none', padding: '0.25rem 0' }}>
            About Us
          </Link>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Link to="/login" className="btn-ghost" style={{ justifyContent: 'center' }}>Login</Link>
            <Link to="/register" className="btn-glow" style={{ justifyContent: 'center' }}>Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
