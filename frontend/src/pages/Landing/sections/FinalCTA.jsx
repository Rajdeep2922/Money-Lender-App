import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, FileCheck2, MessageSquare } from 'lucide-react';

const TRUST_POINTS = [
  {
    icon: Calculator,
    title: 'Precision Calculations',
    description: 'Automated EMI schedules, custom interest models, and penalty tracking with zero spreadsheet errors.',
  },
  {
    icon: FileCheck2,
    title: 'Audit-Ready Ledgers',
    description: 'Every borrower profile, loan contract, and repayment timestamp stored in one clean, permanent ledger.',
  },
  {
    icon: MessageSquare,
    title: 'Real-Time Communication',
    description: 'Negotiate terms, exchange documents, and track delivery receipts directly with borrowers in real time.',
  },
];

/**
 * FinalCTA Component — Compact, Refined Fintech Closing Section
 *
 * Visual Hierarchy & Layout:
 * 1. CTA Headline: Primary focal point (~52–56px desktop)
 * 2. CTA Supporting Copy: 18–19px comfortable text
 * 3. Action CTAs: Standard fintech size (Get Started in #2563EB, Sign In outlined)
 * 4. Compact Feature Strip: Horizontal white surface (~160px height), restrained 32px icons, 3 equal columns
 */
export default function FinalCTA() {
  const shouldReduceMotion = useReducedMotion();

  const motionProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-30px' },
        transition: { duration: 0.45, ease: 'easeOut' },
      };

  return (
    <section
      id="product-outro"
      className="relative w-full bg-[#EBF2FA] border-t border-[#DCE5EF] select-none pt-24 sm:pt-28 pb-16 sm:pb-20 px-6 sm:px-8 lg:px-12"
      style={{ backgroundColor: '#EBF2FA' }}
    >
      <div className="max-w-[1120px] mx-auto">
        {/* ── Top Area: Centered CTA Statement & Buttons (Focal Point) ── */}
        <motion.div
          {...motionProps}
          className="flex flex-col items-center text-center max-w-[760px] mx-auto mb-10 sm:mb-12"
        >
          {/* Eyebrow */}
          <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-[#2563EB] uppercase mb-3 block">
            The Money Lender Platform
          </span>

          {/* Headline (Controlled, Strongest Hierarchy ~52-56px desktop) */}
          <h2 className="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-[48px] lg:text-[54px] font-bold text-[#0F172A] leading-[1.1] tracking-[-0.03em] mb-4">
            Manage your lending business with complete confidence.
          </h2>

          {/* Supporting Text (18–19px desktop) */}
          <p className="text-base sm:text-lg lg:text-[18px] text-[#475569] leading-relaxed max-w-[580px] mb-7 sm:mb-8 font-normal">
            Everything you need to originate loans, automate repayments, and maintain clear, verifiable financial records from day one.
          </p>

          {/* Action CTAs: Normal premium fintech sizing */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.99] text-white font-semibold text-sm transition-colors duration-150 shadow-xs cursor-pointer no-underline group"
            >
              <span>Get Started</span>
              <ArrowRight
                size={14}
                className="transition-transform duration-150 group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 sm:py-3 rounded-lg border border-[#DCE5EF] hover:border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#0F172A] font-medium text-sm transition-colors duration-150 cursor-pointer no-underline"
            >
              <span>Sign In to Account</span>
            </Link>
          </div>
        </motion.div>

        {/* ── Feature Strip: Compact Horizontal Supporting Surface (~160px desktop) ── */}
        <div className="rounded-xl bg-white border border-[#DCE5EF] shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#DCE5EF]">
            {TRUST_POINTS.map((point, i) => {
              const { icon: Icon, title, description } = point;
              return (
                <div key={i} className="p-6 sm:p-7 lg:py-7 lg:px-8 flex flex-col items-start text-left">
                  {/* Restrained 32px icon container */}
                  <div className="w-8 h-8 rounded-md bg-[#EEF5FF] border border-[#DCE5EF] flex items-center justify-center text-[#2563EB] mb-3 shrink-0">
                    <Icon size={16} strokeWidth={2.2} />
                  </div>
                  <h3 className="font-['Space_Grotesk'] text-[15px] sm:text-base font-bold text-[#0F172A] tracking-tight mb-1.5">
                    {title}
                  </h3>
                  <p className="text-[13px] sm:text-[13.5px] text-[#475569] leading-relaxed font-normal">
                    {description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
