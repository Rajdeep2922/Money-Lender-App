import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Smartphone,
  Github,
  Linkedin,
  Zap,
  Sparkles,
  Code2,
  Check,
  Calendar,
} from 'lucide-react';
import Navbar from './sections/Navbar';
import Footer from './sections/Footer';
import './landing.css';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

/* ── Hero Feature Badges ──────────────────────────── */
const heroTags = [
  { icon: Calendar, label: 'Organize Records' },
  { icon: CheckCircle2, label: 'Track Repayments' },
  { icon: Smartphone, label: 'Work from Anywhere' },
];

/* ── Product Feature Checkmarks ──────────────────── */
const productFeatures = [
  'Automated EMI & interest breakdown in real-time',
  'Instant customer credit profile & loan history lookup',
  'Direct lender-borrower communication channel',
  'One-click PDF invoices and repayment receipts',
  'Continuous ledger math with zero manual formula errors',
];

/* ── Journey Milestones (Founder Narrative) ──────── */
const journeyMilestones = [
  {
    number: '01',
    tag: 'Foundations & Craft',
    title: 'Learning Web Development',
    desc: 'Mastered modern JavaScript, React, Node.js, and databases through curiosity, disciplined practice, and a drive to build scalable software.',
  },
  {
    number: '02',
    tag: 'The Real-World Need',
    title: 'Identifying the Problem',
    desc: 'Observed the daily struggles of local lenders and small financiers relying on fragile paper registers, mental math, and spreadsheet confusion.',
  },
  {
    number: '03',
    tag: 'Architecture & Build',
    title: 'Building Money Lender',
    desc: 'Architected the full-stack system from scratch with real-time sync, automated ledger math, audit-ready exports, and secure authentication.',
  },
  {
    number: '04',
    tag: 'Ongoing Evolution',
    title: 'Continuous Improvement',
    desc: 'Constantly refining UX polish, listening to lender feedback, hardening security, and shipping features that solve practical everyday needs.',
  },
];

export default function AboutUs() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="landing-root bg-[#F0F4F9] text-[#0F172A] min-h-screen selection:bg-[#2563EB]/20 selection:text-[#0F172A] relative overflow-x-hidden">
      {/* Universal Navbar (configured to render clean light-mode on /about) */}
      <Navbar />

      {/* ════════════════════════════════════════════════════════════
          1. HERO SECTION — FOUNDER'S STORY & AUTHENTIC PORTRAIT
          (Full-width Sky Video Background matching Landing Page)
      ════════════════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden bg-[#EAF1F8]">
        {/* Full-width Sky Video Background */}
        {!shouldReduceMotion && (
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
            <video
              src="/hero-sky.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Restrained Translucent Pale-Blue/White Editorial Overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none z-[1] bg-gradient-to-b from-white/45 via-[#F0F4F9]/55 to-[#F0F4F9]"
        />

        {/* Hero Content Container */}
        <div className="relative z-10 pt-24 sm:pt-36 lg:pt-40 pb-14 sm:pb-20 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Narrative & Action CTA */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="lg:col-span-7 flex flex-col items-start text-left"
            >
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E2EAF4]/90 border border-[#D0DEEC] text-[#2563EB] text-xs font-bold uppercase tracking-wider mb-4 sm:mb-5 shadow-2xs backdrop-blur-xs">
                <Sparkles size={13} className="text-[#2563EB]" /> FOUNDER'S STORY
              </div>

              {/* Main Editorial Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-[54px] xl:text-[58px] font-bold tracking-tight text-[#0F172A] leading-[1.1] sm:leading-[1.08] mb-4 sm:mb-6">
                From a Personal Need to a Real Solution
              </h1>

              {/* Authentic Narrative Text */}
              <p className="text-base sm:text-lg text-[#334155] leading-relaxed mb-6 sm:mb-8 max-w-2xl font-normal">
                Money Lender was born out of a real problem: managing loans, tracking repayments, and maintaining records should not be chaotic. As a developer, I decided to build the tool I wished existed.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 flex-wrap mb-7 sm:mb-10">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#2563EB] text-white font-semibold text-sm hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 no-underline"
                >
                  Get Started Free <ArrowRight size={16} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/95 text-[#0F172A] border border-[#CBD5E1] font-semibold text-sm hover:bg-white transition-all no-underline shadow-2xs"
                >
                  Sign In
                </Link>
              </div>

              {/* 3 Editorial Feature Badges */}
              <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
                {heroTags.map((tag) => {
                  const Icon = tag.icon;
                  return (
                    <div
                      key={tag.label}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-[#DCE5EF] text-xs font-semibold text-[#1E293B] shadow-2xs backdrop-blur-xs"
                    >
                      <Icon size={14} className="text-[#2563EB]" />
                      <span>{tag.label}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Right Column: Refined Editorial Founder Composition */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center"
            >
              <div className="relative w-full max-w-[360px] sm:max-w-[400px] lg:max-w-[420px] flex flex-col items-center">
                {/* Portrait Display Stage — Unclipped Natural Proportions */}
                <div className="relative inline-flex items-end justify-center pt-8 sm:pt-10 pb-3">
                  {/* Coordinated Handwritten Annotation & Directional Arrow */}
                  {/* Positioned just above and slightly to the left of the head, pointing toward the hair */}
                  <div
                    aria-hidden="true"
                    className="absolute top-6 sm:top-7 left-3 sm:left-6 z-20 flex items-end gap-1.5 select-none pointer-events-none"
                  >
                    <div className="flex flex-col -rotate-3 text-left">
                      <span
                        className="text-lg sm:text-xl font-bold text-[#1D4ED8] tracking-wide leading-none"
                        style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                      >
                        Rajdeep Singh
                      </span>
                      <span
                        className="text-xs sm:text-sm font-semibold text-[#334155] mt-0.5"
                        style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                      >
                        Founder &amp; Developer
                      </span>
                    </div>

                    {/* Short, graceful hand-drawn dotted arrow pointing directly toward upper hair */}
                    <svg
                      width="42"
                      height="32"
                      viewBox="0 0 42 32"
                      fill="none"
                      className="text-[#2563EB] mb-0.5 flex-shrink-0"
                    >
                      <path
                        d="M3 6 C 16 6, 28 12, 36 26"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="3 3.5"
                      />
                      <path
                        d="M28 24 L 36 26 L 36 17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  {/* Founder Cutout Image (Authentic full transparent portrait, unclipped) */}
                  <img
                    src="/Rajdeep-figure.png"
                    alt="Rajdeep Singh, Founder & Full-Stack Developer of Money Lender"
                    className="relative z-10 w-auto h-auto max-h-[350px] sm:max-h-[410px] lg:max-h-[450px] object-contain select-none pointer-events-none drop-shadow-sm"
                    loading="eager"
                  />
                </div>

                {/* Compact, Unboxed Founder Signature / Caption with Comfortable Spacing */}
                <div className="w-full pt-4 mt-1 border-t border-[#CBD5E1]/70 flex flex-col items-center sm:items-start text-center sm:text-left">
                  <div className="text-[15px] font-bold text-[#0F172A] tracking-tight">
                    Rajdeep Singh
                  </div>
                  <div className="text-xs font-medium text-[#475569] mt-0.5 mb-2.5">
                    Founder &amp; Developer · BCA Student
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <a
                      href="https://github.com/Rajdeep2922"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#334155] hover:text-[#0F172A] transition-colors no-underline group"
                      aria-label="Rajdeep Singh's GitHub profile"
                    >
                      <Github size={13} className="text-[#64748B] group-hover:text-[#0F172A] transition-colors" />
                      <span>GitHub</span>
                      <ArrowUpRight size={11} className="text-[#94A3B8] group-hover:text-[#0F172A] transition-colors" />
                    </a>
                    <span className="text-[#CBD5E1]" aria-hidden="true">·</span>
                    <a
                      href="https://www.linkedin.com/in/rajdeep-singh-3900b12b9/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#2563EB] hover:text-blue-700 transition-colors no-underline group"
                      aria-label="Rajdeep Singh's LinkedIn profile"
                    >
                      <Linkedin size={13} className="text-[#2563EB] group-hover:text-blue-700 transition-colors" />
                      <span>LinkedIn</span>
                      <ArrowUpRight size={11} className="text-blue-400 group-hover:text-blue-700 transition-colors" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          2. PROBLEM VS SOLUTION — EDITORIAL BEFORE & AFTER
      ════════════════════════════════════════════════════════════ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto scroll-mt-20">
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Left Column: The Problem (The Old Way) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            {/* Header Content Block */}
            <div className="lg:min-h-[140px] flex flex-col justify-start mb-5 sm:mb-6">
              <div className="inline-flex items-center self-start px-2.5 py-0.5 rounded-full bg-white/80 border border-slate-200/90 text-slate-500 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider mb-3 shadow-2xs">
                THE OLD WAY
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-bold tracking-tight text-[#0F172A] leading-[1.2] mb-2.5">
                Loans scattered everywhere.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-lg">
                Paper registers, scattered messages, and manual calculations make it hard to keep track.
              </p>
            </div>

            {/* Physical Records Photograph */}
            <div className="w-full rounded-2xl border border-[#DCE5EF] overflow-hidden bg-white shadow-2xs">
              <img
                src="/paper-ledger-problem.png"
                alt="Physical loan registers, handwritten records, and manual calculations"
                className="w-full h-auto object-cover block select-none"
                loading="lazy"
              />
            </div>

            {/* Understated Annotations */}
            <div className="flex items-center gap-2 mt-3.5 flex-wrap">
              <span className="text-[11px] font-medium text-slate-600 bg-white/80 border border-[#DCE5EF] px-3 py-1 rounded-full shadow-2xs">
                Paper records
              </span>
              <span className="text-[11px] font-medium text-slate-600 bg-white/80 border border-[#DCE5EF] px-3 py-1 rounded-full shadow-2xs">
                Manual calculations
              </span>
            </div>
          </motion.div>

          {/* Center Transition: Minimal Directional Arrow Node (Desktop) */}
          <div
            aria-hidden="true"
            className="hidden lg:flex items-center justify-center absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none select-none"
          >
            <div className="w-8 h-8 rounded-full border border-slate-200/90 bg-white/95 shadow-2xs flex items-center justify-center text-slate-500">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="text-slate-600">
                <path d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Right Column: The Solution (The Money Lender Way) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            {/* Header Content Block */}
            <div className="lg:min-h-[140px] flex flex-col justify-start mb-5 sm:mb-6">
              <div className="inline-flex items-center self-start px-2.5 py-0.5 rounded-full bg-[#E0EDFB] border border-blue-200/70 text-[#2563EB] text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider mb-3 shadow-2xs">
                THE MONEY LENDER WAY
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-bold tracking-tight text-[#0F172A] leading-[1.2] mb-2.5">
                Everything, in one place.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-lg">
                Customers, loans, payments, and conversations — all organized in one workspace.
              </p>
            </div>

            {/* 2 × 2 Conceptual Feature Cards Arrangement */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Card 1: Customers */}
              <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0]/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-3 text-slate-900 font-semibold text-xs tracking-tight">
                  <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 16 16" fill="none">
                    <path d="M5.5 7a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM11 6a2 2 0 100-4 2 2 0 000 4zM2 13.5c0-2 2-3 3.5-3s3.5 1 3.5 3M9.5 13.5c0-1.5 1.2-2.3 2.5-2.3 1 0 2 .5 2 2.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Customers</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold flex items-center justify-center">RS</div>
                      <span className="font-medium text-slate-800 text-[11px]">Rakesh Sharma</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">Active</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[9px] font-bold flex items-center justify-center">PP</div>
                      <span className="font-medium text-slate-800 text-[11px]">Priya Patel</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">Active</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[9px] font-bold flex items-center justify-center">AM</div>
                      <span className="font-medium text-slate-800 text-[11px]">Amit Mehta</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">Inactive</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Loan */}
              <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0]/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between sm:rotate-[1.5deg] transition-transform">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs tracking-tight">
                  <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 16 16" fill="none">
                    <path d="M3 2.5h7l3 3V13.5a1 1 0 01-1 1H3a1 1 0 01-1-1v-10a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M10 2.5v3h3M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  <span>Loan</span>
                </div>
                <div className="my-2">
                  <div className="text-2xl font-bold tracking-tight text-slate-900">₹25,000</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-normal">EMI: ₹2,500 · 12 months</div>
                </div>
                <div className="flex justify-end">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">Ongoing</span>
                </div>
              </div>

              {/* Card 3: Payments */}
              <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0]/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-3 text-slate-900 font-semibold text-xs tracking-tight">
                  <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="3.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M2 6.5h12" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                  <span>Payments</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none">
                          <path d="M5 8V2M5 2L2 5M5 2L8 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-slate-800 text-[11px]">EMI Payment</div>
                        <div className="text-[9px] text-slate-400">12 Oct 2026</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-800 text-[11px]">₹2,500</div>
                      <span className="text-[9px] font-medium text-emerald-600">Received</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none">
                          <path d="M5 2V8M5 8L2 5M5 8L8 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-slate-800 text-[11px]">EMI Payment</div>
                        <div className="text-[9px] text-slate-400">12 Sep 2026</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-800 text-[11px]">₹2,500</div>
                      <span className="text-[9px] font-medium text-emerald-600">Received</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Conversations */}
              <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0]/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between sm:rotate-[1deg] transition-transform">
                <div className="flex items-center gap-2 mb-3 text-slate-900 font-semibold text-xs tracking-tight">
                  <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 16 16" fill="none">
                    <path d="M2.5 4a1.5 1.5 0 011.5-1.5h8A1.5 1.5 0 0113.5 4v5a1.5 1.5 0 01-1.5 1.5H5.5L2.5 13V4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                  </svg>
                  <span>Conversations</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[9px] font-bold flex-shrink-0 flex items-center justify-center">RS</div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-800 text-[11px] truncate">Rakesh Sharma</div>
                        <div className="text-[9px] text-slate-500 truncate">Bhai next EMI kab hai?</div>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 flex-shrink-0 ml-1">10:24 AM</span>
                  </div>
                  <div className="flex items-start justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold flex-shrink-0 flex items-center justify-center">PP</div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-800 text-[11px] truncate">Priya Patel</div>
                        <div className="text-[9px] text-slate-500 truncate">Payment done ✓</div>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 flex-shrink-0 ml-1">Yesterday</span>
                  </div>
                  <div className="flex items-start justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-[9px] font-bold flex-shrink-0 flex items-center justify-center">AM</div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-800 text-[11px] truncate">Amit Mehta</div>
                        <div className="text-[9px] text-slate-500 truncate">Can you share receipt?</div>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 flex-shrink-0 ml-1">2 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            BOTTOM FEATURE STRIP
        ════════════════════════════════════════════════════════════ */}
        <div className="mt-12 sm:mt-16 pt-7 border-t border-[#CBD5E1]/70">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#CBD5E1]/70 text-center">
            <div className="py-2.5 px-4 text-xs sm:text-sm font-medium text-slate-700">
              Organized records
            </div>
            <div className="py-2.5 px-4 text-xs sm:text-sm font-medium text-slate-700">
              Payment tracking
            </div>
            <div className="py-2.5 px-4 text-xs sm:text-sm font-medium text-slate-700">
              Loan calculations
            </div>
            <div className="py-2.5 px-4 text-xs sm:text-sm font-medium text-slate-700">
              Access anywhere
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          3. THE PRODUCT — AUTHENTIC ACTUAL DASHBOARD SHOWCASE
      ════════════════════════════════════════════════════════════ */}
      <section className="pt-8 sm:pt-12 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Product Narrative & Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E2EAF4] border border-[#D0DEEC] text-[#2563EB] text-xs font-bold uppercase tracking-wider mb-4">
              THE PRODUCT
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#0F172A] leading-[1.12] mb-5">
              A complete platform for how you actually work.
            </h2>

            <p className="text-base text-[#475569] leading-relaxed mb-6 font-normal">
              Built from the ground up to offer enterprise-grade clarity with consumer simplicity. Real-time dashboards, instant payment logging, transparent repayment schedules, and audit-ready records.
            </p>

            {/* Checklist Highlights */}
            <div className="space-y-3 mb-8">
              {productFeatures.map((feat) => (
                <div key={feat} className="flex items-center gap-3 text-xs sm:text-sm font-medium text-[#334155]">
                  <div className="w-5 h-5 rounded-full bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center flex-shrink-0">
                    <Check size={12} strokeWidth={2.5} />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0F172A] text-white font-semibold text-sm hover:bg-[#1E293B] transition-colors shadow-xs no-underline"
            >
              Explore Platform <ArrowRight size={15} />
            </Link>
          </motion.div>

          {/* Right Column: Understated Browser Frame with Verified Real Application Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-7 flex justify-center"
          >
            <div className="w-full bg-white rounded-xl sm:rounded-2xl border border-[#DCE5EF] shadow-[0_16px_40px_-12px_rgba(15,23,42,0.10)] overflow-hidden">
              {/* Thin, Understated Browser Header Bar */}
              <div
                className="h-7 sm:h-8 px-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center gap-1.5"
                aria-hidden="true"
              >
                <div className="w-2 h-2 rounded-full bg-[#EF4444]/80" />
                <div className="w-2 h-2 rounded-full bg-[#F59E0B]/80" />
                <div className="w-2 h-2 rounded-full bg-[#10B981]/80" />
              </div>

              {/* Verified Real Application Dashboard Visual */}
              <div className="w-full bg-[#F0F4F9] overflow-hidden">
                <img
                  src="/real-dashboard.png"
                  alt="Money Lender Actual Dashboard Platform Visual"
                  className="w-full h-auto block select-none pointer-events-none"
                  loading="eager"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          4. THE JOURNEY — 4 CONNECTED MILESTONES (Founder Path)
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-14 sm:mb-18"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E2EAF4] border border-[#D0DEEC] text-[#2563EB] text-xs font-bold uppercase tracking-wider mb-4">
            THE JOURNEY
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] mb-4">
            From Learning to Building
          </h2>
          <p className="text-base text-[#475569] leading-relaxed font-normal">
            How a BCA student turned curiosity, disciplined engineering, and real-world observation into a production-grade lending system.
          </p>
        </motion.div>

        {/* 4 Connected Milestone Cards */}
        <div className="relative">
          {/* Subtle horizontal connecting dashed line on desktop */}
          <div className="hidden lg:block absolute top-12 left-12 right-12 h-0.5 border-t-2 border-dashed border-[#CBD5E1] -z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {journeyMilestones.map((milestone, idx) => (
              <motion.div
                key={milestone.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white border border-[#DCE5EF] rounded-2xl p-6 shadow-xs hover:border-[#CBDCEE] hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#E8EFF8] border border-[#D0DEEC] text-[#2563EB] font-bold text-sm flex items-center justify-center font-mono">
                      {milestone.number}
                    </div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider bg-slate-50 border border-[#E2E8F0] px-2.5 py-1 rounded-full">
                      {milestone.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#0F172A] mb-2">
                    {milestone.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed mb-0 font-normal">
                    {milestone.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          5. CLOSING CTA SECTION — EDITORIAL NAVY CONTAINER
      ════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="relative bg-[#0F172A] border border-white/10 text-white rounded-[32px] sm:rounded-[40px] p-8 sm:p-12 lg:p-14 overflow-hidden shadow-2xl"
        >
          {/* Subtle glowing ambient accents */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#2563EB]/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#3B82F6]/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Col: Headline & Subtitle */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4">
                GET STARTED TODAY
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12] mb-4">
                Take Control of Your Lending Operations Today
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
                Join smart lenders who save hours every week, eliminate spreadsheet calculation errors, and build transparent relationships with borrowers.
              </p>
            </div>

            {/* Right Col: Action Buttons & Reassurance Points */}
            <div className="lg:col-span-5 flex flex-col items-start lg:items-end">
              <div className="flex items-center gap-3.5 flex-wrap mb-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#2563EB] text-white font-bold text-sm hover:bg-blue-600 transition-colors shadow-md no-underline"
                >
                  Get Started Free <ArrowUpRight size={16} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold text-sm transition-colors no-underline"
                >
                  Sign In
                </Link>
              </div>

              {/* Reassurance Tags */}
              <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <Check size={12} className="text-emerald-400" /> Free to get started
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Check size={12} className="text-emerald-400" /> No credit card
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Check size={12} className="text-emerald-400" /> Instant setup
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          6. ATTRIBUTION RIBBON & UNIVERSAL FOOTER
      ════════════════════════════════════════════════════════════ */}
      <div className="bg-[#E2EAF4] border-t border-b border-[#D0DEEC] py-3.5">
        <div className="max-w-[1240px] mx-auto px-4 flex justify-center items-center gap-2 text-xs font-medium text-[#475569] text-center">
          <Code2 size={14} className="text-[#2563EB]" />
          <span>
            Built with passion by <strong className="text-[#0F172A]">Rajdeep Singh</strong> · Full-Stack Developer &amp; BCA Student
          </span>
          <Zap size={12} className="text-[#2563EB] fill-[#2563EB]" />
        </div>
      </div>

      <Footer />
    </div>
  );
}
