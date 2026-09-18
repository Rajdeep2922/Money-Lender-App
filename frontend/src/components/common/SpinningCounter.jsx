import React, { useState, useEffect, useRef, useId, useMemo } from 'react';
import { formatCurrency } from '../../utils/formatters';

// Transitions.dev — Spinning counter CSS
const __REEL_STYLES = `
:root {
  --reel-dur: 1400ms;
  --reel-cell: 1.15em;
  --reel-spin-blur: 3px;
  --reel-stagger: 90ms;
  --reel-ease: cubic-bezier(0.16, 1, 0.3, 1);
}

.t-reel {
  display: inline-flex;
  align-items: center;
  height: var(--reel-cell, 1.15em);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.t-reel-col {
  position: relative;
  height: var(--reel-cell, 1.15em);
  overflow: hidden;
  display: inline-flex;
  flex-direction: column;
  /* Soft-fade the window edges instead of hard-cropping. */
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%);
}

.t-reel-strip {
  display: flex;
  flex-direction: column;
  will-change: transform, filter;
}

.t-reel-digit {
  height: var(--reel-cell, 1.15em);
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.t-reel-char {
  display: inline-flex;
  align-items: center;
  height: var(--reel-cell, 1.15em);
  line-height: 1;
}

@media (prefers-reduced-motion: reduce) {
  .t-reel-strip {
    transition: none !important;
    filter: none !important;
  }
}
`;

if (typeof document !== 'undefined' && !document.getElementById('transitions-p21-reel')) {
  const __style = document.createElement('style');
  __style.id = 'transitions-p21-reel';
  __style.textContent = __REEL_STYLES;
  document.head.appendChild(__style);
}

/**
 * Single Column Reel for a digit (0-9)
 */
function ReelColumn({
  digit,
  colIndex,
  spins = 2,
  duration = 1400,
  stagger = 90,
  maxBlur = 3,
  filterId,
}) {
  const targetDigit = parseInt(digit, 10) || 0;
  const stripRef = useRef(null);
  const feBlurRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  // Build repeated strip of digits: e.g. spins + 1 cycles of 0..9
  const stripDigits = useMemo(() => {
    const list = [];
    const cycles = spins + 2; // e.g. 4 cycles for spins=2
    for (let c = 0; c < cycles; c++) {
      for (let d = 0; d < 10; d++) {
        list.push(d);
      }
    }
    return list;
  }, [spins]);

  // Target index in the strip
  const targetIndex = spins * 10 + targetDigit;

  useEffect(() => {
    // Check reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (stripRef.current) {
        stripRef.current.style.transform = `translateY(calc(-1 * var(--reel-cell, 1.15em) * ${targetIndex}))`;
        stripRef.current.style.transition = 'none';
      }
      return;
    }

    // Set initial 0 position before kicking off animation
    if (stripRef.current) {
      stripRef.current.style.transition = 'none';
      stripRef.current.style.transform = 'translateY(0)';
    }

    const rafId = requestAnimationFrame(() => {
      setMounted(true);
      if (!stripRef.current) return;

      const delay = colIndex * stagger;
      stripRef.current.style.transition = `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`;
      stripRef.current.style.transform = `translateY(calc(-1 * var(--reel-cell, 1.15em) * ${targetIndex}))`;

      // Directional SVG blur decay animation
      if (feBlurRef.current && maxBlur > 0) {
        let animId = null;
        const startTime = performance.now();

        const updateBlur = (now) => {
          const elapsed = now - startTime - delay;

          if (elapsed < 0) {
            feBlurRef.current?.setAttribute('stdDeviation', '0 0');
            animId = requestAnimationFrame(updateBlur);
          } else if (elapsed >= duration) {
            feBlurRef.current?.setAttribute('stdDeviation', '0 0');
            if (stripRef.current) stripRef.current.style.filter = 'none';
          } else {
            // Cubic bezier deceleration decay: velocity drops as it approaches destination
            const progress = elapsed / duration;
            const currentBlur = maxBlur * Math.pow(1 - progress, 2);
            feBlurRef.current?.setAttribute('stdDeviation', `0 ${currentBlur.toFixed(2)}`);
            animId = requestAnimationFrame(updateBlur);
          }
        };

        animId = requestAnimationFrame(updateBlur);
        return () => {
          if (animId) cancelAnimationFrame(animId);
        };
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [targetIndex, colIndex, duration, stagger, maxBlur]);

  return (
    <div className="t-reel-col" aria-hidden="true">
      {/* SVG vertical-only directional blur filter for this column */}
      <svg
        width="0"
        height="0"
        className="absolute pointer-events-none opacity-0"
        aria-hidden="true"
      >
        <filter id={filterId}>
          <feGaussianBlur ref={feBlurRef} in="SourceGraphic" stdDeviation="0 0" />
        </filter>
      </svg>

      <div
        ref={stripRef}
        className="t-reel-strip"
        style={{ filter: `url(#${filterId})` }}
      >
        {stripDigits.map((d, idx) => (
          <div key={idx} className="t-reel-digit">
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * SpinningCounter Component (Transitions.dev)
 *
 * Renders currency amounts or numbers with spinning digit reels and
 * vertical-only motion blur streaks.
 *
 * @param {Object} props
 * @param {number|string} props.value Number or pre-formatted value
 * @param {boolean} [props.isCurrency=true] Whether to format as currency if number is passed
 * @param {Function} [props.format] Custom formatter function
 * @param {string} [props.className] Additional CSS classes
 * @param {number} [props.spins=2] Number of full 0-9 spins before landing
 * @param {number} [props.duration=1400] Total duration in ms
 * @param {number} [props.stagger=90] Stagger delay per digit in ms
 */
export function SpinningCounter({
  value,
  isCurrency = false,
  format,
  className = '',
  spins = 2,
  duration = 1400,
  stagger = 90,
  maxBlur = 2.8,
}) {
  const baseId = useId().replace(/[^a-zA-Z0-9_-]/g, '');

  const displayString = useMemo(() => {
    if (value === undefined || value === null) return '0';
    if (format && typeof format === 'function') {
      return String(format(value));
    }
    if (isCurrency && typeof value === 'number') {
      return formatCurrency(value);
    }
    if (typeof value === 'number') {
      return new Intl.NumberFormat('en-IN').format(value);
    }
    return String(value);
  }, [value, isCurrency, format]);

  // Track digit column index separately from characters (commas, currency symbols, spaces)
  let digitColCounter = 0;

  return (
    <span
      className={`t-reel ${className}`}
      role="text"
      aria-label={displayString}
    >
      {displayString.split('').map((char, index) => {
        const isDigit = /[0-9]/.test(char);

        if (!isDigit) {
          return (
            <span
              key={`char-${index}`}
              className="t-reel-char"
              aria-hidden="true"
            >
              {char}
            </span>
          );
        }

        const colIndex = digitColCounter++;
        const colFilterId = `reel-blur-${baseId}-${colIndex}`;

        return (
          <ReelColumn
            key={`col-${colIndex}`}
            digit={char}
            colIndex={colIndex}
            spins={spins}
            duration={duration}
            stagger={stagger}
            maxBlur={maxBlur}
            filterId={colFilterId}
          />
        );
      })}
    </span>
  );
}

export default SpinningCounter;
