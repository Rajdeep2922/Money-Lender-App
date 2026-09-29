import React from 'react';

/**
 * HeroBackground Component
 * Renders the Money Lender authentic pale-blue atmosphere:
 * - Subtle pale-blue radial lighting (#E4EEFB / #eef5fc to darker peripheral tints)
 * - Faint perspective/hairline fintech grid with soft radial vignette
 * - Soft ambient contrast glow behind the central dashboard
 * - Strictly NO colorful gradient blobs or neon gradients
 */
export function HeroBackground() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* 1. Base Ambient Radial Gradient */}
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          background: 'radial-gradient(120% 90% at 50% 0%, rgba(228, 238, 251, 0.95) 0%, rgba(214, 230, 250, 0.7) 45%, rgba(240, 246, 254, 0.4) 100%)',
        }}
      />
      
      {/* Dark mode overlay */}
      <div
        className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(120% 90% at 50% 0%, #151a24 0%, #0c0e14 55%, #050608 100%)',
        }}
      />

      {/* 2. Faint Fintech Perspective / Isometric Grid */}
      <div
        className="absolute inset-0 opacity-[0.45] dark:opacity-[0.18]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(37, 99, 235, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(37, 99, 235, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(circle at 50% 45%, black 25%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 45%, black 25%, transparent 75%)',
        }}
      />

      {/* 3. Subtle Central Elevation Glow (Contrasts the dashboard without blob chaos) */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] rounded-full blur-[100px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.04) 60%, transparent 80%)',
        }}
      />

      {/* 4. Fine Top Lighting Horizon Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#2563eb]/20 dark:via-blue-400/20 to-transparent" />
    </div>
  );
}

export default HeroBackground;
