import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import HeroProductVisual from '../components/HeroProductVisual';

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
  const shouldReduceMotion = useReducedMotion();

  // 1. Raw scroll progress from the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // 2. High-precision critically-damped spring smoothing
  // Calibrated with gentle mass and softer stiffness for buttery, liquid scroll inertia
  // that seamlessly merges discrete mouse-wheel ticks without lag, bounce, or overshoot.
  const springProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 24,
    mass: 0.15,
    restDelta: 0.0001,
  });

  const activeProgress = shouldReduceMotion ? scrollYProgress : springProgress;

  // 3. Continuous Multi-Knot Video Fade (0.00 -> 0.90)
  const videoOpacity = useTransform(
    activeProgress,
    [0.00, 0.15, 0.35, 0.55, 0.75, 0.90],
    [1.00, 0.96, 0.80, 0.50, 0.18, 0.00]
  );

  // 4. Initial Hero Content Exit (Smoother start from 0.00 -> 0.22)
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

  // 5. 11-Knot Smootherstep Polynomial Harmonic Trajectory
  // Eliminates all jerk and dead-zones; X, Y, Rotate, Scale move in flawless mathematical lockstep
  const motionKnots = [0.00, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.00];

  // Dashboard Y (Vertical Translation): 48vh -> 0vh (Smootherstep 6t^5 - 15t^4 + 10t^3)
  const dashboardY = useTransform(
    activeProgress,
    motionKnots,
    shouldReduceMotion
      ? ['0vh', '0vh', '0vh', '0vh', '0vh', '0vh', '0vh', '0vh', '0vh', '0vh', '0vh']
      : ['48.0vh', '47.6vh', '45.2vh', '40.2vh', '32.8vh', '24.0vh', '15.2vh', '7.8vh', '2.8vh', '0.4vh', '0.0vh']
  );

  // Dashboard X (Horizontal Translation): 0vw -> 24vw (Smootherstep curvature)
  const dashboardX = useTransform(
    activeProgress,
    motionKnots,
    shouldReduceMotion
      ? ['0vw', '0vw', '0vw', '0vw', '0vw', '0vw', '0vw', '0vw', '0vw', '0vw', '0vw']
      : ['0.0vw', '0.2vw', '1.4vw', '3.9vw', '7.6vw', '12.0vw', '16.4vw', '20.1vw', '22.6vw', '23.8vw', '24.0vw']
  );

  // Dashboard Rotation (Clockwise Tilt): 0deg -> 3.2deg (Harmonic with X and Y)
  const dashboardRotate = useTransform(
    activeProgress,
    motionKnots,
    shouldReduceMotion
      ? ['0deg', '0deg', '0deg', '0deg', '0deg', '0deg', '0deg', '0deg', '0deg', '0deg', '0deg']
      : ['0.00deg', '0.03deg', '0.19deg', '0.52deg', '1.02deg', '1.60deg', '2.18deg', '2.68deg', '3.01deg', '3.17deg', '3.20deg']
  );

  // Dashboard Scale: 1.00 -> 1.04
  const dashboardScale = useTransform(
    activeProgress,
    motionKnots,
    shouldReduceMotion
      ? [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      : [1.000, 1.000, 1.002, 1.007, 1.013, 1.020, 1.027, 1.034, 1.038, 1.040, 1.040]
  );

  // 6. Left Editorial Text (Subtle horizontal reveal from the left: 0.58 -> 0.84)
  const leftTextOpacity = useTransform(activeProgress, [0.58, 0.84], [0, 1]);
  const leftTextX = useTransform(
    activeProgress,
    [0.58, 0.84],
    shouldReduceMotion ? [0, 0] : [-16, 0]
  );
  const leftTextPointerEvents = useTransform(
    activeProgress,
    (v) => (v < 0.56 ? 'none' : 'auto')
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
        {/* ── Layer 1: Background Sky Video (Opacity 1.00 -> 0.00 across 0.00–0.90) ── */}
        <motion.div
          style={{ opacity: videoOpacity }}
          className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
        >
          <video
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
          <h1 className="font-display font-['Space_Grotesk'] text-4xl sm:text-5xl md:text-[62px] font-bold text-white tracking-[-0.035em] leading-[1.04] mb-3.5 drop-shadow-sm">
            Manage Every Loan.<br />
            From One Place.
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-[520px] leading-relaxed mb-5 sm:mb-6 font-normal drop-shadow-xs">
            Track customers, loans, repayments and your lending portfolio from one clear workspace.
          </p>

          <Link
            to="/register"
            className="inline-flex items-center justify-center px-7 sm:px-8 py-3 sm:py-3.5 rounded-full bg-white text-[#0c0d12] font-bold text-sm sm:text-base tracking-tight shadow-lg hover:bg-white/95 active:scale-[0.98] cursor-pointer relative z-10"
          >
            Get Started
          </Link>
        </motion.div>

        {/* ── Layer 3: Left Editorial Text (Sits behind the floating product dashboard) ── */}
        <motion.div
          style={{
            opacity: leftTextOpacity,
            x: leftTextX,
            pointerEvents: leftTextPointerEvents,
          }}
          className="absolute left-6 sm:left-12 lg:left-20 xl:left-28 top-1/2 -translate-y-1/2 z-10 max-w-[420px] text-left select-none"
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
            <HeroProductVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
