import React, { useRef, useState, useEffect, useCallback } from 'react';
import { MagnifyingGlass, X } from '@phosphor-icons/react';

// Transitions.dev — Input clear with dissolve CSS (without flash glow)
const __TRANSITION_STYLES = `
:root {
  --clear-dur: 450ms;
  --clear-out-dur: 380ms;
  --clear-in-dur: 380ms;
  --clear-out-fly: 12px;
  --clear-in-fly: 12px;
  --clear-out-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --clear-in-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --clear-blur: 2px;
}

.t-clear {
  position: relative;
  overflow: hidden;
  border: 1.5px solid #0c0d12;
  box-shadow: 3px 3px 0px #0c0d12;
  background-color: #ffffff;
  color: #0c0d12;
  transition:
    box-shadow 200ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 200ms ease,
    background-color 200ms ease,
    color 200ms ease;
}

.dark .t-clear {
  background-color: #141722 !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35) !important;
  color: #f1f5f9 !important;
}

.t-clear:hover {
  border-color: #0c0d12;
}

.dark .t-clear:hover {
  border-color: rgba(255, 255, 255, 0.22) !important;
}

.t-clear:focus-within {
  box-shadow: 4px 4px 0px #0c0d12;
  border-color: #2563eb;
}

.dark .t-clear:focus-within {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3), 0 2px 10px rgba(0, 0, 0, 0.45) !important;
}

.t-clear-mirror,
.t-clear-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  pointer-events: none;
  white-space: nowrap;
  overflow: hidden;
  z-index: 2;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  letter-spacing: inherit;
}

.t-clear-mirror {
  opacity: 0;
}

.t-clear.has-value .t-clear-mirror,
.t-clear.is-clearing .t-clear-mirror {
  opacity: 1;
}

.t-clear.has-value > input,
.t-clear.is-clearing > input,
.t-clear.has-value input,
.t-clear.is-clearing input {
  -webkit-text-fill-color: transparent;
}

.t-clear.has-value .t-clear-placeholder {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .t-clear-mirror,
  .t-clear-placeholder {
    transition: none !important;
  }
}
`;

if (typeof document !== 'undefined') {
  let __style = document.getElementById('transitions-p20-clear');
  if (!__style) {
    __style = document.createElement('style');
    __style.id = 'transitions-p20-clear';
    document.head.appendChild(__style);
  }
  __style.textContent = __TRANSITION_STYLES;
}

// Cubic bezier evaluator for (0.22, 1, 0.36, 1)
function cubicBezier(p1x, p1y, p2x, p2y) {
  return function (t) {
    let u = 0.5;
    for (let i = 0; i < 8; i++) {
      const currentX = 3 * (1 - u) * (1 - u) * u * p1x + 3 * (1 - u) * u * u * p2x + u * u * u;
      const dx = 3 * (1 - u) * (1 - u) * p1x + 6 * (1 - u) * u * (p2x - p1x) + 3 * u * u * (1 - p2x);
      if (Math.abs(dx) < 1e-6) break;
      u -= (currentX - t) / dx;
      u = Math.max(0, Math.min(1, u));
    }
    return 3 * (1 - u) * (1 - u) * u * p1y + 3 * (1 - u) * u * u * p2y + u * u * u;
  };
}

const easeCubic = cubicBezier(0.22, 1, 0.36, 1);

function getTokens(root) {
  const s = getComputedStyle(root || document.documentElement);
  const parseNum = (prop, fallback) => {
    const val = parseFloat(s.getPropertyValue(prop));
    return isNaN(val) ? fallback : val;
  };
  return {
    clearDur: parseNum('--clear-dur', 450),
    clearOutDur: parseNum('--clear-out-dur', 380),
    clearInDur: parseNum('--clear-in-dur', 380),
    clearOutFly: parseNum('--clear-out-fly', 12),
    clearInFly: parseNum('--clear-in-fly', 12),
    clearBlur: parseNum('--clear-blur', 2),
  };
}

/**
 * InputClear Component (Transitions.dev)
 *
 * Sized like a pill search input with a live mirror and smooth text dissolve
 * fly-up and placeholder fly-in animation on clear (without flash glow).
 */
export function InputClear({
  value: valueProp,
  onChange,
  onClear,
  onSubmit,
  placeholder = 'Search customers, loans, payments...',
  className = '',
  icon = <MagnifyingGlass size={16} weight="regular" className="text-[#94a3b8] dark:text-gray-400 shrink-0" />,
  ...rest
}) {
  const [internalValue, setInternalValue] = useState(valueProp !== undefined ? valueProp : '');
  const [isClearing, setIsClearing] = useState(false);

  const isControlled = valueProp !== undefined;
  const currentValue = isControlled ? valueProp : internalValue;
  const hasValue = Boolean(currentValue && currentValue.length > 0);

  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const mirrorRef = useRef(null);
  const placeholderRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (isControlled) {
      setInternalValue(valueProp || '');
    }
  }, [isControlled, valueProp]);

  // Cleanup active animation on unmount
  useEffect(() => {
    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const nextVal = e.target.value;
    if (!isControlled) {
      setInternalValue(nextVal);
    }
    if (onChange) {
      onChange(e);
    }
  };

  const handleInputScroll = () => {
    if (mirrorRef.current && inputRef.current) {
      mirrorRef.current.scrollLeft = inputRef.current.scrollLeft;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && hasValue && !isClearing) {
      e.preventDefault();
      handleClear();
    } else if (e.key === 'Enter' && onSubmit) {
      onSubmit(currentValue);
    }
  };

  const handleClear = useCallback(() => {
    if (isClearing || !hasValue) return;

    const wrapEl = wrapRef.current;
    const inputEl = inputRef.current;
    const mirrorEl = mirrorRef.current;
    const placeholderEl = placeholderRef.current;

    if (!wrapEl || !inputEl || !mirrorEl || !placeholderEl) {
      if (!isControlled) setInternalValue('');
      if (onChange) onChange({ target: { value: '' } });
      if (onClear) onClear();
      return;
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      if (!isControlled) setInternalValue('');
      if (onChange) onChange({ target: { value: '' } });
      if (onClear) onClear();
      inputEl.value = '';
      inputEl.scrollLeft = 0;
      inputEl.focus({ preventScroll: true });
      return;
    }

    setIsClearing(true);
    wrapEl.classList.add('is-clearing');

    const tokens = getTokens(wrapEl);
    const startTime = performance.now();
    const totalDuration = Math.max(tokens.clearOutDur, tokens.clearInDur + 50);

    const frame = (now) => {
      const elapsed = now - startTime;

      // 1. Mirror: fly up (-clearOutFly), blur, fade out
      const outP = Math.min(1, Math.max(0, elapsed / tokens.clearOutDur));
      const outEase = easeCubic(outP);
      const mirrorY = -(outEase * tokens.clearOutFly);
      const mirrorOpacity = Math.max(0, 1 - outEase);
      const mirrorBlur = outEase * tokens.clearBlur;

      mirrorEl.style.transform = `translateY(${mirrorY.toFixed(2)}px)`;
      mirrorEl.style.opacity = mirrorOpacity.toFixed(3);
      mirrorEl.style.filter = `blur(${mirrorBlur.toFixed(2)}px)`;

      // 2. Placeholder: ease in from below (+clearInFly) to 0
      const inStart = 50;
      const inP = Math.min(1, Math.max(0, (elapsed - inStart) / tokens.clearInDur));
      const inEase = easeCubic(inP);
      const placeholderY = (1 - inEase) * tokens.clearInFly;
      const placeholderOpacity = inEase;

      placeholderEl.style.transform = `translateY(${placeholderY.toFixed(2)}px)`;
      placeholderEl.style.opacity = placeholderOpacity.toFixed(3);

      if (elapsed < totalDuration) {
        animRef.current = requestAnimationFrame(frame);
      } else {
        // Freeze end-state visuals smoothly so there is zero jump/jitter while React updates
        mirrorEl.style.transform = `translateY(-${tokens.clearOutFly}px)`;
        mirrorEl.style.opacity = '0';
        mirrorEl.style.filter = `blur(${tokens.clearBlur}px)`;

        placeholderEl.style.transform = 'translateY(0px)';
        placeholderEl.style.opacity = '1';

        // Reset real input value and scroll
        if (inputEl) {
          inputEl.value = '';
          inputEl.scrollLeft = 0;
          inputEl.focus({ preventScroll: true });
        }
        if (mirrorEl) {
          mirrorEl.scrollLeft = 0;
        }

        // Notify state update
        if (!isControlled) {
          setInternalValue('');
        }
        if (onChange) {
          onChange({ target: { value: '' } });
        }
        if (onClear) onClear();

        // Allow React to commit the empty state (hasValue -> false)
        // before clearing inline styles and the is-clearing class
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            wrapEl.classList.remove('is-clearing');
            setIsClearing(false);

            mirrorEl.style.transform = '';
            mirrorEl.style.opacity = '';
            mirrorEl.style.filter = '';

            placeholderEl.style.transform = '';
            placeholderEl.style.opacity = '';
          });
        });
      }
    };

    animRef.current = requestAnimationFrame(frame);
  }, [isClearing, hasValue, isControlled, onChange, onClear]);

  const handleWrapClick = (e) => {
    if (e.target.closest('button')) return;
    inputRef.current?.focus({ preventScroll: true });
  };

  // Split value into words
  const words = currentValue.split(/(\s+)/);

  return (
    <div
      ref={wrapRef}
      onClick={handleWrapClick}
      className={`t-clear cursor-text ${hasValue ? 'has-value' : ''} ${className}`}
    >
      {/* Search Icon */}
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
        {icon}
      </div>

      {/* Real input */}
      <input
        ref={inputRef}
        type="text"
        value={currentValue}
        onChange={handleInputChange}
        onScroll={handleInputScroll}
        onKeyDown={handleKeyDown}
        className="w-full h-full pl-9 pr-8 bg-transparent border-0 outline-none text-[inherit] text-[#0c0d12] dark:text-white caret-[#2563eb] dark:caret-blue-400 placeholder-transparent select-text"
        {...rest}
      />

      {/* Mirror (visualizes value per word for dissolve tracking) */}
      <div
        ref={mirrorRef}
        className="t-clear-mirror pl-9 pr-8 text-[#0c0d12] dark:text-white select-none"
        aria-hidden="true"
      >
        {words.map((chunk, i) =>
          /\s+/.test(chunk) ? (
            <span key={i} className="inline-block whitespace-pre">
              {chunk}
            </span>
          ) : (
            <span key={i} className="t-clear-word inline-block">
              {chunk}
            </span>
          )
        )}
      </div>

      {/* Placeholder (fly-in empty state) */}
      <div
        ref={placeholderRef}
        className="t-clear-placeholder pl-9 pr-8 text-[#94a3b8] dark:text-gray-400 select-none"
        aria-hidden="true"
      >
        <span className="truncate">{placeholder}</span>
      </div>

      {/* Clear Button */}
      <button
        type="button"
        tabIndex={hasValue && !isClearing ? 0 : -1}
        onClick={handleClear}
        aria-label="Clear search"
        className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-[#0c0d12] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer z-10 ${
          hasValue && !isClearing
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-75 pointer-events-none'
        }`}
      >
        <X size={12} weight="bold" />
      </button>
    </div>
  );
}

export default InputClear;
