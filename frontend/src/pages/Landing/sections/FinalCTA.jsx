import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * FinalCTA Component — Compact, Restrained Editorial Panel
 *
 * Characteristics:
 * - Solid deep navy editorial panel (#0F172A) on pale blue-gray surface (#EBF2FA)
 * - Headline: "Keep every loan in order."
 * - Single short supporting sentence on lending, repayments, and borrower records
 * - Prominent "Get Started" button and quiet secondary "Sign in" link
 * - Compact vertical padding, zero decorative icons, gradients, glows, or excessive corners
 */
export default function FinalCTA() {
  const shouldReduceMotion = useReducedMotion();

  const motionProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-30px' },
        transition: { duration: 0.4, ease: 'easeOut' },
      };

  return (
    <section
      id="product-outro"
      className="relative w-full bg-[#EBF2FA] border-t border-[#DCE5EF] select-none py-10 sm:py-14 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: '#EBF2FA' }}
    >
      <div className="max-w-[1240px] mx-auto">
        <motion.div
          {...motionProps}
          className="bg-[#0F172A] rounded-xl sm:rounded-2xl border border-slate-800/80 p-7 sm:p-9 lg:p-11 text-white shadow-xs"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 lg:gap-10">
            {/* Left Column: Headline & Single Supporting Sentence */}
            <div className="max-w-xl">
              <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-bold tracking-tight text-white leading-tight">
                Make lending easier to manage.
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-2 sm:mt-2.5 leading-relaxed font-normal">
                Keep customer records, loans, repayments, and conversations organized in one place.
              </p>
            </div>

            {/* Right Column: Prominent Get Started + Quiet Sign in Link */}
            <div className="flex items-center gap-5 sm:gap-6 shrink-0 pt-1 md:pt-0">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-600 text-white font-semibold text-sm transition-colors shadow-2xs no-underline"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors no-underline"
              >
                Sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

