import React, { useState, useEffect, useRef } from 'react';

/**
 * Transitions.dev — Notification badge
 *
 * Usage:
 *   Place inside any trigger with `position: relative` (e.g. Bell icon, button):
 *   <button className="relative ...">
 *     <Bell />
 *     <NotificationBadge count={unreadCount} />
 *   </button>
 *
 * State:
 *   Toggles `data-open="true"` / `"false"` on .t-badge.
 *   Only the badge slides + pops — the trigger itself stays put.
 */

const BADGE_STYLES_ID = 't-badge-styles';

function injectBadgeStyles() {
    if (typeof document === 'undefined' || document.getElementById(BADGE_STYLES_ID)) return;
    const style = document.createElement('style');
    style.id = BADGE_STYLES_ID;
    style.textContent = `
:root {
  --badge-slide-dur: 260ms;
  --badge-pop-dur: 500ms;
  --badge-pop-close-dur: 180ms;
  --badge-fade-dur: 400ms;
  --badge-fade-close-dur: 180ms;
  --badge-blur: 2px;
  --badge-offset-x: -8.2px;
  --badge-offset-y: 12.4px;
  --badge-slide-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --badge-pop-ease: cubic-bezier(0.34, 1.36, 0.64, 1);
  --badge-close-ease: cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes t-badge-slide-in {
  from { transform: translate(var(--badge-offset-x), var(--badge-offset-y)); }
  to   { transform: translate(0, 0); }
}

.t-badge {
  position: absolute;
  top: var(--badge-top, -3px);
  right: var(--badge-right, -3px);
  pointer-events: none;
  will-change: transform;
  z-index: 10;
}

.t-badge[data-open="true"] {
  animation: t-badge-slide-in var(--badge-slide-dur) var(--badge-slide-ease);
}

.t-badge-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: center;
  transform: scale(1);
  opacity: 1;
  filter: blur(0);
  transition:
    transform var(--badge-pop-dur)  var(--badge-pop-ease),
    opacity   var(--badge-fade-dur) var(--badge-pop-ease),
    filter    var(--badge-pop-dur)  var(--badge-pop-ease);
  will-change: transform, opacity, filter;
}

.t-badge[data-open="false"] .t-badge-dot {
  transform: scale(0);
  opacity: 0;
  filter: blur(var(--badge-blur));
  transition:
    transform var(--badge-pop-close-dur)  var(--badge-close-ease),
    opacity   var(--badge-fade-close-dur) var(--badge-close-ease),
    filter    var(--badge-pop-close-dur)  var(--badge-close-ease);
}

@media (prefers-reduced-motion: reduce) {
  .t-badge, .t-badge-dot {
    animation: none !important;
    transition: none !important;
  }
}
`;
    document.head.appendChild(style);
}

export const NotificationBadge = ({
    count,
    open,
    dotOnly = false,
    inline = false,
    className = '',
    dotClassName = '',
    style = {},
    ...rest
}) => {
    useEffect(() => {
        injectBadgeStyles();
    }, []);

    // Check if used inline (like in drawer list items)
    const isInline = inline || className.includes('ml-auto') || className.includes('static');

    // Determine target open state
    const isExplicit = typeof open === 'boolean';
    const hasCount = typeof count === 'number' ? count > 0 : Boolean(count);
    const targetOpen = isExplicit ? open : hasCount;

    // Retain previous count so text doesn't vanish while closing (180ms close animation)
    const [displayCount, setDisplayCount] = useState(count || 0);
    const [isOpen, setIsOpen] = useState(false);
    const [animKey, setAnimKey] = useState(0);
    const prevCountRef = useRef(count);

    useEffect(() => {
        if (targetOpen) {
            if (count > 0) setDisplayCount(count);
            // Allow 1 frame so scale(0) -> scale(1) transition triggers cleanly on mount
            const rAF = requestAnimationFrame(() => setIsOpen(true));
            return () => cancelAnimationFrame(rAF);
        } else {
            setIsOpen(false);
        }
    }, [targetOpen, count]);

    // Re-trigger slide + pop when count increases/changes to a positive number
    useEffect(() => {
        if (count && count > 0 && prevCountRef.current !== undefined && prevCountRef.current !== count) {
            setAnimKey((k) => k + 1);
        }
        prevCountRef.current = count;
    }, [count]);

    // Backward-compatible fallback for inline list rows (e.g. Navbar mobile drawer)
    if (isInline) {
        if (!count || count <= 0) return null;
        return (
            <span
                className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#ff4d4f] text-white text-[10px] font-bold leading-none ${className}`}
                {...rest}
            >
                {count > 99 ? '99+' : count}
            </span>
        );
    }

    return (
        <span
            key={animKey}
            className={`t-badge ${className}`}
            data-open={isOpen ? 'true' : 'false'}
            style={style}
            aria-hidden="true"
            {...rest}
        >
            <span
                className={`t-badge-dot ${
                    dotOnly
                        ? 'w-2.5 h-2.5 rounded-full bg-[#ff4d4f] ring-2 ring-white dark:ring-[#141722] shadow-xs'
                        : 'min-w-[17px] h-[17px] px-1 rounded-full bg-[#ff4d4f] text-white text-[10px] font-bold leading-none ring-2 ring-white dark:ring-[#141722] shadow-xs select-none'
                } ${dotClassName}`}
            >
                {!dotOnly && (displayCount > 99 ? '99+' : displayCount)}
            </span>
        </span>
    );
};

export default NotificationBadge;
