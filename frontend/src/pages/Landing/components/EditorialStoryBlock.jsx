import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Hook to detect mobile viewports (< 768px)
 */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = (e) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [breakpoint]);

  return isMobile;
}

/**
 * EditorialStoryBlock Component
 *
 * Clean, reusable editorial block inspired by Credix Webflow:
 * - 3:2 photographic frame with integrated ambient light overlays
 * - Large, calm typography with generous breathing room
 * - Side-by-side desktop layout with subtle alternating entrance animations
 * - Natural mobile stacking: Image first, followed by Text
 * - Highly optimized mobile rendering (zero lateral shifts, no heavy blend modes)
 */
export default function EditorialStoryBlock({
  image,
  alt,
  eyebrow,
  title,
  description,
  imagePosition = 'left', // 'left' | 'right' on desktop
  objectPosition = 'center center',
}) {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile(768);
  const isImageLeft = imagePosition === 'left';
  const textDirection = isImageLeft ? 'from-right' : 'from-left';

  // Frame container entrance: gentle rise + subtle scale settle on desktop; pure subtle rise on mobile
  const imageFrameVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : isMobile ? 14 : 36,
      scale: shouldReduceMotion || isMobile ? 1 : 0.975,
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: isMobile ? 0.45 : 0.85,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  // Micro-motion for the photograph inside the frame (desktop only, disabled on mobile for 60fps)
  const photoVariants = {
    hidden: {
      scale: shouldReduceMotion || isMobile ? 1 : 1.025,
    },
    show: {
      scale: 1,
      transition: {
        duration: isMobile ? 0.45 : 1.1,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  // Text entrance: directional horizontal drift on desktop; pure vertical settle on mobile
  // Mobile uses x: 0 to prevent horizontal document overflow and viewport stutter
  const textVariants = {
    hidden: {
      opacity: 0,
      x: shouldReduceMotion || isMobile ? 0 : textDirection === 'from-right' ? 26 : -26,
      y: isMobile && !shouldReduceMotion ? 14 : 0,
    },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: isMobile ? 0.45 : 0.8,
        delay: shouldReduceMotion || isMobile ? 0 : 0.08,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 sm:gap-12 lg:gap-16 xl:gap-24 overflow-hidden w-full">
      {/* ── Photographic Image Frame ── */}
      <motion.div
        variants={imageFrameVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: isMobile ? 0.1 : 0.2 }}
        className={`order-1 ${
          isImageLeft
            ? 'lg:order-1 lg:col-span-7'
            : 'lg:order-2 lg:col-span-7'
        } w-full`}
      >
        <div className="relative w-full aspect-[3/2] rounded-[24px] sm:rounded-[32px] lg:rounded-[36px] overflow-hidden border border-black/[0.06] dark:border-white/[0.08] shadow-md md:shadow-[0_24px_70px_-15px_rgba(26,46,85,0.13),0_10px_25px_-5px_rgba(26,46,85,0.06)] dark:shadow-none md:dark:shadow-[0_24px_70px_-15px_rgba(0,0,0,0.55)] isolate">
          {/* 1. Base Photograph */}
          <motion.img
            variants={photoVariants}
            src={image}
            alt={alt}
            style={{ objectPosition }}
            className={`w-full h-full object-cover select-none pointer-events-none block ${isMobile ? '' : 'will-change-transform'}`}
            loading="lazy"
            decoding="async"
          />

          {/* 2. Soft Ambient Pale Blue / Lavender Radial Glow (Lightweight alpha on mobile, mix-blend on desktop) */}
          <div
            className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_25%_25%,rgba(199,219,254,0.22),transparent_60%)] dark:bg-[radial-gradient(circle_at_25%_25%,rgba(96,165,250,0.12),transparent_60%)] md:mix-blend-screen md:dark:mix-blend-lighten"
            aria-hidden="true"
          />

          {/* 3. Subtle Warm Ambient Fill on opposite corner */}
          <div
            className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_85%_80%,rgba(224,231,255,0.14),transparent_55%)] dark:bg-[radial-gradient(circle_at_85%_80%,rgba(147,197,253,0.06),transparent_55%)]"
            aria-hidden="true"
          />

          {/* 4. Natural Atmospheric Tonal Wash */}
          <div
            className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/[0.12] via-transparent to-white/[0.10] dark:from-black/[0.32] dark:to-transparent"
            aria-hidden="true"
          />

          {/* 5. Hairline Inner Rim Reflection */}
          <div
            className="absolute inset-0 pointer-events-none rounded-[inherit] ring-1 ring-inset ring-white/20 dark:ring-white/10"
            aria-hidden="true"
          />
        </div>
      </motion.div>

      {/* ── Editorial Text Content ── */}
      <motion.div
        variants={textVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: isMobile ? 0.1 : 0.25 }}
        className={`order-2 ${
          isImageLeft
            ? 'lg:order-2 lg:col-span-5'
            : 'lg:order-1 lg:col-span-5'
        } flex flex-col justify-center text-left select-none`}
      >
        {/* Eyebrow Label */}
        <span className="text-xs sm:text-[13px] font-mono font-bold tracking-[0.14em] uppercase text-[#2563eb] dark:text-[#60a5fa] mb-2 sm:mb-4 block">
          {eyebrow}
        </span>

        {/* Editorial Heading */}
        <h3 className="font-display font-['Space_Grotesk'] text-2xl sm:text-4xl md:text-[40px] lg:text-[44px] xl:text-[48px] font-bold text-[#0c0d12] dark:text-white tracking-[-0.035em] leading-[1.12] sm:leading-[1.09] mb-3 sm:mb-5">
          {title}
        </h3>

        {/* Editorial Body */}
        <p className="text-sm sm:text-lg text-[#526077] dark:text-[#94a3b8] leading-[1.65] font-normal max-w-[460px]">
          {description}
        </p>
      </motion.div>
    </div>
  );
}
