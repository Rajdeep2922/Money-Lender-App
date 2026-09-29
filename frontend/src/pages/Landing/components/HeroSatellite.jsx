import React, { forwardRef } from 'react';
import {
  CreditCard,
  ShieldCheck,
  FilePlus,
  Clock,
  ArrowUpRight,
  CheckCircle,
} from '@phosphor-icons/react';

/**
 * Satellite configuration metadata
 * Exactly 4 primary floating financial satellites as required by the spec.
 */
export const SATELLITE_CONFIGS = [
  {
    id: 'payment-received',
    num: 1,
    positionClass: 'top-[-16px] left-[-6px] sm:left-[-10px] lg:top-[2%] lg:left-[-28px] xl:left-[-42px]',
    parallaxFactor: 1.4,
    zIndexClass: 'z-30',
    icon: CreditCard,
    iconColorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/50',
    tag: 'Verified',
    headline: '+₹15,000',
    headlineColor: 'text-[#0c0d12] dark:text-white',
    subtext: 'Payment Received',
    detail: 'Rakesh S. • Instant Ledger',
    desktopOnly: false,
  },
  {
    id: 'portfolio-healthy',
    num: 2,
    positionClass: 'top-[-12px] right-[-6px] sm:right-[-10px] lg:top-[1%] lg:right-[-18px] xl:right-[-30px]',
    parallaxFactor: 0.6,
    zIndexClass: 'z-10',
    icon: ShieldCheck,
    iconColorClass: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800/50',
    tag: '100% On Schedule',
    headline: 'Portfolio Healthy',
    headlineColor: 'text-[#0c0d12] dark:text-white',
    subtext: 'All loans on schedule',
    detail: '0 Overdue accounts',
    desktopOnly: true,
  },
  {
    id: 'new-loan',
    num: 3,
    positionClass: 'bottom-[-14px] left-[-6px] sm:left-[-10px] lg:bottom-[5%] lg:left-[-30px] xl:left-[-44px]',
    parallaxFactor: 1.25,
    zIndexClass: 'z-30',
    icon: FilePlus,
    iconColorClass: 'text-[#2563eb] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800/50',
    tag: 'Disbursed',
    headline: '₹1,50,000',
    headlineColor: 'text-[#2563eb] dark:text-blue-400',
    subtext: 'New Loan Originated',
    detail: '14.0% APR • 12 Months',
    desktopOnly: true,
  },
  {
    id: 'emi-due',
    num: 4,
    positionClass: 'bottom-[-16px] right-[-6px] sm:right-[-10px] lg:bottom-[4%] lg:right-[-18px] xl:right-[-30px]',
    parallaxFactor: 0.8,
    zIndexClass: 'z-10',
    icon: Clock,
    iconColorClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/50',
    tag: 'Due Today',
    headline: '₹8,450',
    headlineColor: 'text-[#0c0d12] dark:text-white',
    subtext: 'EMI Due Today',
    detail: 'Auto-reminder active',
    desktopOnly: false,
  },
];

/**
 * HeroSatellite Component
 * Represents a single floating product micro-card with high-contrast brutalist borders,
 * specular reflection, and GPU-accelerated translate3d transform ref.
 */
export const HeroSatellite = forwardRef(function HeroSatellite(
  { config, className = '' },
  ref
) {
  const Icon = config.icon;

  return (
    <div
      ref={ref}
      data-satellite-id={config.id}
      data-parallax-factor={config.parallaxFactor}
      className={`hero-satellite absolute select-none ${config.zIndexClass || 'z-20'} will-change-transform pointer-events-none sm:pointer-events-auto transition-opacity duration-300 ${config.positionClass} ${className}`}
    >
      <div className={`relative group p-3 sm:p-3.5 rounded-[20px] bg-white/95 dark:bg-[#141722]/95 border-2 border-[#0c0d12] dark:border-[#283044] shadow-[4px_4px_0px_#0c0d12] dark:shadow-[4px_4px_0px_#000000] backdrop-blur-md transition-all duration-200 min-w-[190px] sm:min-w-[210px] max-w-[240px] satellite-card satellite-card-${config.num}`}>
        {/* Specular sheen top reflection */}
        <div
          className="absolute inset-0 rounded-[18px] pointer-events-none opacity-60"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 60%)',
          }}
        />

        {/* Top row: Icon + Status Pill */}
        <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center border ${config.iconColorClass}`}
          >
            <Icon size={16} weight="bold" />
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[#526077] dark:text-gray-300 border border-black/[0.05] dark:border-white/[0.08] tracking-tight">
            {config.tag}
          </span>
        </div>

        {/* Content row */}
        <div className="relative z-10">
          <p
            className={`text-base sm:text-lg font-extrabold tracking-tight tabular-nums leading-tight ${config.headlineColor}`}
          >
            {config.headline}
          </p>
          <p className="text-xs font-semibold text-[#0c0d12] dark:text-gray-200 mt-0.5 leading-snug">
            {config.subtext}
          </p>
          <div className="flex items-center gap-1 mt-1 text-[10.5px] text-[#526077] dark:text-gray-400">
            <CheckCircle size={12} weight="fill" className="text-emerald-500 shrink-0" />
            <span className="truncate">{config.detail}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default HeroSatellite;
