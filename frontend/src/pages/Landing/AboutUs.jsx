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
  Sparkles,
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

/* ── Product Capabilities ──────────────────────────── */
const productCapabilities = [
  {
    title: 'Customer records',
    description: 'Borrower details and loan history.',
  },
  {
    title: 'Loan tracking',
    description: 'Keep details and repayments organized.',
  },
  {
    title: 'Payment records',
    description: 'Record and review collections.',
  },
  {
    title: 'Borrower communication',
    description: 'Keep conversations together.',
  },
];


/* ── Journey Milestones (Founder Narrative) ──────── */
const journeyMilestones = [
  {
    number: '01',
    title: 'Learning Web Development',
    desc: 'Started by learning modern JavaScript, React, and Node.js through coursework and building small tools from scratch.',
  },
  {
    number: '02',
    title: 'Identifying the Problem',
    desc: 'Observed local lenders and small financiers relying on fragile paper diaries, mental math, and spreadsheet confusion.',
  },
  {
    number: '03',
    title: 'Building Money Lender',
    desc: 'Built the platform step by step — borrower records, automated interest math, repayment tracking, and secure access.',
  },
  {
    number: '04',
    title: 'Continuous Improvement',
    desc: 'Refining usability, hardening calculation edge cases, improving mobile access, and keeping the workflow straightforward.',
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
          3. THE PRODUCT — FUNCTIONAL & COMPACT OVERVIEW
      ════════════════════════════════════════════════════════════ */}
      <section className="pt-2 sm:pt-4 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-14 items-start">
          {/* Left Column: Heading, Single Sentence Narrative & Simple Link */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] leading-snug">
              Built for everyday lending.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-normal max-w-sm">
              Customer records, loans, repayments and conversations, together in one place.
            </p>

            <div className="mt-3.5">
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors no-underline group"
              >
                <span>Explore the platform</span>
                <span className="transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Right Column: 4 Concise Capabilities in a Compact 2 × 2 Typographic Arrangement */}
          <div className="lg:col-span-7 pt-4 sm:pt-0 border-t border-slate-300/60 lg:border-t-0 flex flex-col justify-start">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 sm:gap-x-10 gap-y-4 sm:gap-y-5">
              {productCapabilities.map((cap) => (
                <div key={cap.title} className="flex flex-col">
                  <h3 className="text-sm font-semibold text-[#0F172A] tracking-tight">
                    {cap.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-normal font-normal">
                    {cap.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          4. THE JOURNEY — EDITORIAL FOUNDER TIMELINE (Warm Off-White)
      ════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-[#F7F7F4] border-y border-[#EAEAE4] py-12 sm:py-16 lg:py-20">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
            {/* Left Column: Narrative Headline & Context */}
            <div className="lg:col-span-5 flex flex-col justify-start lg:sticky lg:top-28">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] leading-snug">
                From Learning to Building
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2.5 sm:mt-3 leading-relaxed font-normal">
                How a BCA student turned real-world observation and self-taught engineering into a practical lending platform.
              </p>
              <div className="hidden lg:block mt-6 pt-5 border-t border-[#E5E5DE] text-xs text-slate-500 leading-relaxed font-normal">
                A solo developer project focused on practical utility over corporate complexity.
              </div>
            </div>

            {/* Right Column: Vertical Editorial Timeline */}
            <div className="lg:col-span-7 pt-2 sm:pt-0">
              <div className="relative pl-6 sm:pl-7">
                {/* Continuous thin vertical line */}
                <div
                  className="absolute top-2 bottom-4 left-[5.5px] w-px bg-[#D6D6CE]"
                  aria-hidden="true"
                />

                <div className="space-y-6 sm:space-y-7">
                  {journeyMilestones.map((milestone) => (
                    <div key={milestone.number} className="relative group">
                      {/* Milestone Node on the line */}
                      <div
                        className="absolute -left-6 top-[5px] w-3 h-3 rounded-full bg-[#0F172A] ring-4 ring-[#F7F7F4]"
                        aria-hidden="true"
                      />

                      {/* Milestone Text with Fine Separator */}
                      <div className="border-b border-[#E8E8E2] pb-6 group-last:border-b-0 group-last:pb-0">
                        <span className="text-xs font-mono font-medium text-slate-400 block mb-1">
                          {milestone.number}
                        </span>
                        <h3 className="text-base font-semibold text-[#0F172A] tracking-tight mb-1.5">
                          {milestone.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                          {milestone.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          5. CLOSING CTA SECTION — EDITORIAL NAVY PANEL
      ════════════════════════════════════════════════════════════ */}
      <section className="py-10 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="bg-[#0F172A] border border-slate-800/80 text-white rounded-2xl sm:rounded-3xl p-7 sm:p-9 lg:p-11 shadow-xs"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 lg:gap-10">
            {/* Left Column: Headline & Supporting Copy */}
            <div className="max-w-xl">
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight text-white leading-tight">
                Make lending easier to manage.
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-2 sm:mt-2.5 leading-relaxed font-normal">
                Keep customer records, loans, repayments, and conversations organized in one place.
              </p>
            </div>

            {/* Right Column: Action Buttons */}
            <div className="flex items-center gap-3.5 sm:gap-4 flex-wrap shrink-0 pt-1 md:pt-0">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-semibold text-sm transition-colors shadow-2xs no-underline"
              >
                <span>Get Started Free</span>
                <ArrowUpRight size={15} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-2.5 sm:py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 font-semibold text-sm transition-colors no-underline"
              >
                Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          6. UNIVERSAL FOOTER
      ════════════════════════════════════════════════════════════ */}
      <Footer />
    </div>
  );
}
