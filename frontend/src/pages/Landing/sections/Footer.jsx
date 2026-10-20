import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, Github, Linkedin } from 'lucide-react';

/**
 * Footer Component — Compact, Founder-Built Product Ending
 *
 * Visual Areas:
 * Area A: Product identity, brief description, and developer GitHub & LinkedIn links
 * Area B: Concise navigation list with active Product & Company routes
 * Bottom Row: Subtle copyright notice and non-duplicated legal links (Privacy Policy & Terms)
 */
export default function Footer() {
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const location = useLocation();

  const isLandingPage = location.pathname === '/' || location.pathname === '/landing';

  const handleScrollTo = (e, targetId) => {
    e.preventDefault();
    if (isLandingPage) {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/landing');
      setTimeout(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    }
  };

  const footerMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-20px' },
        transition: { duration: 0.35, ease: 'easeOut' },
      };

  return (
    <footer
      id="contact"
      className="relative w-full bg-[#ECF1F7] border-t border-[#DCE5EF] text-[#0F172A] select-none pt-9 sm:pt-11 pb-6 sm:pb-7 overflow-hidden"
      style={{ backgroundColor: '#ECF1F7' }}
    >
      <motion.div
        {...footerMotion}
        className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* ── Main Footer Areas: Balanced & Grouped Naturally ── */}
        <div className="flex flex-col md:flex-row items-start gap-10 sm:gap-14 lg:gap-20">
          {/* ── Area A: Product Identity & Developer Social Links ── */}
          <div className="flex flex-col max-w-sm shrink-0">
            <Link
              to="/landing"
              className="inline-flex items-center gap-2 no-underline text-[#0F172A]"
            >
              <div className="w-5.5 h-5.5 rounded-md bg-[#2563EB] flex items-center justify-center text-white shadow-2xs">
                <Zap size={12} color="#fff" fill="#fff" />
              </div>
              <span className="font-bold text-sm tracking-tight text-[#0F172A]">
                Money Lender
              </span>
            </Link>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed font-normal max-w-xs">
              Practical loan management, automated interest calculations, and clear repayment tracking for everyday lenders.
            </p>

            {/* Developer Social Links */}
            <div className="flex items-center gap-3.5 mt-3.5 text-xs font-medium text-slate-600">
              <a
                href="https://github.com/Rajdeep2922"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#2563EB] transition-colors no-underline group"
              >
                <Github size={13} className="text-slate-500 group-hover:text-[#2563EB] transition-colors" />
                <span>GitHub</span>
              </a>
              <span className="text-[#CBD5E1]" aria-hidden="true">·</span>
              <a
                href="https://www.linkedin.com/in/rajdeep-singh-3900b12b9/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#2563EB] transition-colors no-underline group"
              >
                <Linkedin size={13} className="text-slate-500 group-hover:text-[#2563EB] transition-colors" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          {/* ── Area B: Product & Company Links (Comfortable Gap, Not Pushed to Extreme Right) ── */}
          <div className="flex items-start gap-12 sm:gap-16 pt-0.5">
            {/* Product Column */}
            <div className="min-w-[110px]">
              <h3 className="text-[11px] font-semibold tracking-wider text-[#0F172A] uppercase mb-2.5">
                Product
              </h3>
              <ul className="space-y-2 p-0 m-0 list-none">
                <li>
                  <a
                    href="#features"
                    onClick={(e) => handleScrollTo(e, 'features')}
                    className="text-xs text-slate-600 hover:text-[#2563EB] transition-colors no-underline cursor-pointer block"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    onClick={(e) => handleScrollTo(e, 'how-it-works')}
                    className="text-xs text-slate-600 hover:text-[#2563EB] transition-colors no-underline cursor-pointer block"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <Link
                    to="/calculator"
                    className="text-xs text-slate-600 hover:text-[#2563EB] transition-colors no-underline block"
                  >
                    Calculator
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="min-w-[110px]">
              <h3 className="text-[11px] font-semibold tracking-wider text-[#0F172A] uppercase mb-2.5">
                Company
              </h3>
              <ul className="space-y-2 p-0 m-0 list-none">
                <li>
                  <Link
                    to="/about"
                    className="text-xs text-slate-600 hover:text-[#2563EB] transition-colors no-underline block"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="text-xs text-slate-600 hover:text-[#2563EB] transition-colors no-underline block"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="text-xs text-slate-600 hover:text-[#2563EB] transition-colors no-underline block"
                  >
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Hairline Divider & Subtle Bottom Row ── */}
        <div className="border-t border-[#DCE5EF] mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-normal">
          <span>© 2026 Money Lender. All rights reserved.</span>

          {/* Legal Links (Single non-duplicated Privacy Policy + Terms) */}
          <div className="flex items-center gap-3">
            <Link
              to="/privacy-policy"
              className="text-slate-500 hover:text-[#2563EB] transition-colors no-underline"
            >
              Privacy Policy
            </Link>
            <span className="text-[#CBD5E1]" aria-hidden="true">·</span>
            <Link
              to="/legal"
              className="text-slate-500 hover:text-[#2563EB] transition-colors no-underline"
            >
              Terms
            </Link>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}

