import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Menu, X, Zap } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { animate } from 'animejs';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Minimal, premium navigation links inspired by Credix
const navLinks = [
  { label: 'Home', type: 'home', target: '/landing' },
  { label: 'Features', type: 'scroll', target: 'features' },
  { label: 'How It Works', type: 'scroll', target: 'how-it-works' },
  { label: 'About Us', type: 'route', target: '/about' },
  { label: 'Contact', type: 'scroll', target: 'contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navbarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isLandingPage = location.pathname === '/' || location.pathname === '/landing';

  // Subtle initial entrance animation on landing page load (Anime.js isolated to this navbar ref)
  useIsomorphicLayoutEffect(() => {
    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isLandingPage || prefersReducedMotion) return;

    // If page is already scrolled down on refresh, skip entrance animation
    if (typeof window !== 'undefined' && window.scrollY > 4) {
      return;
    }

    const navbar = navbarRef.current;
    if (!navbar) return;

    let isCleanedUp = false;
    const resetStyles = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;
      if (navbar) {
        navbar.style.opacity = '';
        navbar.style.transform = '';
        navbar.style.transition = '';
      }
    };

    // Synchronous initial hidden position before paint
    navbar.style.transition = 'none';
    navbar.style.opacity = '0';
    navbar.style.transform = 'translateY(-14px)';

    let anim;
    try {
      anim = animate(navbar, {
        opacity: [0, 1],
        translateY: [-14, 0],
        duration: 580,
        delay: 180,
        ease: 'outCubic',
        onComplete: resetStyles,
      });
    } catch (err) {
      console.error('Navbar entrance animation error:', err);
      resetStyles();
      return;
    }

    // Crucial: If the user begins scrolling, immediately settle navbar intro
    // so navbar.style.transition='none' does not block scrolled state transition
    const handleEarlyScroll = () => {
      if (window.scrollY > 4) {
        if (anim && typeof anim.pause === 'function') {
          anim.pause();
        }
        clearTimeout(safetyTimer);
        resetStyles();
        window.removeEventListener('scroll', handleEarlyScroll);
      }
    };
    window.addEventListener('scroll', handleEarlyScroll, { passive: true });

    // Safety fallback: ensure navbar is unconditionally cleared and visible after 1.2s
    const safetyTimer = setTimeout(() => {
      resetStyles();
      window.removeEventListener('scroll', handleEarlyScroll);
    }, 1200);

    return () => {
      window.removeEventListener('scroll', handleEarlyScroll);
      clearTimeout(safetyTimer);
      if (anim && typeof anim.pause === 'function') {
        anim.pause();
      }
      resetStyles();
    };
  }, [isLandingPage]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleHomeClick = (e) => {
    e?.preventDefault();
    setMenuOpen(false);
    if (isLandingPage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/landing');
    }
  };

  const handleScrollClick = (targetId) => {
    setMenuOpen(false);
    if (isLandingPage) {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/landing');
      setTimeout(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    }
  };

  const isDarkNav = !scrolled && isLandingPage;

  return (
    <>
      {/* ── Main navbar bar: Transparent over sky video on landing, soft cool blue-gray when scrolled or on light pages ── */}
      <header
        ref={navbarRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isDarkNav
            ? 'bg-transparent border-b border-white/[0.08]'
            : 'bg-[#F0F4F9]/95 backdrop-blur-md border-b border-[#DCE5EF] shadow-2xs'
        }`}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left: Brand Logo & Name */}
          <div style={{ display: 'flex', alignItems: 'center', flex: '1 1 0%', justifyContent: 'flex-start' }}>
            <Link
              to="/landing"
              style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
            >
              <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={16} color="#fff" fill="#fff" />
              </div>
              <span className={`font-bold text-[15px] tracking-tight transition-colors duration-300 ${isDarkNav ? 'text-white' : 'text-[#0F172A]'}`}>
                Money Lender
              </span>
            </Link>
          </div>

          {/* Center Navigation: Links (Home, Features, How It Works, About Us, Contact) */}
          <nav
            aria-label="Main Navigation"
            className="hide-mobile"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}
          >
            {navLinks.map((item) => {
              const isHome = item.type === 'home';
              const isAbout = item.type === 'route';
              const isActive = (isHome && isLandingPage && !scrolled) || (isAbout && location.pathname === '/about');
              const baseClass = `text-sm font-medium transition-colors duration-300 cursor-pointer no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm py-1 px-1`;
              const colorClass = isActive
                ? (isDarkNav ? 'text-white font-semibold' : 'text-[#2563EB] font-semibold')
                : (isDarkNav ? 'text-white/90 hover:text-white' : 'text-[#475569] hover:text-[#0F172A]');

              if (isHome) {
                return (
                  <Link
                    key={item.label}
                    to={item.target}
                    onClick={handleHomeClick}
                    className={`${baseClass} ${colorClass}`}
                  >
                    {item.label}
                  </Link>
                );
              }

              if (isAbout) {
                return (
                  <Link
                    key={item.label}
                    to={item.target}
                    className={`${baseClass} ${colorClass}`}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleScrollClick(item.target)}
                  className={`${baseClass} ${colorClass} bg-transparent border-none`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right: Actions (Desktop) & Hamburger (Mobile) */}
          <div style={{ display: 'flex', alignItems: 'center', flex: '1 1 0%', justifyContent: 'flex-end', gap: '0.75rem' }}>
            {/* Desktop CTA actions */}
            <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to="/login"
                className={`transition-colors duration-300 text-sm font-medium no-underline px-3 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md ${
                  isDarkNav ? 'text-white/90 hover:text-white' : 'text-[#475569] hover:text-[#0F172A]'
                }`}
                style={{ fontSize: '0.875rem' }}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`transition-all duration-300 text-sm font-semibold no-underline shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isDarkNav
                    ? 'bg-white text-[#0F172A] hover:bg-slate-50'
                    : 'bg-[#0F172A] text-white hover:bg-[#1E293B]'
                }`}
                style={{ padding: '0.5rem 1.35rem', fontSize: '0.875rem', borderRadius: '9999px' }}
              >
                Get Started
              </Link>
            </div>

            {/* Mobile hamburger button */}
            <button
              className="show-mobile"
              onClick={() => setMenuOpen((o) => !o)}
              style={{
                background: 'none',
                border: 'none',
                color: isDarkNav ? '#ffffff' : '#0F172A',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.3s ease',
              }}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile dropdown ── */}
      {menuOpen && (
        <div className="fixed top-[57px] left-0 right-0 z-40 bg-[#F0F4F9]/98 border-b border-[#DCE5EF] py-3 shadow-md backdrop-blur-md">
          {/* Mobile navigation links */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {navLinks.map((item) => {
              if (item.type === 'home') {
                return (
                  <Link
                    key={item.label}
                    to={item.target}
                    onClick={handleHomeClick}
                    className="text-left text-sm font-medium text-[#0F172A] hover:text-[#2563EB] py-3 px-6 border-b border-[#DCE5EF]/60 no-underline block"
                  >
                    {item.label}
                  </Link>
                );
              }
              if (item.type === 'route') {
                return (
                  <Link
                    key={item.label}
                    to={item.target}
                    onClick={() => setMenuOpen(false)}
                    className="text-left text-sm font-medium text-[#0F172A] hover:text-[#2563EB] py-3 px-6 border-b border-[#DCE5EF]/60 no-underline block"
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleScrollClick(item.target)}
                  className="text-left text-sm font-medium text-[#0F172A] hover:text-[#2563EB] py-3 px-6 border-b border-[#DCE5EF]/60 bg-transparent border-none cursor-pointer"
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Mobile CTA buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', padding: '1rem 1.5rem 0' }}>
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="btn-ghost"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
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
