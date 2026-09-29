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
      {/* ── Main navbar bar with continuous Credix-style frosted glass blur ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-lg [-webkit-backdrop-filter:blur(16px)] ${scrolled
          ? 'bg-[#edf2f8]/85 dark:bg-[#0c0e14]/85 border-b border-black/[0.06] dark:border-white/[0.08] shadow-xs'
          : 'bg-white/[0.08] dark:bg-black/[0.2] border-b border-white/[0.14]'
          }`}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link to="/landing" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(37,99,235,0.35)' }}>
              <Zap size={18} color="#fff" fill="#fff" />
            </div>
            <span className={`font-extrabold text-base tracking-tight transition-colors duration-300 ${scrolled ? 'text-[#0c0d12] dark:text-white' : 'text-white'}`}>
              Money Lender
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {links.map(l => (
              <button key={l} onClick={() => handleNavLink(l)}
                className={`text-sm font-semibold transition-colors duration-300 cursor-pointer bg-transparent border-none p-0 ${scrolled
                  ? 'text-[#526077] dark:text-gray-400 hover:text-[#2563eb] dark:hover:text-blue-400'
                  : 'text-white/85 hover:text-white'
                  }`}
              >{l}</button>
            ))}
            <Link to="/about"
              className={`text-sm font-semibold transition-colors duration-300 no-underline ${location.pathname === '/about'
                ? 'text-[#2563eb] dark:text-blue-400'
                : scrolled
                  ? 'text-[#526077] dark:text-gray-400 hover:text-[#2563eb] dark:hover:text-blue-400'
                  : 'text-white/85 hover:text-white'
                }`}
            >About Us</Link>
          </div>

          {/* Desktop CTA */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/login"
              className={`transition-all duration-300 text-sm font-semibold no-underline ${scrolled
                ? 'text-[#526077] dark:text-gray-300 hover:text-[#0c0d12] dark:hover:text-white px-3 py-1.5'
                : 'text-white/90 hover:text-white px-3 py-1.5'
                }`}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
            >
              Login
            </Link>
            <Link to="/register"
              className={`transition-all duration-300 text-sm font-bold no-underline ${scrolled
                ? 'bg-[#0c0d12] dark:bg-white text-white dark:text-[#0c0d12] hover:bg-black/90 shadow-sm'
                : 'bg-white text-[#0c0d12] hover:bg-white/95 shadow-sm'
                }`}
              style={{ padding: '0.5rem 1.35rem', fontSize: '0.875rem', borderRadius: '9999px' }}
            >
              Get Started
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="show-mobile"
            onClick={() => setMenuOpen(o => !o)}
            style={{ background: 'none', border: 'none', color: scrolled ? '#526077' : '#ffffff', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile dropdown ── */}
      {menuOpen && (
        <div className="fixed top-[60px] left-0 right-0 z-40 bg-[#f8fbfe]/98 dark:bg-[#0c0e14]/98 border-t border-black/[0.08] dark:border-white/[0.08] border-b border-black/[0.08] dark:border-white/[0.08] py-3 shadow-lg">
          {/* Nav links */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {links.map(l => (
              <button key={l} onClick={() => handleNavLink(l)}
                className="text-left text-sm font-semibold text-[#0c0d12] dark:text-white hover:text-[#2563eb] dark:hover:text-blue-400 py-3 px-6 border-b border-black/[0.04] dark:border-white/[0.04] bg-transparent border-none cursor-pointer"
              >
                {l}
              </button>
            ))}
            <Link to="/about" onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-[#0c0d12] dark:text-white hover:text-[#2563eb] dark:hover:text-blue-400 py-3 px-6 border-b border-black/[0.04] dark:border-white/[0.04] no-underline block"
            >
              About Us
            </Link>
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', padding: '1rem 1.5rem 0' }}>
            <Link to="/login" onClick={() => setMenuOpen(false)}
              className="btn-ghost"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Login
            </Link>
            <Link to="/register" onClick={() => setMenuOpen(false)}
              className="btn-glow"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
