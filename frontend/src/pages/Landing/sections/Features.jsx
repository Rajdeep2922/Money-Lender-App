import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Bespoke Money Lender Brand Icon System
 *
 * Designed per specifications:
 * - Distinctive custom SVG symbols (zero generic icon libraries)
 * - Cohesive geometric brand language: bold 2.2 stroke weight, 24px visual mark, solid focal nodes
 * - Strong silhouette and limited shapes for instant recognition
 * - Sits naturally inside a soft 54–56px circular backdrop with generous breathing room
 */

// 1. Track Every Loan — Dynamic loan trajectory path with origin node & forward vector
function TrackSymbol({ className = 'w-6 h-6 shrink-0' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M8.5 15.5L15.5 8.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <polygon points="16,8.5 11.5,8.5 15.5,12.5" fill="currentColor" />
      <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

// 2. Real-Time Communication — Live conversational sync mark with active transmission nodes
function RealTimeSymbol({ className = 'w-6 h-6 shrink-0' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M7.5 18L3.5 19.5L4.8 15.8C3.7 14.5 3 12.8 3 11C3 6.6 7 3 12 3C17 3 21 6.6 21 11C21 15.4 17 19 12 19C10.4 19 8.9 18.6 7.5 18Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="11" r="1.5" fill="currentColor" />
      <circle cx="12" cy="11" r="1.5" fill="currentColor" />
      <circle cx="16" cy="11" r="1.5" fill="currentColor" />
    </svg>
  );
}

// 3. Record Every Payment — Reciprocal payment & transaction settlement loop with central coin
function PaymentSymbol({ className = 'w-6 h-6 shrink-0' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 3.5a8.5 8.5 0 0 1 8 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <polygon points="20.5,10 19,5.5 15.5,9" fill="currentColor" />
      <path
        d="M12 20.5a8.5 8.5 0 0 1-8-6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <polygon points="3.5,14 5,18.5 8.5,15" fill="currentColor" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}

// 4. Customer Management — Borrower identity node with verification arc & focal accent
function CustomerSymbol({ className = 'w-6 h-6 shrink-0' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="7.5" r="4" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M4.5 19.5c0-3.6 3.4-6.5 7.5-6.5s7.5 2.9 7.5 6.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="7.5" r="1.6" fill="currentColor" />
    </svg>
  );
}

// 5. Know Your Portfolio — Architectural asset distribution mark with floating solid facet
function PortfolioSymbol({ className = 'w-6 h-6 shrink-0' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 3.5 A 8.5 8.5 0 1 0 20.5 12 H 12 Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 10 H 21 A 8.5 8.5 0 0 0 14.5 3.5 Z"
        fill="currentColor"
      />
    </svg>
  );
}

// 6. Lending Insights — Geometric intelligence beacon emblem with central core
function InsightsSymbol({ className = 'w-6 h-6 shrink-0' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 3C12 7.8 7.8 12 3 12C7.8 12 12 16.2 12 21C12 16.2 16.2 12 21 12C16.2 12 12 7.8 12 3Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
    </svg>
  );
}

const FEATURES_DATA = [
  {
    title: 'Track Every Loan',
    description: 'Create loans, calculate EMI details, and keep every lending agreement organized in one place.',
    Icon: TrackSymbol,
  },
  {
    title: 'Real-Time Communication',
    description: 'Discuss loan terms, exchange documents, and stay connected with live messages, delivery states, read receipts, typing indicators, and presence.',
    Icon: RealTimeSymbol,
  },
  {
    title: 'Record Every Payment',
    description: 'Record repayments, keep outstanding amounts updated, and maintain a clear payment history for every loan.',
    Icon: PaymentSymbol,
  },
  {
    title: 'Customer Management',
    description: 'Manage borrower profiles, loan history, contact details, and customer activity from one workspace.',
    Icon: CustomerSymbol,
  },
  {
    title: 'Know Your Portfolio',
    description: 'Monitor lending activity, outstanding amounts, collections, and important portfolio information from your dashboard.',
    Icon: PortfolioSymbol,
  },
  {
    title: 'Lending Insights',
    description: 'Understand your lending activity through clear dashboard information and useful financial insights.',
    Icon: InsightsSymbol,
  },
];

/**
 * Features Section — Redesigned Credix-Style Editorial Layout
 */
export default function Features() {
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const staggerGrid = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.07,
        delayChildren: 0.1,
      },
    },
  };

  const itemFade = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section
      id="features"
      className="relative w-full bg-[#f8faff] dark:bg-[#0c0e14] transition-colors duration-300 pt-20 sm:pt-28 md:pt-32 lg:pt-36 pb-16 sm:pb-20 md:pb-20 lg:pb-24"
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-center select-none">
        {/* ── Section Header (Pill + Heading + Supporting Subtext) ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 sm:mb-20 md:mb-24 lg:mb-28"
        >
          {/* Subtle outlined label pill */}
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#e8eef9] dark:bg-[#151c28] border border-[#d2def2] dark:border-[#222e44] text-[#335384] dark:text-[#93b4e6] text-[11px] sm:text-xs font-bold tracking-[0.08em] uppercase mb-5 sm:mb-6 shadow-2xs">
            FEATURES
          </div>

          {/* Large centered headline */}
          <h2 className="font-display font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold text-[#0c0d12] dark:text-white tracking-[-0.035em] leading-[1.08] mb-4 sm:mb-5 max-w-[800px] mx-auto">
            Everything You Need to Manage Lending.
          </h2>

          {/* Centered supporting paragraph */}
          <p className="text-base sm:text-lg text-[#526077] dark:text-[#94a3b8] max-w-[580px] mx-auto leading-relaxed font-normal">
            Track loans, record repayments, manage customers, and monitor your entire portfolio from one clean, unified workspace.
          </p>
        </motion.div>

        {/* ── Spacious 3-Column Feature Grid ── */}
        <motion.div
          variants={staggerGrid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 lg:gap-x-16 xl:gap-x-20 gap-y-14 sm:gap-y-16 lg:gap-y-20"
        >
          {FEATURES_DATA.map((feature, idx) => {
            const { title, description, Icon } = feature;
            return (
              <motion.div
                key={idx}
                variants={itemFade}
                className="flex flex-col items-center text-center group"
              >
                {/* Refined 54-56px circular backdrop with generous breathing room */}
                <div className="w-[54px] h-[54px] sm:w-14 sm:h-14 rounded-full bg-[#edf2fa] dark:bg-[#161c28] border-0 shadow-none flex items-center justify-center text-[#1d3860] dark:text-[#7fa7e8] mb-5 sm:mb-6 transition-transform duration-200 group-hover:scale-105">
                  <Icon className="w-6 h-6 shrink-0" />
                </div>

                {/* Feature Title */}
                <h3 className="font-display font-['Space_Grotesk'] text-lg sm:text-xl font-bold text-[#0c0d12] dark:text-white tracking-[-0.02em] mb-2 sm:mb-2.5">
                  {title}
                </h3>

                {/* Short 1–2 Line Description */}
                <p className="text-sm sm:text-[15px] text-[#526077] dark:text-[#94a3b8] leading-relaxed max-w-[320px] mx-auto font-normal">
                  {description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
