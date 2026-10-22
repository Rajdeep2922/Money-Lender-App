import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createTimeline } from 'animejs';
import HeroProductVisual from '../components/HeroProductVisual';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Hero Component — Ultra-Smooth Credix-Style Scroll Experience
 *
 * Polished with:
 * - High-precision critically-damped spring smoothing (eliminates stepped mouse-wheel notches).
 * - 9-knot harmonic physical trajectory with smooth curvature continuity.
 * - Perfectly synchronized physical glide (X, Y, rotate, scale evolve in lockstep).
 * - Multi-knot invisible video fade.
 * - Restrained horizontal left text reveal.
 */
export default function Hero() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const headlineRef = useRef(null);
  const subtextRef = useRef(null);
  const ctaRef = useRef(null);
  const dashboardIntroRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Pause offscreen video to preserve GPU rendering capacity
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Anime.js Page-Load Cinematic Intro Timeline
  // Scoped STRICTLY to Hero refs; NEVER touches or selects the Navbar.
  useIsomorphicLayoutEffect(() => {
    if (shouldReduceMotion) return;

    // If page is already scrolled down on refresh, skip intro to prevent any scroll collision
    if (typeof window !== 'undefined' && window.scrollY > 4) {
      return;
    }

    const headline = headlineRef.current;
    const subtext = subtextRef.current;
    const cta = ctaRef.current;
    const dashboard = dashboardIntroRef.current;

    if (!headline || !subtext || !cta || !dashboard) return;

    let isCleanedUp = false;

    // Helper to safely reset inline styles back to clean stylesheet rules
    const resetInlineStyles = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;
      [headline, subtext, cta, dashboard].forEach((el) => {
        if (el) {
          el.style.opacity = '';
          el.style.transform = '';
        }
      });
    };

    // Synchronous initial hidden states before paint (zero FOUC / flash)
    headline.style.opacity = '0';
    headline.style.transform = 'translateY(12px)';

    subtext.style.opacity = '0';
    subtext.style.transform = 'translateY(8px)';

    cta.style.opacity = '0';
    cta.style.transform = 'translateY(8px)';

    dashboard.style.opacity = '0';
    dashboard.style.transform = 'translateY(40px) scale(0.965)';

    let tl;
    try {
      tl = createTimeline({
        onComplete: resetInlineStyles,
      });

      // ~200ms: Headline begins subtle entrance
      tl.add(
        headline,
        {
          opacity: [0, 1],
          translateY: [12, 0],
          duration: 520,
          ease: 'outCubic',
        },
        200
      );

      // ~380ms: Supporting text enters with subtle overlap
      tl.add(
        subtext,
        {
          opacity: [0, 1],
          translateY: [8, 0],
          duration: 460,
          ease: 'outCubic',
        },
        380
      );

      // ~520ms: CTA enters without bounce
      tl.add(
        cta,
        {
          opacity: [0, 1],
          translateY: [8, 0],
          duration: 420,
          ease: 'outCubic',
        },
        520
      );

      // ~680ms: Dashboard enters subtly
      tl.add(
        dashboard,
        {
          opacity: [0, 1],
          translateY: [40, 0],
          scale: [0.965, 1],
          duration: 580,
          ease: 'outCubic',
        },
        680
      );
    } catch (err) {
      console.error('Anime.js timeline initialization error:', err);
      resetInlineStyles();
      return;
    }

    // Crucial: If the user starts scrolling after refresh, immediately settle intro
    // so Anime.js never fights with Framer Motion scroll transformations
    const handleEarlyScroll = () => {
      if (window.scrollY > 4) {
        if (tl && typeof tl.pause === 'function') {
          tl.pause();
        }
        clearTimeout(safetyTimer);
        resetInlineStyles();
        window.removeEventListener('scroll', handleEarlyScroll);
      }
    };
    window.addEventListener('scroll', handleEarlyScroll, { passive: true });

    // Safety fallback: ensure inline styles are unconditionally cleared after 1.6s
    const safetyTimer = setTimeout(() => {
      resetInlineStyles();
      window.removeEventListener('scroll', handleEarlyScroll);
    }, 1600);

    return () => {
      window.removeEventListener('scroll', handleEarlyScroll);
      clearTimeout(safetyTimer);
      if (tl && typeof tl.pause === 'function') {
        tl.pause();
      }
      resetInlineStyles();
    };
  }, [shouldReduceMotion]);

  // 1. Raw scroll progress from the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // 2. High-precision critically-damped spring smoothing
  // Tuned with responsive mass (0.08) and critical damping (22) to merge mouse-wheel notches
  // into liquid motion without lagging, oscillation, or micro-jitter.
  const springProgress = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 22,
    mass: 0.08,
    restDelta: 0.001,
  });

  const activeProgress = shouldReduceMotion ? scrollYProgress : springProgress;

  // 3. Continuous Video Fade (Completes by 0.68) with hardware bypass
  const videoOpacity = useTransform(
    activeProgress,
    [0.00, 0.12, 0.28, 0.46, 0.68],
    [1.00, 0.96, 0.80, 0.45, 0.00]
  );
  const videoDisplay = useTransform(activeProgress, (v) => (v >= 0.70 ? 'none' : 'block'));

  // 4. Initial Hero Content Exit (0.00 -> 0.22)
  const heroTextOpacity = useTransform(activeProgress, [0.00, 0.22], [1, 0]);
  const heroTextY = useTransform(
    activeProgress,
    [0.00, 0.22],
    shouldReduceMotion ? [0, 0] : [0, -36]
  );
  const heroTextPointerEvents = useTransform(
    activeProgress,
    (v) => (v > 0.18 ? 'none' : 'auto')
  );

  // 5. Harmonic Trajectory — Settles completely by 0.76
  // This provides a resting, stable buffer between 0.76 and 1.00, eliminating any conflict
  // or jitter when the sticky container approaches its unpin threshold and the next section enters.
  const motionKnots = [0.00, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.76, 1.00];

  // Dashboard Y (Vertical Translation): 48vh -> 0vh (Fully settled at 0.76)
  const dashboardY = useTransform(
    activeProgress,
    motionKnots,
    shouldReduceMotion
      ? ['0vh', '0vh', '0vh', '0vh', '0vh', '0vh', '0vh', '0vh', '0vh', '0vh']
      : ['48.0vh', '47.6vh', '44.0vh', '37.0vh', '27.0vh', '16.5vh', '7.5vh', '1.8vh', '0.0vh', '0.0vh']
  );

  // Dashboard X (Horizontal Translation): 0vw -> 24vw (Fully settled at 0.76)
  const dashboardX = useTransform(
    activeProgress,
    motionKnots,
    shouldReduceMotion
      ? ['0vw', '0vw', '0vw', '0vw', '0vw', '0vw', '0vw', '0vw', '0vw', '0vw']
      : ['0.0vw', '0.2vw', '1.6vw', '4.5vw', '9.2vw', '14.8vw', '19.8vw', '23.2vw', '24.0vw', '24.0vw']
  );

  // Dashboard Rotation (Clockwise Tilt): 0deg -> 3.2deg (Fully settled at 0.76)
  const dashboardRotate = useTransform(
    activeProgress,
    motionKnots,
    shouldReduceMotion
      ? ['0deg', '0deg', '0deg', '0deg', '0deg', '0deg', '0deg', '0deg', '0deg', '0deg']
      : ['0.00deg', '0.03deg', '0.22deg', '0.62deg', '1.28deg', '2.02deg', '2.68deg', '3.10deg', '3.20deg', '3.20deg']
  );

  // Dashboard Scale: 1.00 -> 1.04 (Fully settled at 0.76)
  const dashboardScale = useTransform(
    activeProgress,
    motionKnots,
    shouldReduceMotion
      ? [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      : [1.000, 1.000, 1.003, 1.009, 1.017, 1.026, 1.034, 1.039, 1.040, 1.040]
  );

  // 6. Left Editorial Text (Reveals 0.48 -> 0.72, fully settled well before unpin)
  const leftTextOpacity = useTransform(activeProgress, [0.48, 0.72], [0, 1]);
  const leftTextX = useTransform(
    activeProgress,
    [0.48, 0.72],
    shouldReduceMotion ? [0, 0] : [-16, 0]
  );
  const leftTextPointerEvents = useTransform(
    activeProgress,
    (v) => (v < 0.48 ? 'none' : 'auto')
  );

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative z-10 w-full h-[320vh] bg-[#edf2f8] dark:bg-[#0c0e14]"
    >
      {/* ── Sticky Viewport Frame (Pinned 100vh during the scroll transformation) ── */}
      <div
        className="sticky top-0 left-0 w-full h-screen overflow-x-clip flex items-center justify-center"
        style={{ overflowY: 'visible' }}
      >
        {/* ── Layer 1: Background Sky Video (Opacity 1.00 -> 0.00 across 0.00–0.68) ── */}
        <motion.div
          style={{ opacity: videoOpacity, display: videoDisplay }}
          className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
        >
          <video
            ref={videoRef}
            src="/hero-sky.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* ── Layer 2: Initial Hero Centered Content & Get Started CTA (Elevated z-30 in front of dashboard) ── */}
        <motion.div
          style={{
            opacity: heroTextOpacity,
            y: heroTextY,
            pointerEvents: heroTextPointerEvents,
          }}
          className="absolute top-[10vh] sm:top-[11vh] md:top-[12vh] left-0 right-0 z-30 flex flex-col items-center text-center px-4 max-w-[820px] mx-auto select-none"
        >
          <h1
            ref={headlineRef}
            data-hero-intro="headline"
            className="font-display font-['Space_Grotesk'] text-4xl sm:text-5xl md:text-[62px] font-bold text-white tracking-[-0.035em] leading-[1.04] mb-3.5 drop-shadow-sm will-change-transform"
          >
            Manage Every Loan.<br />
            From One Place.
          </h1>

          <p
            ref={subtextRef}
            data-hero-intro="supporting"
            className="text-sm sm:text-base md:text-lg text-white/90 max-w-[520px] leading-relaxed mb-5 sm:mb-6 font-normal drop-shadow-xs will-change-transform"
          >
            Track customers, loans, repayments and your lending portfolio from one clear workspace.
          </p>

          <div
            ref={ctaRef}
            data-hero-intro="cta"
            className="will-change-transform"
          >
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-7 sm:px-8 py-3 sm:py-3.5 rounded-full bg-white text-[#0c0d12] font-bold text-sm sm:text-base tracking-tight shadow-lg hover:bg-white/95 active:scale-[0.98] cursor-pointer relative z-10"
            >
              Get Started
            </Link>
          </div>
        </motion.div>

        {/* ── Layer 3: Left Editorial Text (Static vertical centering + isolated Framer Motion horizontal reveal) ── */}
        <div className="absolute left-6 sm:left-12 lg:left-20 xl:left-28 top-1/2 -translate-y-1/2 z-10 max-w-[420px] text-left select-none pointer-events-none">
          <motion.div
            style={{
              opacity: leftTextOpacity,
              x: leftTextX,
              pointerEvents: leftTextPointerEvents,
            }}
          >
            <h2 className="font-display font-['Space_Grotesk'] text-3xl sm:text-5xl lg:text-[50px] font-black text-[#0c0d12] dark:text-white tracking-[-0.035em] leading-[1.05] mb-4">
              Manage your<br />
              lending, clearly.
            </h2>

            <div className="w-10 h-[2px] bg-[#2563eb] my-5 opacity-70" />

            <p className="text-base sm:text-lg text-[#526077] dark:text-[#94a3b8] leading-relaxed font-normal">
              Keep customer records, loan terms and repayments together in one place.
            </p>
          </motion.div>
        </div>

        {/* ── Layer 4: Centered Single-Object Motion Container (Elevated Foreground Product Plane) ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <motion.div
            style={{
              x: dashboardX,
              y: dashboardY,
              rotate: dashboardRotate,
              scale: dashboardScale,
              transformOrigin: 'center center',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
            className="pointer-events-auto will-change-transform"
          >
            {/* Inner Intro Wrapper for Anime.js entrance; zero collision with Framer Motion transforms */}
            <div
              ref={dashboardIntroRef}
              data-hero-intro="dashboard"
              className="will-change-transform"
            >
              <HeroProductVisual />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
