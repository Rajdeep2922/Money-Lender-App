import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Github, Linkedin } from 'lucide-react';

const navColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features', internal: false },
      { label: 'How It Works', href: '#how-it-works', internal: false },
      { label: 'Explore Platform', href: '/login', internal: true },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about', internal: true },
      { label: 'Contact', href: '/about', internal: true },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help Center', href: '/legal', internal: true },
      { label: 'Privacy Policy', href: '/privacy-policy', internal: true },
      { label: 'Legal Center', href: '/legal', internal: true },
    ],
  },
];

/**
 * Footer Component — Quiet, Compact Editorial Footer
 *
 * Characteristics:
 * - Subtle quiet neutral tone (#ECF1F7) seamless with the closing CTA
 * - Controlled compact vertical padding (pt-10 pb-6)
 * - 1px hairline border (#DCE5EF)
 * - Deep navy (#0F172A) headers and subtle #475569 links
 */
export default function Footer() {
  const shouldReduceMotion = useReducedMotion();

  const handleScrollTo = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.slice(1);
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
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
      className="relative w-full bg-[#ECF1F7] border-t border-[#DCE5EF] text-[#0F172A] select-none pt-10 sm:pt-12 pb-6 sm:pb-8 overflow-hidden"
      style={{ backgroundColor: '#ECF1F7' }}
    >
      <motion.div
        {...footerMotion}
        className="max-w-[1120px] mx-auto px-6 sm:px-8 lg:px-12"
      >
        {/* ── Main Horizontal Grid Layout ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* ── Brand Area (Left ~35%) ── */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col">
            <Link
              to="/landing"
              className="inline-flex items-center gap-2.5 no-underline text-[#0F172A]"
            >
              <div className="w-5.5 h-5.5 rounded-md bg-[#2563EB] flex items-center justify-center shadow-2xs">
                <Zap size={12} color="#fff" fill="#fff" />
              </div>
              <span className="font-bold text-[14px] tracking-tight text-[#0F172A]">
                Money Lender
              </span>
            </Link>

            <p className="text-xs text-[#64748B] mt-2 leading-relaxed max-w-[260px] font-normal">
              Smart lending management for growing businesses.
            </p>

            {/* Subtle Monochrome Social Links */}
            <div className="flex items-center gap-3 mt-3.5">
              <a
                href="https://github.com/Rajdeep2922"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="text-[#64748B] hover:text-[#2563EB] transition-colors duration-150"
              >
                <Github size={14} />
              </a>
              <a
                href="https://www.linkedin.com/in/rajdeep-singh-3900b12b9/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="text-[#64748B] hover:text-[#2563EB] transition-colors duration-150"
              >
                <Linkedin size={14} />
              </a>
            </div>
          </div>

          {/* ── Navigation Columns (Right ~65%) ── */}
          <div className="md:col-span-7 lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
            {navColumns.map((col) => (
              <div key={col.title}>
                <h4 className="text-[11px] font-semibold tracking-wider text-[#0F172A] uppercase mb-2.5">
                  {col.title}
                </h4>
                <ul className="space-y-1.5 p-0 m-0 list-none">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.internal ? (
                        <Link
                          to={link.href}
                          className="text-xs font-normal text-[#475569] hover:text-[#2563EB] transition-colors duration-150 no-underline"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          onClick={(e) => handleScrollTo(e, link.href)}
                          className="text-xs font-normal text-[#475569] hover:text-[#2563EB] transition-colors duration-150 no-underline cursor-pointer"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Hairline Divider & Bottom Row ── */}
        <div className="border-t border-[#DCE5EF] mt-8 sm:mt-10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
          {/* Left: Copyright */}
          <span>© 2026 Money Lender. All rights reserved.</span>

          {/* Right: Legal Links */}
          <div className="flex items-center gap-3">
            <Link
              to="/privacy-policy"
              className="text-[#64748B] hover:text-[#2563EB] transition-colors duration-150 no-underline"
            >
              Privacy Policy
            </Link>
            <span className="text-[#CBD5E1]">·</span>
            <Link
              to="/legal"
              className="text-[#64748B] hover:text-[#2563EB] transition-colors duration-150 no-underline"
            >
              Terms
            </Link>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
