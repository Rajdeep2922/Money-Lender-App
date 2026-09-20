import React, { useRef } from 'react';

// Transitions.dev — Card hover tilt (React, self-contained)
const __TRANSITION_STYLES = `
:root {
  --tilt-perspective: 1000px;
  --tilt-return: 1000ms;
  --tilt-return-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --tilt-follow: 400ms;
  --tilt-follow-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --tilt-glare-opacity: 0.36;
  --tilt-glare-fade: 300ms;
  --tilt-glare-ease: cubic-bezier(0.22, 1, 0.36, 1);
}

.t-tilt {
  touch-action: pan-y;
  border-radius: 24px;
}

.t-tilt-card {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 2px solid #0c0d12;
  box-shadow: 4px 4px 0px #0c0d12;
  transform:
    perspective(var(--tilt-perspective))
    rotateX(var(--tilt-rx, 0deg))
    rotateY(var(--tilt-ry, 0deg));
  transform-style: preserve-3d;
  transition:
    transform var(--tilt-return) var(--tilt-return-ease),
    box-shadow 250ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 250ms ease;
  will-change: transform;
}

.dark .t-tilt-card {
  border: 2px solid #283044;
  box-shadow: 4px 4px 0px #000000;
}

.t-tilt.is-hover .t-tilt-card,
.t-tilt:hover .t-tilt-card {
  box-shadow: 6px 6px 0px #0c0d12;
}

.dark .t-tilt.is-hover .t-tilt-card,
.dark .t-tilt:hover .t-tilt-card {
  box-shadow: 6px 6px 0px #000000;
  border-color: #3d4a66;
}

.t-tilt:active .t-tilt-card {
  box-shadow: 2px 2px 0px #0c0d12;
}

.dark .t-tilt:active .t-tilt-card {
  box-shadow: 2px 2px 0px #000000;
}

.t-tilt-card.is-tilting {
  transition: transform var(--tilt-follow) var(--tilt-follow-ease), box-shadow 250ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* Glossy specular reflection sheen on all tilt cards */
.t-tilt-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.45) 0%,
    rgba(255, 255, 255, 0.12) 28%,
    rgba(255, 255, 255, 0) 58%
  );
  box-shadow:
    inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.75),
    inset 0 -1px 1px 0 rgba(0, 0, 0, 0.02);
  z-index: 2;
}

.dark .t-tilt-card::before {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.03) 30%,
    rgba(255, 255, 255, 0) 60%
  );
  box-shadow:
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.22),
    inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}

.t-tilt-glare {
  display: none !important;
}

@media (prefers-reduced-motion: reduce) {
  .t-tilt-card {
    transform: none !important;
    transition: none !important;
  }
}
`;

if (typeof document !== 'undefined' && !document.getElementById('transitions-p19')) {
  const __style = document.createElement('style');
  __style.id = 'transitions-p19';
  __style.textContent = __TRANSITION_STYLES;
  document.head.appendChild(__style);
}

/**
 * TiltCard Component
 * Wraps any card with a 3D interactive tilt animation, glossy glass specular reflection,
 * and cursor-tracked glare effect.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children Card contents
 * @param {string} [props.className] Class names for outer hit area wrapper
 * @param {string} [props.cardClassName] Class names for the inner tilting card
 * @param {number} [props.max=12] Maximum rotation angle in degrees
 * @param {boolean} [props.glare=false] Whether to enable cursor-tracked glare
 * @param {React.ElementType} [props.as='div'] Container element (e.g. 'div', Link)
 */
export function TiltCard({
  children,
  className = '',
  cardClassName = '',
  max = 12,
  glare = false,
  glow = 'blue',
  as: Component = 'div',
  ...rest
}) {
  const wrapRef = useRef(null);
  const cardRef = useRef(null);

  const onMove = (e) => {
    const wrap = wrapRef.current;
    const card = cardRef.current;
    if (!wrap || !card) return;
    const r = wrap.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    wrap.classList.add('is-hover');
    card.classList.add('is-tilting');
    card.style.setProperty('--tilt-ry', ((px - 0.5) * max).toFixed(2) + 'deg');
    card.style.setProperty('--tilt-rx', ((0.5 - py) * max).toFixed(2) + 'deg');
    card.style.setProperty('--tilt-gx', (px * 100).toFixed(1) + '%');
    card.style.setProperty('--tilt-gy', (py * 100).toFixed(1) + '%');
  };

  const onLeave = () => {
    const wrap = wrapRef.current;
    const card = cardRef.current;
    if (wrap) wrap.classList.remove('is-hover');
    if (card) {
      card.classList.remove('is-tilting');
      card.style.setProperty('--tilt-rx', '0deg');
      card.style.setProperty('--tilt-ry', '0deg');
    }
  };

  return (
    <div
      ref={wrapRef}
      className={`t-tilt rounded-[24px] ${glow ? `t-tilt-glow t-tilt-glow-${glow}` : ''} ${className}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {glow && <div className="t-tilt-glow-canvas" aria-hidden="true" />}
      <Component
        ref={cardRef}
        className={`t-tilt-card rounded-[24px] ${cardClassName}`}
        {...rest}
      >
        {children}
        {glare && <div className="t-tilt-glare" aria-hidden="true" />}
      </Component>
    </div>
  );
}


export default TiltCard;
