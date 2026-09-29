import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/**
 * Bespoke Geometric Brand Icons (2.2 stroke weight, solid focal accents)
 */
function LoanIcon({ className = 'w-5 h-5 shrink-0' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="5" y="3.5" width="14" height="17" rx="2.5" stroke="currentColor" strokeWidth="2.2" />
      <line x1="8.5" y1="8.5" x2="15.5" y2="8.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="8.5" y1="12.5" x2="13.5" y2="12.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="15" cy="16" r="1.5" fill="currentColor" />
    </svg>
  );
}

function CustomerIcon({ className = 'w-5 h-5 shrink-0' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="7.5" r="4" stroke="currentColor" strokeWidth="2.2" />
      <path d="M4.5 19.5c0-3.6 3.4-6.5 7.5-6.5s7.5 2.9 7.5 6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1.6" fill="currentColor" />
    </svg>
  );
}

function PaymentIcon({ className = 'w-5 h-5 shrink-0' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3.5a8.5 8.5 0 0 1 8 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <polygon points="20.5,10 19,5.5 15.5,9" fill="currentColor" />
      <path d="M12 20.5a8.5 8.5 0 0 1-8-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <polygon points="3.5,14 5,18.5 8.5,15" fill="currentColor" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}

function RealTimeIcon({ className = 'w-5 h-5 shrink-0' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
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

function PortfolioIcon({ className = 'w-5 h-5 shrink-0' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3.5 A 8.5 8.5 0 1 0 20.5 12 H 12 Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M14.5 10 H 21 A 8.5 8.5 0 0 0 14.5 3.5 Z" fill="currentColor" />
    </svg>
  );
}

function ReportIcon({ className = 'w-5 h-5 shrink-0' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M14 3.5H6.5A2.5 2.5 0 0 0 4 6v12a2.5 2.5 0 0 0 2.5 2.5h11a2.5 2.5 0 0 0 2.5-2.5V9.5L14 3.5Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="14 3.5 14 9.5 20 9.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="8.5" y1="13.5" x2="15.5" y2="13.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="8.5" y1="16.5" x2="13" y2="16.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

const EXPLORE_CARDS = [
  {
    id: 'loan-management',
    title: 'Loan Management',
    description: 'Create loans, set repayment terms, calculate EMIs, and keep every lending agreement organized.',
    image: '/explore-loan-management.jpg',
    Icon: LoanIcon,
    isSolid: false,
  },
  {
    id: 'customer-management',
    title: 'Customer Management',
    description: 'Keep borrower profiles, contact details, loan history, and outstanding balances together.',
    image: '/explore-customer-management.jpg',
    Icon: CustomerIcon,
    isSolid: false,
  },
  {
    id: 'repayment-tracking',
    title: 'Repayment Tracking',
    description: 'Record every payment, monitor upcoming collections, and keep outstanding balances current.',
    image: '/explore-repayment-tracking.jpg',
    Icon: PaymentIcon,
    isSolid: false,
  },
  {
    id: 'realtime-communication',
    title: 'Real-Time Communication',
    description: 'Discuss loan terms, exchange documents, and stay updated with real-time delivery, read receipts, typing indicators, presence, and notifications.',
    image: '/explore-realtime-communication.jpg',
    Icon: RealTimeIcon,
    isSolid: false,
  },
  {
    id: 'portfolio-insights',
    title: 'Portfolio Insights',
    description: 'Monitor your lending activity, outstanding amounts, collections, and overall portfolio performance.',
    image: '/explore-portfolio-insights.jpg',
    Icon: PortfolioIcon,
    isSolid: false,
  },
  {
    id: 'reports-and-documents',
    title: 'Reports & Documents',
    description: 'Generate invoices, receipts, statements, and business records whenever you need them.',
    image: null,
    Icon: ReportIcon,
    isSolid: true,
  },
];

export default function Explore() {
  const shouldReduceMotion = useReducedMotion();
  const trackRef = useRef(null);
  const containerRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const hasInteractedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const isAutoScrollingRef = useRef(false);
  const autoScrollTimerRef = useRef(null);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoScrollTimerRef.current) clearTimeout(autoScrollTimerRef.current);
    };
  }, []);

  const dismissHint = useCallback(() => {
    if (!hasInteractedRef.current) {
      hasInteractedRef.current = true;
      setShowHint(false);
    }
  }, []);

  // Calculate focal point where the active card pops out (left-center on desktop, center on mobile)
  const getFocalOffset = useCallback((containerWidth) => {
    return window.innerWidth < 768
      ? containerWidth * 0.5
      : Math.min(containerWidth * 0.32, 440);
  }, []);

  // Smoothly scroll to a specific card index and trigger immediate pop
  const scrollToCard = useCallback((idx) => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;
    const child = track.children[idx];
    if (!child) return;

    dismissHint();
    setActiveIndex(idx);

    isAutoScrollingRef.current = true;
    if (autoScrollTimerRef.current) clearTimeout(autoScrollTimerRef.current);
    autoScrollTimerRef.current = setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, 600);

    const focalPoint = getFocalOffset(container.clientWidth);
    const cardLeft = child.offsetLeft;
    const cardWidth = child.offsetWidth;
    const targetScroll = cardLeft - focalPoint + cardWidth / 2;

    container.scrollTo({
      left: Math.max(0, targetScroll),
      behavior: 'smooth',
    });
  }, [getFocalOffset, dismissHint]);

  // Wrap-around Next / Prev navigation: last card -> 1st card, 1st card -> last card
  const handleNext = useCallback(() => {
    dismissHint();
    const nextIdx = activeIndex >= EXPLORE_CARDS.length - 1 ? 0 : activeIndex + 1;
    scrollToCard(nextIdx);
  }, [activeIndex, dismissHint, scrollToCard]);

  const handlePrev = useCallback(() => {
    dismissHint();
    const prevIdx = activeIndex <= 0 ? EXPLORE_CARDS.length - 1 : activeIndex - 1;
    scrollToCard(prevIdx);
  }, [activeIndex, dismissHint, scrollToCard]);

  // Recalculate which card center is closest to the focal point as the user scrolls
  const handleScroll = useCallback(() => {
    if (isAutoScrollingRef.current) return;
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const maxScroll = container.scrollWidth - container.clientWidth;
    if (maxScroll > 10) {
      if (container.scrollLeft <= 25) {
        setActiveIndex(0);
        return;
      }
      if (container.scrollLeft >= maxScroll - 35) {
        setActiveIndex(EXPLORE_CARDS.length - 1);
        return;
      }
    }

    const containerRect = container.getBoundingClientRect();
    const focalPoint = containerRect.left + getFocalOffset(containerRect.width);

    const children = track.children;
    let closestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < children.length; i++) {
      const cardRect = children[i].getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(cardCenter - focalPoint);
      if (distance < minDistance) {
        minDistance = distance;
        closestIdx = i;
      }
    }

    setActiveIndex((prev) => (prev !== closestIdx ? closestIdx : prev));
  }, [getFocalOffset]);

  // Desktop Pointer Drag handlers (allowing grab cursor & natural drag)
  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (autoScrollTimerRef.current) clearTimeout(autoScrollTimerRef.current);
    isAutoScrollingRef.current = false;
    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = e.clientX;
    startScrollLeftRef.current = containerRef.current.scrollLeft;
    hasMovedRef.current = false;
    dismissHint();

    if (containerRef.current.setPointerCapture) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    if (Math.abs(deltaX) > 4) {
      hasMovedRef.current = true;
      dismissHint();
    }
    containerRef.current.scrollLeft = startScrollLeftRef.current - deltaX;
  };

  const handlePointerUp = (e) => {
    isDraggingRef.current = false;
    setIsDragging(false);
    if (containerRef.current?.releasePointerCapture && e.pointerId) {
      try {
        containerRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // Safe fallback if pointer wasn't captured
      }
    }
  };

  const handleCardClick = (idx) => {
    if (hasMovedRef.current) return;
    scrollToCard(idx);
  };

  const introVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section
      id="explore"
      className="relative w-full bg-[#f8faff] dark:bg-[#0c0e14] border-t border-black/[0.04] dark:border-white/[0.04] transition-colors duration-300 pt-0 sm:pt-2 lg:pt-4 -mt-10 sm:-mt-14 lg:-mt-20 pb-8 sm:pb-10 lg:pb-12 overflow-hidden"
    >
      {/* ── Centered Section Header ── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center select-none pt-10 sm:pt-12 mb-3 sm:mb-4">
        <motion.div
          variants={introVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#e8eef9] dark:bg-[#151c28] border border-[#d2def2] dark:border-[#222e44] text-[#335384] dark:text-[#93b4e6] text-[11px] sm:text-xs font-bold tracking-[0.08em] uppercase mb-4 sm:mb-5 shadow-2xs">
            EXPLORE
          </div>

          {/* Large Editorial Heading */}
          <h2 className="font-display font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold text-[#0c0d12] dark:text-white tracking-[-0.035em] leading-[1.08] mb-3.5 sm:mb-4 max-w-[800px] mx-auto">
            Everything Your Lending Business Needs
          </h2>

          {/* Short Supporting Paragraph */}
          <p className="text-base sm:text-lg text-[#526077] dark:text-[#94a3b8] max-w-[620px] mx-auto leading-relaxed font-normal">
            From customer management to repayments and portfolio visibility, keep the work behind every loan organized in one place.
          </p>
        </motion.div>
      </div>

      {/* ── Subtle Discoverable Drag Hint (Fades out upon any interaction) ── */}
      <div className="h-6 flex items-center justify-center select-none">
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4, transition: { duration: 0.3 } }}
              className="flex items-center gap-2 text-[11px] sm:text-xs font-mono font-medium tracking-[0.14em] uppercase text-[#64748b] dark:text-[#94a3b8] pointer-events-none"
            >
              <span className="opacity-50">←</span>
              <span>DRAG TO EXPLORE</span>
              <span className="opacity-50">→</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Carousel Container with Floating Side Arrow Buttons at Card/Cursor Height ── */}
      <div className="relative w-full group">
        {/* Floating Left/Previous Arrow Button (Vertically centered at card height, right at cursor level) */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous card"
          className="absolute left-3 sm:left-5 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/90 dark:bg-[#151c28]/90 backdrop-blur-md border border-black/10 dark:border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] text-[#0c0d12] dark:text-white flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-white dark:hover:bg-[#1e2738] active:scale-95 cursor-pointer"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        {/* Floating Right/Next Arrow Button (Vertically centered at card height, right at cursor level) */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next card"
          className="absolute right-3 sm:right-5 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/90 dark:bg-[#151c28]/90 backdrop-blur-md border border-black/10 dark:border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] text-[#0c0d12] dark:text-white flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-white dark:hover:bg-[#1e2738] active:scale-95 cursor-pointer"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>

        {/* ── Horizontal Feature Carousel Track (Drag / Trackpad / Swipe) ── */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`w-full overflow-x-auto select-none pt-10 sm:pt-12 pb-4 sm:pb-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          <div
            ref={trackRef}
            className="flex gap-6 sm:gap-8 lg:gap-10 items-end w-max"
            style={{
              paddingLeft: 'max(1.5rem, calc((100vw - 80rem) / 2 + 2rem))',
              paddingRight: 'max(6rem, calc(72vw - 160px))',
            }}
          >
            {EXPLORE_CARDS.map((card, idx) => {
              const { title, description, image, Icon, isSolid } = card;
              const isActive = idx === activeIndex;

              // Active Card Pop-Out: translateY (-44px desktop / -24px mobile), scale up (1.02), high z-index
              return (
                <motion.div
                  key={card.id}
                  onClick={() => handleCardClick(idx)}
                  animate={{
                    y: shouldReduceMotion ? 0 : isActive ? -44 : 0,
                    scale: shouldReduceMotion ? 1 : isActive ? 1.02 : 1,
                    zIndex: isActive ? 20 : 1,
                    opacity: isActive ? 1 : 0.88,
                  }}
                  transition={{
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`relative w-[280px] sm:w-[330px] md:w-[360px] lg:w-[390px] h-[480px] sm:h-[530px] lg:h-[580px] shrink-0 rounded-[28px] sm:rounded-[32px] overflow-hidden flex flex-col justify-between p-7 sm:p-9 lg:p-10 isolate cursor-pointer transition-shadow duration-300 ${
                    isActive
                      ? 'shadow-[0_28px_70px_-15px_rgba(15,23,42,0.24)] dark:shadow-[0_32px_80px_-15px_rgba(0,0,0,0.7)] ring-1 ring-black/10 dark:ring-white/20'
                      : 'shadow-[0_14px_40px_-15px_rgba(15,23,42,0.08)] dark:shadow-[0_18px_50px_-15px_rgba(0,0,0,0.45)]'
                  }`}
                >
                  {/* ── Photographic Background or Solid Editorial Treatment ── */}
                  {!isSolid && image ? (
                    <>
                      <img
                        src={image}
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none block"
                        loading="lazy"
                        decoding="async"
                      />
                      {/* Subtle bottom gradient to ensure text readability without darkening entire photo */}
                      <div
                        className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/85 via-black/30 to-transparent"
                        aria-hidden="true"
                      />
                      {/* Hairline inner rim reflection */}
                      <div
                        className="absolute inset-0 pointer-events-none rounded-[inherit] ring-1 ring-inset ring-white/15"
                        aria-hidden="true"
                      />
                    </>
                  ) : (
                    /* Card 6: Strong Credix-Inspired Editorial Solid-Color Card */
                    <>
                      <div
                        className="absolute inset-0 bg-[#eef4fc] dark:bg-[#131b2e] border border-[#d2def0] dark:border-white/10 rounded-[inherit]"
                        aria-hidden="true"
                      />
                      {/* Subtle architectural ambient accent */}
                      <div
                        className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_80%_20%,rgba(37,99,235,0.09),transparent_65%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(96,165,250,0.12),transparent_65%)]"
                        aria-hidden="true"
                      />
                      {/* Hairline inner rim */}
                      <div
                        className="absolute inset-0 pointer-events-none rounded-[inherit] ring-1 ring-inset ring-black/5 dark:ring-white/10"
                        aria-hidden="true"
                      />
                    </>
                  )}

                  {/* ── Upper Area: Restrained Icon Badge ── */}
                  <div className="relative z-10">
                    <div
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                        isSolid
                          ? 'bg-white dark:bg-white/10 border border-[#c6d7ee] dark:border-white/15 text-[#1e3a8a] dark:text-white'
                          : 'bg-black/35 dark:bg-black/45 backdrop-blur-md border border-white/20 text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                    </div>
                  </div>

                  {/* ── Lower Area: Title and Description ── */}
                  <div className="relative z-10 mt-auto">
                    <h3
                      className={`font-display font-['Space_Grotesk'] text-2xl sm:text-[28px] lg:text-[32px] font-bold tracking-[-0.025em] leading-[1.15] mb-3 sm:mb-3.5 ${
                        isSolid ? 'text-[#0c0d12] dark:text-white' : 'text-white'
                      }`}
                    >
                      {title}
                    </h3>
                    <p
                      className={`text-[14px] sm:text-[15px] lg:text-[16px] leading-[1.6] font-normal max-w-[360px] ${
                        isSolid
                          ? 'text-[#475569] dark:text-[#94a3b8]'
                          : 'text-white/85'
                      }`}
                    >
                      {description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Integrated Progress Indicator, Progress Line & Small Fallback Arrows ── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mt-3 sm:mt-4 flex items-center justify-between select-none">
        {/* Step Indicator & Subtle Horizontal Progress Line */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-xs sm:text-sm font-mono font-medium tracking-wider text-[#64748b] dark:text-[#94a3b8]">
            <span className="text-[#0c0d12] dark:text-white font-semibold">
              {String(activeIndex + 1).padStart(2, '0')}
            </span>
            <span className="mx-1 opacity-40">/</span>
            <span>{String(EXPLORE_CARDS.length).padStart(2, '0')}</span>
          </div>

          {/* Horizontal Progress Line representing position through 6 cards */}
          <div className="w-24 sm:w-36 md:w-44 h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#2563eb] dark:bg-[#60a5fa] rounded-full"
              animate={{
                width: `${((activeIndex + 1) / EXPLORE_CARDS.length) * 100}%`,
              }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        {/* Small Fallback Navigation Arrow Buttons (Close to progress bar, zero void) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous card"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#151c28] text-[#0c0d12] dark:text-white flex items-center justify-center transition-all duration-200 hover:bg-[#edf2fa] dark:hover:bg-[#1e2738] active:scale-95 shadow-2xs cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next card"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-[#151c28] text-[#0c0d12] dark:text-white flex items-center justify-center transition-all duration-200 hover:bg-[#edf2fa] dark:hover:bg-[#1e2738] active:scale-95 shadow-2xs cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
