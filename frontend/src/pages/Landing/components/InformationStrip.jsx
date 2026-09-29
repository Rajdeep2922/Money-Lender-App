import React from 'react';
import {
  Compass,
  Receipt,
  Wallet,
  AddressBook,
  ChartLineUp,
  Clock,
} from '@phosphor-icons/react';

const ITEMS = [
  {
    title: 'Track Every Loan',
    Icon: Compass,
  },
  {
    title: 'Record Every Payment',
    Icon: Receipt,
  },
  {
    title: 'Know Every Balance',
    Icon: Wallet,
  },
  {
    title: 'Manage Customer Ledgers',
    Icon: AddressBook,
  },
  {
    title: 'Monitor Your Portfolio',
    Icon: ChartLineUp,
  },
  {
    title: 'Stay Ahead of Repayments',
    Icon: Clock,
  },
];

/**
 * InformationStrip Component — Credix-Style Single-Divider Marquee
 *
 * Calibrated visual relationship matching the BEFORE screenshot:
 * - dashboard bottom edge
 *   → rounded bottom border
 *   → soft diffused shadow (fully unclipped)
 *   → small clean breathing space (~32px)
 *   → feature strip
 * - Single hairline bottom border separating hero from the next section.
 * - Zero top border (border-t-0) — flows seamlessly out of the hero canvas.
 * - Generous horizontal gapping between lockups (mr-20 to mr-44).
 * - Deep 160px feathered edge fade on left & right viewport boundaries.
 * - Continuous, uninterrupted ambient movement (no hover pause).
 */
export default function InformationStrip() {
  // Duplicating the sequence ensures that Track 1 and Track 2 have identical width,
  // making a -50% translateX translation mathematically seamless across all screens.
  const trackItems = [...ITEMS, ...ITEMS];

  return (
    <div
      aria-label="Product highlights"
      style={{
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
      }}
      className="relative w-full overflow-hidden select-none bg-[#edf2f8] dark:bg-[#0c0e14] border-b border-black/[0.08] dark:border-white/[0.08] transition-colors duration-300 pt-12 sm:pt-16 md:pt-20 lg:pt-24 pb-4 sm:pb-5 md:pb-6"
    >
      <div className="w-full overflow-hidden marquee-edge-mask pointer-events-none">
        <div className="flex w-max will-change-transform animate-info-marquee">
          {/* Track 1 */}
          <div className="flex shrink-0 items-center">
            {trackItems.map((item, idx) => {
              const { Icon, title } = item;
              return (
                <div
                  key={`t1-${idx}`}
                  className="inline-flex items-center gap-2.5 sm:gap-3.5 mr-20 sm:mr-28 md:mr-36 lg:mr-44 text-[#94a3b8] dark:text-[#64748b]"
                >
                  <Icon
                    size={24}
                    weight="bold"
                    className="shrink-0 w-5 h-5 sm:w-6 sm:h-6 opacity-80"
                  />
                  <span className="font-['Space_Grotesk'] text-base sm:text-lg md:text-xl lg:text-[22px] font-bold tracking-[-0.02em] whitespace-nowrap opacity-85">
                    {title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Track 2 (Exact duplicate for seamless -50% translateX loop) */}
          <div className="flex shrink-0 items-center" aria-hidden="true">
            {trackItems.map((item, idx) => {
              const { Icon, title } = item;
              return (
                <div
                  key={`t2-${idx}`}
                  className="inline-flex items-center gap-2.5 sm:gap-3.5 mr-20 sm:mr-28 md:mr-36 lg:mr-44 text-[#94a3b8] dark:text-[#64748b]"
                >
                  <Icon
                    size={24}
                    weight="bold"
                    className="shrink-0 w-5 h-5 sm:w-6 sm:h-6 opacity-80"
                  />
                  <span className="font-['Space_Grotesk'] text-base sm:text-lg md:text-xl lg:text-[22px] font-bold tracking-[-0.02em] whitespace-nowrap opacity-85">
                    {title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
