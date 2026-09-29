import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import EditorialStoryBlock from '../components/EditorialStoryBlock';

/**
 * Editorial Story Block Data
 * Product storytelling inspired by Credix Webflow composition:
 * - Real photographic assets (/editorial-lender.jpg, /editorial-ledger.jpg, /editorial-payment.jpg)
 * - Concise, authoritative, product-specific copy
 * - Alternating desktop layout with generous vertical spacing
 */
const STORY_BLOCKS = [
  {
    id: 'real-time-communication',
    image: '/editorial-realtime.jpg',
    alt: 'Lender and borrower actively communicating and reviewing loan terms in real time',
    eyebrow: 'REAL-TIME COMMUNICATION',
    title: 'Negotiate Without Leaving the Platform.',
    description:
      'Discuss loan terms, exchange documents, and keep every conversation connected to the lending relationship. Real-time delivery and read states, typing indicators, presence, and notifications keep lenders and borrowers in sync.',
    imagePosition: 'left',
    objectPosition: 'center center',
  },
  {
    id: 'loans-and-customers',
    image: '/editorial-lender.jpg',
    alt: 'Lender and customer reviewing loan details and agreement on a tablet in store',
    eyebrow: 'LOANS & CUSTOMERS',
    title: 'Every Loan, Connected to the Customer.',
    description:
      'Create and manage loans while keeping borrower details, loan history, repayment information, and customer activity organized in one place.',
    imagePosition: 'right',
    objectPosition: 'center 35%',
  },
  {
    id: 'payments-and-collections',
    image: '/editorial-payment.jpg',
    alt: 'Borrower and lender confirming instant digital payment receipt and repayment synchronization',
    eyebrow: 'PAYMENTS & COLLECTIONS',
    title: 'Every Payment, Kept in Sync.',
    description:
      'Record repayments, keep outstanding amounts updated, and maintain a clear history of payments for every borrower.',
    imagePosition: 'left',
    objectPosition: 'center 35%',
  },
];

/**
 * Third Landing Section — Product Story / Why Us
 *
 * Spacing Target:
 * Features content -> ~100–140px -> WHY US eyebrow -> 24–32px -> Heading -> 20–28px -> Supporting text -> Editorial Block 1
 */
export default function HowItWorks() {
  const shouldReduceMotion = useReducedMotion();

  const introVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section
      id="how-it-works"
      className="relative w-full bg-[#f8faff] dark:bg-[#0c0e14] border-t border-black/[0.04] dark:border-white/[0.04] transition-colors duration-300 pt-10 sm:pt-12 md:pt-12 lg:pt-8 pb-24 sm:pb-32 md:pb-36 lg:pb-44"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* ── Section Introduction (Editorial Statement / WHY US) ── */}
        <motion.div
          variants={introVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-16 sm:mb-20 md:mb-24 lg:mb-28 select-none"
        >
          {/* Small understated eyebrow pill (28px margin-bottom to heading) */}
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#e8eef9] dark:bg-[#151c28] border border-[#d2def2] dark:border-[#222e44] text-[#335384] dark:text-[#93b4e6] text-[11px] sm:text-xs font-bold tracking-[0.08em] uppercase mb-7 shadow-2xs">
            WHY US
          </div>

          {/* Large editorial headline (24px margin-bottom to paragraph) */}
          <h2 className="font-display font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-5xl lg:text-[52px] xl:text-[56px] font-bold text-[#0c0d12] dark:text-white tracking-[-0.035em] leading-[1.08] mb-6 max-w-[820px] mx-auto">
            Lending Made Simple, Organized, and Connected.
          </h2>

          {/* Short supporting paragraph */}
          <p className="text-base sm:text-lg md:text-xl text-[#526077] dark:text-[#94a3b8] max-w-[640px] mx-auto leading-relaxed font-normal">
            Manage loans, payments, customers, and real-time borrower communication from one connected workspace.
          </p>
        </motion.div>

        {/* ── Three Editorial Story Blocks ── */}
        <div className="space-y-28 sm:space-y-36 md:space-y-44 lg:space-y-52">
          {STORY_BLOCKS.map((block) => (
            <EditorialStoryBlock
              key={block.id}
              image={block.image}
              alt={block.alt}
              eyebrow={block.eyebrow}
              title={block.title}
              description={block.description}
              imagePosition={block.imagePosition}
              objectPosition={block.objectPosition}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
