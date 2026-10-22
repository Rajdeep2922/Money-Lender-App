import React from 'react';

/**
 * HeroProductVisual Component
 * Minimalist Studio Display / Pro Hardware Frame Presentation:
 * - Precision dark anodized space-gray aluminum chassis with CNC edge chamfer
 * - Clearly visible Pro Display hardware notch with optical lens & indicator
 * - High-grade glass panel with subtle specular reflection
 * - Grounded physical studio drop shadow (zero neon/vibecoded glowing auras)
 * - 2X Retina full-resolution actual dashboard in crisp, uncropped view
 */
export function HeroProductVisual({ className = '' }) {
  return (
    <div
      className={`relative w-[min(92vw,440px)] md:w-[840px] lg:w-[980px] xl:w-[1040px] select-none text-left ${className}`}
    >
      <div className="relative rounded-[20px] sm:rounded-[28px] md:rounded-[36px] bg-[#16181e] p-2 sm:p-2.5 md:p-3 border border-[#2e313b] ring-1 ring-black/70 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.4),0_30px_70px_-15px_rgba(15,23,42,0.3)] md:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.38),0_50px_110px_-18px_rgba(15,23,42,0.28)]">
        {/* ── Pro Display Hardware Camera Notch ── */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-20 sm:w-24 md:w-28 h-3.5 sm:h-4 md:h-4.5 bg-[#0f1015] rounded-b-xl border-b border-x border-[#2d303b] shadow-[0_3px_8px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.06)] flex items-center justify-center gap-1.5 sm:gap-2 pointer-events-none"
          aria-label="Hardware Camera Notch"
        >
          {/* Ambient Light Sensor */}
          <span className="w-1.5 h-1.5 rounded-full bg-[#050608] border border-[#1e2028] shadow-inner" />

          {/* Precision Optical Camera Lens with Anti-Reflective Glare */}
          <div className="relative w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#040508] border border-[#242733] ring-1 ring-black shadow-inner flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-blue-500/70" />
          </div>

          {/* Active Status Indicator LED */}
          <span className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_5px_#34d399]" />
        </div>

        {/* ── 2. Display Glass Panel ── */}
        <div className="relative rounded-[14px] sm:rounded-[18px] md:rounded-[24px] overflow-hidden bg-[#e8f1fc] dark:bg-[#0c0e14] shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] isolate">
          {/* Natural Specular Glass Highlight across screen */}
          <div
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.08] pointer-events-none z-10"
            aria-hidden="true"
          />

          {/* 2X Retina Actual Application Dashboard (Full view, Zero cutoff) */}
          <img
            src="/actual-dashboard.png"
            alt="Money Lender Actual Dashboard on Studio Display"
            className="w-full h-auto block select-none pointer-events-none"
            loading="eager"
            decoding="async"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}

export default HeroProductVisual;
