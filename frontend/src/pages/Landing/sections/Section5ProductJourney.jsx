import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  House,
  FileText,
  ChatCircleText,
  CreditCard,
  DotsThreeCircle,
  Bell,
  MagnifyingGlass,
  CheckCircle,
  Clock,
  TrendUp,
  Funnel,
  ArrowRight,
} from '@phosphor-icons/react';

/**
 * Screen 1: Mobile Dashboard (Home)
 * Displays active loans, total outstanding card, upcoming payments
 */
function MobileDashboardScreen() {
  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#f8fafc] text-[#0f172a] select-none pt-10 pb-3 px-3.5">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-[#2563eb] flex items-center justify-center text-white shadow-2xs">
              <span className="font-extrabold text-[10px] tracking-tight">₹</span>
            </div>
            <span className="font-bold text-[12px] tracking-tight text-[#0f172a]">
              Money Lender
            </span>
          </div>
          <div className="relative p-1 rounded-full text-gray-500">
            <Bell size={15} weight="bold" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
          </div>
        </div>

        {/* User Greeting */}
        <div className="mb-2.5">
          <p className="text-[13px] font-bold text-gray-900 tracking-tight">Hello, Rajdeep!</p>
        </div>

        {/* Total Outstanding Card (Dark Teal / Forest Tone matching spec) */}
        <div className="bg-[#12312b] text-white rounded-xl p-3 shadow-sm mb-2.5 border border-white/5">
          <p className="text-[10px] font-medium text-emerald-200/80 mb-0.5">Total Outstanding</p>
          <div className="text-[20px] font-extrabold tracking-tight text-white leading-tight">
            ₹ 2,45,000
          </div>
          <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-semibold">
            <TrendUp size={10} weight="bold" />
            <span>+12% this month</span>
          </div>
        </div>

        {/* 2 Stat Cards */}
        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <div className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-2xs">
            <p className="text-[10px] font-medium text-gray-400">Active Loans</p>
            <p className="text-[15px] font-extrabold text-gray-900 mt-0.5">12</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-2xs">
            <p className="text-[10px] font-medium text-gray-400">Total Customers</p>
            <p className="text-[15px] font-extrabold text-gray-900 mt-0.5">28</p>
          </div>
        </div>

        {/* Upcoming Payments */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-gray-800">Upcoming Payments</span>
            <span className="text-[9px] font-semibold text-[#2563eb]">View all</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-gray-100 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
                  AS
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-900 leading-tight">Amit Sharma</p>
                  <p className="text-[9px] font-medium text-amber-600">Due tomorrow</p>
                </div>
              </div>
              <div className="text-[11px] font-extrabold text-gray-900">₹5,000</div>
            </div>

            <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-gray-100 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
                  RV
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-900 leading-tight">Rohan Verma</p>
                  <p className="text-[9px] font-medium text-gray-400">Due in 3 days</p>
                </div>
              </div>
              <div className="text-[11px] font-extrabold text-gray-900">₹3,500</div>
            </div>
          </div>
        </div>
      </div>

      {/* Screen Bottom Tab Bar */}
      <BottomTabBar activeTab="home" />
    </div>
  );
}

/**
 * Screen 2: Mobile Messages / Chat ("STAY CONNECTED")
 * Displays real-time communication, borrower threads, typing states
 */
function MobileChatScreen() {
  const conversations = [
    {
      initials: 'AS',
      color: 'from-amber-400 to-orange-500',
      name: 'Amit Sharma',
      preview: 'Last payment received',
      time: '2m',
      unread: 0,
      isTyping: false,
    },
    {
      initials: 'RV',
      color: 'from-blue-500 to-indigo-600',
      name: 'Rohan Verma',
      preview: 'Typing...',
      time: '5m',
      unread: 1,
      isTyping: true,
    },
    {
      initials: 'NS',
      color: 'from-emerald-400 to-teal-600',
      name: 'Neha Singh',
      preview: 'Document shared',
      time: '1h',
      unread: 0,
      isTyping: false,
    },
    {
      initials: 'VP',
      color: 'from-purple-500 to-indigo-600',
      name: 'Vikram Patel',
      preview: 'Thanks! will pay soon',
      time: '3h',
      unread: 0,
      isTyping: false,
    },
    {
      initials: 'SK',
      color: 'from-sky-400 to-blue-600',
      name: 'Suresh Kumar',
      preview: 'Ok noted',
      time: '1d',
      unread: 0,
      isTyping: false,
    },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#f8fafc] text-[#0f172a] select-none pt-10 pb-3 px-3.5">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="font-bold text-[14px] text-gray-900 tracking-tight">Messages</h3>
          <div className="text-gray-400">
            <MagnifyingGlass size={15} weight="bold" />
          </div>
        </div>

        {/* Search input mock */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-100/90 text-gray-400 text-[10px] mb-3">
          <MagnifyingGlass size={12} weight="bold" />
          <span>Search conversations...</span>
        </div>

        {/* Chat List */}
        <div className="space-y-2">
          {conversations.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-between p-2 rounded-xl bg-white border border-gray-100 shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${c.color} text-white flex items-center justify-center font-bold text-[9px] shrink-0 shadow-2xs`}
                >
                  {c.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-gray-900 leading-tight truncate">
                    {c.name}
                  </p>
                  <p
                    className={`text-[9px] leading-tight truncate ${c.isTyping ? 'text-[#2563eb] font-semibold flex items-center gap-1' : 'text-gray-400'
                      }`}
                  >
                    {c.isTyping && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2563eb] animate-pulse" />
                    )}
                    {c.preview}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[9px] text-gray-400">{c.time}</span>
                {c.unread > 0 && (
                  <span className="w-3.5 h-3.5 rounded-full bg-[#2563eb] text-white text-[8px] font-bold flex items-center justify-center">
                    {c.unread}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Screen Bottom Tab Bar */}
      <BottomTabBar activeTab="chat" />
    </div>
  );
}

/**
 * Screen 3: Mobile Payments Screen ("TRACK EVERY PAYMENT" & Final Product Discovery)
 * Displays ledger records, status badges, payment tabs, and seamless end-state discovery
 */
function MobilePaymentsScreen({
  paymentListOpacity,
  paymentListY,
  insideMessageOpacity,
  insideMessageY,
}) {
  const payments = [
    { name: 'Amit Sharma', date: '2 Sep 2026', amount: '₹5,000', status: 'Received', color: 'emerald' },
    { name: 'Rohan Verma', date: '5 Sep 2026', amount: '₹3,500', status: 'Pending', color: 'amber' },
    { name: 'Neha Singh', date: '28 Aug 2026', amount: '₹4,000', status: 'Received', color: 'emerald' },
    { name: 'Vikram Patel', date: '10 Sep 2026', amount: '₹2,500', status: 'Pending', color: 'amber' },
    { name: 'Suresh Kumar', date: '25 Aug 2026', amount: '₹5,000', status: 'Received', color: 'emerald' },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#f8fafc] text-[#0f172a] select-none pt-10 pb-3 px-3.5 relative overflow-hidden">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header - Persistent */}
        <div className="flex items-center justify-between mb-2 shrink-0">
          <h3 className="font-bold text-[14px] text-gray-900 tracking-tight">Payments</h3>
          <div className="text-gray-400">
            <Funnel size={14} weight="bold" />
          </div>
        </div>

        {/* Filter Tabs - Persistent */}
        <div className="flex items-center gap-1.5 mb-2.5 shrink-0">
          <span className="px-2.5 py-0.5 rounded-full bg-[#0f172a] text-white text-[9px] font-bold">
            All
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[9px] font-medium">
            Received
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[9px] font-medium">
            Pending
          </span>
        </div>

        {/* Content Area with Layered Transition */}
        <div className="relative flex-1 min-h-0">
          {/* 1. Initial State: Payments List */}
          <motion.div
            style={{
              opacity: paymentListOpacity ?? 1,
              y: paymentListY ?? 0,
            }}
            className="space-y-1.5 will-change-transform"
          >
            {payments.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-xl bg-white border border-gray-100 shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[8px] ${
                      p.color === 'emerald'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                        : 'bg-amber-50 text-amber-600 border border-amber-200/60'
                    }`}
                  >
                    {p.color === 'emerald' ? (
                      <CheckCircle size={12} weight="fill" />
                    ) : (
                      <Clock size={12} weight="fill" />
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-900 leading-tight">{p.name}</p>
                    <p className="text-[9px] text-gray-400">{p.status} · {p.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-extrabold text-gray-900">{p.amount}</p>
                  <span
                    className={`text-[8px] font-semibold px-1.5 py-0.2 rounded-full ${
                      p.color === 'emerald'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>

          {/* 2. Final Inside-Phone Message (Reveals smoothly in place of the list) */}
          <motion.div
            style={{
              opacity: insideMessageOpacity ?? 0,
              y: insideMessageY ?? 10,
            }}
            className="absolute inset-0 flex flex-col justify-center will-change-transform pointer-events-auto"
          >
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs text-left">
              {/* Sync icon in Payments brand style */}
              <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-600 flex items-center justify-center mb-3">
                <CheckCircle size={15} weight="fill" />
              </div>

              {/* Headline */}
              <h4 className="font-['Space_Grotesk'] text-[15px] font-bold text-gray-950 leading-snug tracking-tight mb-1.5">
                Every payment.<br />
                Always in sync.
              </h4>

              {/* Small Supporting Line */}
              <p className="text-[10.5px] text-gray-500 leading-relaxed mb-4">
                Keep repayments organized, balances current, and your lending business under control.
              </p>

              {/* Authentic In-App Action Button */}
              <div className="pt-0.5">
                <Link
                  to="/register"
                  className="w-full py-1.5 sm:py-2 px-3 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] active:scale-[0.98] text-white text-[10.5px] sm:text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs no-underline"
                >
                  <span>Open Workspace</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Screen Bottom Tab Bar */}
      <BottomTabBar activeTab="payments" />
    </div>
  );
}

/**
 * Reusable Mobile App Bottom Navigation Bar
 */
function BottomTabBar({ activeTab = 'home' }) {
  const tabs = [
    { id: 'home', label: 'Home', Icon: House },
    { id: 'loans', label: 'Loans', Icon: FileText },
    { id: 'chat', label: 'Chat', Icon: ChatCircleText },
    { id: 'payments', label: 'Payments', Icon: CreditCard },
    { id: 'more', label: 'More', Icon: DotsThreeCircle },
  ];

  return (
    <div className="pt-1.5 border-t border-gray-100/90 bg-white/95 rounded-b-[28px]">
      <div className="flex items-center justify-around">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = id === activeTab;
          return (
            <div key={id} className="flex flex-col items-center gap-0.5">
              <Icon
                size={14}
                weight={isActive ? 'fill' : 'regular'}
                className={isActive ? 'text-[#2563eb]' : 'text-gray-400'}
              />
              <span
                className={`text-[8px] font-medium leading-none ${isActive ? 'text-[#2563eb] font-bold' : 'text-gray-400'
                  }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
      {/* iPhone Home Indicator Pill */}
      <div className="w-20 h-1 bg-gray-300 rounded-full mx-auto mt-2" />
    </div>
  );
}

/**
 * Premium Smartphone Frame (iPhone 15 Pro Titanium Graphite silhouette)
 */
function SmartphoneFrame({ children }) {
  return (
    <div className="relative select-none">
      {/* Outer Titanium Edge Highlight & Credix Multi-Tier Physical Shadow Stack */}
      <div
        className="relative mx-auto rounded-[46px] sm:rounded-[48px] p-[9px] sm:p-[11px] bg-gradient-to-b from-[#383d4c] via-[#1e2129] to-[#111317] border border-white/20"
        style={{
          boxShadow: [
            /* Tight contact outline */
            '0 0 0 1px rgba(0, 0, 0, 0.85)',
            /* Crisp ambient contact shadow */
            '0 8px 20px -4px rgba(0, 0, 0, 0.65)',
            /* Directional depth shadow */
            '0 20px 42px -8px rgba(0, 0, 0, 0.55)',
            /* Soft atmospheric grounding diffusion directly behind chassis */
            '0 36px 80px -12px rgba(8, 12, 28, 0.60)',
            /* Overhead specular rim highlight (light from top) */
            'inset 0 1.5px 2px rgba(255, 255, 255, 0.45)',
            /* Left metallic beveled chamfer */
            'inset 1px 0 1px rgba(255, 255, 255, 0.18)',
            /* Right edge subtle highlight */
            'inset -1px 0 1px rgba(255, 255, 255, 0.10)',
            /* Bottom grounding shadow */
            'inset 0 -2px 4px rgba(0, 0, 0, 0.85)',
          ].join(', '),
          width: 'min(295px, 82vw)',
          height: 'min(570px, 70vh)',
        }}
      >
        {/* Subtle hardware buttons on side with metallic specular highlight */}
        <div className="absolute -left-[3px] top-24 w-[3px] h-7 bg-[#3c4150] rounded-l-xs border-l border-white/25 shadow-xs" />
        <div className="absolute -left-[3px] top-35 w-[3px] h-10 bg-[#3c4150] rounded-l-xs border-l border-white/25 shadow-xs" />
        <div className="absolute -left-[3px] top-48 w-[3px] h-10 bg-[#3c4150] rounded-l-xs border-l border-white/25 shadow-xs" />
        <div className="absolute -right-[3px] top-32 w-[3px] h-14 bg-[#3c4150] rounded-r-xs border-r border-white/25 shadow-xs" />

        {/* Inner Screen Bezel with inner depth shadow */}
        <div className="relative w-full h-full rounded-[38px] sm:rounded-[40px] overflow-hidden bg-[#f8fafc] border border-black/95 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
          {/* Subtle Dynamic Island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-[18px] bg-black rounded-full z-40 flex items-center justify-between px-2 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1c1c1f]" />
            <span className="w-2 h-2 rounded-full bg-[#0a0a0c] border border-white/10" />
          </div>

          {/* Realistic Status Bar: 9:41, Cellular, WiFi, Battery */}
          <div className="absolute top-2 left-0 right-0 px-5 flex items-center justify-between z-30 pointer-events-none text-gray-900">
            <span className="text-[10px] font-bold font-mono tracking-tight">9:41</span>
            <div className="flex items-center gap-1.5">
              {/* Cellular Signal bars */}
              <div className="flex items-end gap-0.5 h-2.5">
                <span className="w-0.5 h-1 bg-gray-900 rounded-2xs" />
                <span className="w-0.5 h-1.5 bg-gray-900 rounded-2xs" />
                <span className="w-0.5 h-2 bg-gray-900 rounded-2xs" />
                <span className="w-0.5 h-2.5 bg-gray-900 rounded-2xs" />
              </div>
              {/* Battery indicator */}
              <div className="w-4 h-2 rounded-xs border border-gray-900 p-0.5 flex items-center">
                <div className="w-2.5 h-full bg-gray-900 rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Glare Sheen Reflection (Credix studio soft glass reflection) */}
          <div
            className="absolute inset-0 pointer-events-none z-30 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.09]"
            aria-hidden="true"
          />

          {/* Inner Screen Content */}
          <div className="w-full h-full relative z-10">{children}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Section 5: Scroll-Driven Mobile Product Story
 * Choreographed using Framer Motion scroll transforms.
 */
export default function Section5ProductJourney() {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const isSectionInView = useInView(stickyRef, { amount: 0.6, once: false });

  // 1. Raw scroll progress from container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // 2. High-precision critically-damped spring smoothing (exact physics from Hero.jsx)
  // Calibrated with gentle mass and softer stiffness for buttery, liquid scroll inertia
  // that seamlessly merges discrete mouse-wheel ticks without lag, bounce, or overshoot.
  const springProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 26,
    mass: 0.12,
    restDelta: 0.0001,
  });

  const activeProgress = shouldReduceMotion ? scrollYProgress : springProgress;

  // 3. Continuous Harmonic Trajectory for Single Physical Phone Anchor (Scroll-Driven)
  // Initial entrance is automatic (NOT scroll-dependent) — phone smoothly fades and settles on section entry.
  // Once settled:
  // - Stages 1-3 (0.00 - 0.74): Single continuous physical object with subtle restrained depth (scale 1.00 -> 1.02, y 0 -> -6px)
  // - Stage 4 (0.78 - 0.86): Elevates to upper position (-185px) for final resolution, scale stays locked at 1.02 (NO scale down)
  const phoneScale = useTransform(
    activeProgress,
    [0.00, 0.35, 0.65, 0.80, 1.00],
    shouldReduceMotion
      ? [1, 1, 1, 1, 1]
      : [1.00, 1.01, 1.015, 1.02, 1.02],
    { clamp: true }
  );

  const phoneY = useTransform(
    activeProgress,
    [0.00, 0.25, 0.50, 0.74, 0.86, 1.00],
    shouldReduceMotion
      ? [0, 0, 0, 0, 0, 0]
      : [0, -3, 2, -6, -45, -45],
    { clamp: true }
  );

  // Subtle restrained physical depth response (max ±0.6°: imperceptibly subtle, perfectly stable)
  const phoneRotateY = useTransform(
    activeProgress,
    [0.00, 0.15, 0.35, 0.55, 0.74, 0.86, 1.00],
    shouldReduceMotion ? [0, 0, 0, 0, 0, 0, 0] : [0, 0, -0.6, 0.6, -0.4, 0, 0],
    { clamp: true }
  );

  // 4. Phone Screen Crossfades (Synchronized with 3 Narrative Stages)
  // Stage 1 (0.00 - ~0.38): Dashboard (Active from entry through Stage 1)
  // Stage 2 (~0.34 - ~0.60): Chat
  // Stage 3 (~0.56 - 1.00): Payments (Visual Anchor through the ending)
  const screen1Opacity = useTransform(activeProgress, [0.00, 0.34, 0.42], [1, 1, 0], { clamp: true });
  const screen2Opacity = useTransform(activeProgress, [0.34, 0.42, 0.56, 0.64], [0, 1, 1, 0], { clamp: true });
  const screen3Opacity = useTransform(activeProgress, [0.56, 0.64, 1.00], [0, 1, 1], { clamp: true });

  // 5. Deliberate Editorial Typography System (Bilateral Horizontal Wings)
  // CONSISTENT DIRECTIONAL RULE:
  // LEFT-SIDE WORDS ALWAYS ENTER FROM THE LEFT.
  // RIGHT-SIDE WORDS ALWAYS ENTER FROM THE RIGHT.
  // INITIAL STATE (0.00 - ~0.14): Typography is completely outside visible composition (opacity 0, parked at entry X offsets).
  // CONTROLLED VARIATION: Subtle differences in entry distance and slight timing/delay between left and right words.

  // Stage 1 (~0.14 - ~0.38): MANAGE [PHONE] EVERY LOAN
  // Left: -80px -> 0. Right: +100px -> 0.
  const text1ContainerOpacity = useTransform(activeProgress, [0.12, 0.14, 0.38, 0.40], [0, 1, 1, 0], { clamp: true });

  const text1LeftOpacity = useTransform(activeProgress, [0.00, 0.14, 0.22, 0.30, 0.38], [0, 0, 1, 1, 0], { clamp: true });
  const text1LeftX = useTransform(
    activeProgress,
    [0.00, 0.14, 0.22, 0.30, 0.38],
    shouldReduceMotion ? [0, 0, 0, 0, 0] : [-80, -80, 0, 0, -16],
    { clamp: true }
  );

  const text1RightOpacity = useTransform(activeProgress, [0.00, 0.155, 0.235, 0.30, 0.38], [0, 0, 1, 1, 0], { clamp: true });
  const text1RightX = useTransform(
    activeProgress,
    [0.00, 0.155, 0.235, 0.30, 0.38],
    shouldReduceMotion ? [0, 0, 0, 0, 0] : [100, 100, 0, 0, 16],
    { clamp: true }
  );

  // Stage 2 (~0.36 - ~0.60): STAY [PHONE] CONNECTED
  // Left: -100px -> 0. Right: +85px -> 0.
  const text2ContainerOpacity = useTransform(activeProgress, [0.34, 0.36, 0.60, 0.62], [0, 1, 1, 0], { clamp: true });

  const text2LeftOpacity = useTransform(activeProgress, [0.00, 0.36, 0.44, 0.52, 0.60], [0, 0, 1, 1, 0], { clamp: true });
  const text2LeftX = useTransform(
    activeProgress,
    [0.00, 0.36, 0.44, 0.52, 0.60],
    shouldReduceMotion ? [0, 0, 0, 0, 0] : [-100, -100, 0, 0, -16],
    { clamp: true }
  );

  const text2RightOpacity = useTransform(activeProgress, [0.00, 0.375, 0.455, 0.52, 0.60], [0, 0, 1, 1, 0], { clamp: true });
  const text2RightX = useTransform(
    activeProgress,
    [0.00, 0.375, 0.455, 0.52, 0.60],
    shouldReduceMotion ? [0, 0, 0, 0, 0] : [85, 85, 0, 0, 16],
    { clamp: true }
  );

  // Stage 3 (~0.58 - ~0.86): TRACK [PHONE] EVERY PAYMENT
  // Left: -75px -> 0. Right: +110px -> 0.
  // Gradually reduces opacity between 0.78 and 0.86 (editorial fade, not abrupt)
  const text3ContainerOpacity = useTransform(activeProgress, [0.56, 0.58, 0.78, 0.86], [0, 1, 1, 0], { clamp: true });

  const text3LeftOpacity = useTransform(activeProgress, [0.00, 0.58, 0.66, 0.78, 0.86], [0, 0, 1, 1, 0], { clamp: true });
  const text3LeftX = useTransform(
    activeProgress,
    [0.00, 0.58, 0.66, 0.78, 0.86],
    shouldReduceMotion ? [0, 0, 0, 0, 0] : [-75, -75, 0, 0, -16],
    { clamp: true }
  );

  const text3RightOpacity = useTransform(activeProgress, [0.00, 0.595, 0.675, 0.78, 0.86], [0, 0, 1, 1, 0], { clamp: true });
  const text3RightX = useTransform(
    activeProgress,
    [0.00, 0.595, 0.675, 0.78, 0.86],
    shouldReduceMotion ? [0, 0, 0, 0, 0] : [110, 110, 0, 0, 16],
    { clamp: true }
  );

  // 6. Ending Inside-Phone: Payment list yields and final discovery message reveals
  // Payment list remains visible initially, then gently dissolves
  const paymentListOpacity = useTransform(activeProgress, [0.72, 0.80], [1, 0], { clamp: true });
  const paymentListY = useTransform(
    activeProgress,
    [0.72, 0.80],
    shouldReduceMotion ? [0, 0] : [0, -8],
    { clamp: true }
  );

  // Final inside-phone discovery message reveals seamlessly inside the Payments screen
  const insideMessageOpacity = useTransform(activeProgress, [0.76, 0.84], [0, 1], { clamp: true });
  const insideMessageY = useTransform(
    activeProgress,
    [0.76, 0.84],
    shouldReduceMotion ? [0, 0] : [10, 0],
    { clamp: true }
  );

  // 7. Ending Outside Phone: Restrained Editorial Statement & Simple CTA
  // Appears after TRACK / EVERY PAYMENT fade out
  const finalStatementOpacity = useTransform(activeProgress, [0.85, 0.92], [0, 1], { clamp: true });
  const finalStatementY = useTransform(
    activeProgress,
    [0.85, 0.92],
    shouldReduceMotion ? [0, 0] : [14, 0],
    { clamp: true }
  );

  // Simple CTA appears last
  const finalCtaOpacity = useTransform(activeProgress, [0.90, 0.97], [0, 1], { clamp: true });
  const finalCtaY = useTransform(
    activeProgress,
    [0.90, 0.97],
    shouldReduceMotion ? [0, 0] : [10, 0],
    { clamp: true }
  );

  const finalContentPointer = useTransform(activeProgress, (v) => (v >= 0.88 ? 'auto' : 'none'));

  return (
    <section
      id="product-story"
      ref={containerRef}
      className="relative w-full h-[300vh] text-[#f8f8fa] bg-[#0c0f1d]"
      style={{
        backgroundColor: '#0c0f1d',
      }}
    >
      {/* ── Sticky Viewport (Pinned 100vh during the scroll transformation) ── */}
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center isolate px-4"
        style={{
          background:
            'radial-gradient(ellipse 85% 75% at 50% 48%, #212a4a 0%, #1a2038 42%, #121628 75%, #0c0f1d 100%)',
        }}
      >
        {/* ── Layer 0: Ultra-Subtle Studio Backdrop Matte Texture (Behind Everything) (z-0, 1.5% opacity) ── */}
        <div
          className="absolute inset-0 z-0 pointer-events-none select-none opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
          aria-hidden="true"
        />

        {/* ── Layer 3: Deliberate Editorial Typography (Bilateral Horizontal Wings) (z-30) ── */}
        <div
          className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden="true"
        >
          {/* Stage 1: MANAGE [PHONE] EVERY LOAN */}
          <motion.div
            style={{ opacity: text1ContainerOpacity }}
            className="absolute inset-x-0 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_min(350px,84vw)_minmax(0,1fr)] items-center px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1680px] mx-auto will-change-transform"
          >
            {/* Left Wing: MANAGE (Enters from Left: -80px -> 0) */}
            <motion.div
              style={{ x: text1LeftX, opacity: text1LeftOpacity }}
              className="w-full text-center md:text-right pr-0 md:pr-6 lg:pr-10 xl:pr-14 will-change-transform -translate-y-12 md:translate-y-0"
            >
              <span
                className="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-[clamp(1.85rem,3.2vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-none inline-block whitespace-nowrap"
                style={{
                  color: 'rgba(248, 248, 250, 0.98)',
                  textShadow: '0 2px 12px rgba(0, 0, 0, 0.14)',
                }}
              >
                Manage
              </span>
            </motion.div>

            {/* Central Reserved Negative Space for Centered Phone */}
            <div className="hidden md:block w-full h-1 invisible pointer-events-none" />

            {/* Right Wing: EVERY LOAN (Enters from Right: +100px -> 0) */}
            <motion.div
              style={{ x: text1RightX, opacity: text1RightOpacity }}
              className="w-full text-center md:text-left pl-0 md:pl-6 lg:pl-10 xl:pl-14 will-change-transform translate-y-12 md:translate-y-0"
            >
              <span
                className="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-[clamp(1.85rem,3.2vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-none inline-block whitespace-nowrap"
                style={{
                  color: 'rgba(248, 248, 250, 0.96)',
                  textShadow: '0 2px 12px rgba(0, 0, 0, 0.14)',
                }}
              >
                Every Loan
              </span>
            </motion.div>
          </motion.div>

          {/* Stage 2: STAY [PHONE] CONNECTED */}
          <motion.div
            style={{ opacity: text2ContainerOpacity }}
            className="absolute inset-x-0 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_min(350px,84vw)_minmax(0,1fr)] items-center px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1680px] mx-auto will-change-transform"
          >
            {/* Left Wing: STAY (Enters from Left: -100px -> 0) */}
            <motion.div
              style={{ x: text2LeftX, opacity: text2LeftOpacity }}
              className="w-full text-center md:text-right pr-0 md:pr-6 lg:pr-10 xl:pr-14 will-change-transform -translate-y-12 md:translate-y-0"
            >
              <span
                className="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-[clamp(1.85rem,3.2vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-none inline-block whitespace-nowrap"
                style={{
                  color: 'rgba(248, 248, 250, 0.98)',
                  textShadow: '0 2px 12px rgba(0, 0, 0, 0.14)',
                }}
              >
                Stay
              </span>
            </motion.div>

            {/* Central Reserved Negative Space for Centered Phone */}
            <div className="hidden md:block w-full h-1 invisible pointer-events-none" />

            {/* Right Wing: CONNECTED (Enters from Right: +85px -> 0) */}
            <motion.div
              style={{ x: text2RightX, opacity: text2RightOpacity }}
              className="w-full text-center md:text-left pl-0 md:pl-6 lg:pl-10 xl:pl-14 will-change-transform translate-y-12 md:translate-y-0"
            >
              <span
                className="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-[clamp(1.85rem,3.2vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-none inline-block whitespace-nowrap"
                style={{
                  color: 'rgba(248, 248, 250, 0.96)',
                  textShadow: '0 2px 12px rgba(0, 0, 0, 0.14)',
                }}
              >
                Connected
              </span>
            </motion.div>
          </motion.div>

          {/* Stage 3: TRACK [PHONE] EVERY PAYMENT */}
          <motion.div
            style={{ opacity: text3ContainerOpacity }}
            className="absolute inset-x-0 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_min(350px,84vw)_minmax(0,1fr)] items-center px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1680px] mx-auto will-change-transform"
          >
            {/* Left Wing: TRACK (Enters from Left: -75px -> 0) */}
            <motion.div
              style={{ x: text3LeftX, opacity: text3LeftOpacity }}
              className="w-full text-center md:text-right pr-0 md:pr-6 lg:pr-10 xl:pr-14 will-change-transform -translate-y-12 md:translate-y-0"
            >
              <span
                className="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-[clamp(1.85rem,3.2vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-none inline-block whitespace-nowrap"
                style={{
                  color: 'rgba(248, 248, 250, 0.98)',
                  textShadow: '0 2px 12px rgba(0, 0, 0, 0.14)',
                }}
              >
                Track
              </span>
            </motion.div>

            {/* Central Reserved Negative Space for Centered Phone */}
            <div className="hidden md:block w-full h-1 invisible pointer-events-none" />

            {/* Right Wing: EVERY PAYMENT (Enters from Right: +110px -> 0) */}
            <motion.div
              style={{ x: text3RightX, opacity: text3RightOpacity }}
              className="w-full text-center md:text-left pl-0 md:pl-6 lg:pl-10 xl:pl-14 will-change-transform translate-y-12 md:translate-y-0"
            >
              <span
                className="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-[clamp(1.85rem,3.2vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-none inline-block whitespace-nowrap"
                style={{
                  color: 'rgba(248, 248, 250, 0.96)',
                  textShadow: '0 2px 12px rgba(0, 0, 0, 0.14)',
                }}
              >
                Every Payment
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Layer 2: Smartphone + Real Mobile UI (z-20) ── */}
        {/* Outer wrapper: Non-scroll-dependent automatic entrance. Smoothly fades and settles in when entering Section 5 */}
        <motion.div
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96, y: shouldReduceMotion ? 0 : 14 }}
          animate={
            isSectionInView
              ? { opacity: 1, scale: 1, y: 0 }
              : { opacity: 0, scale: shouldReduceMotion ? 1 : 0.96, y: shouldReduceMotion ? 0 : 14 }
          }
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-20 will-change-transform flex items-center justify-center pointer-events-auto [perspective:1000px]"
        >
          {/* Inner motion div: Continuous scroll-driven physical trajectory */}
          <motion.div
            style={{
              y: phoneY,
              scale: phoneScale,
              rotateY: phoneRotateY,
            }}
            className="relative will-change-transform flex items-center justify-center"
          >
            {/* Soft Ambient Shadow / Studio Light field directly behind phone */}
            <div className="absolute -inset-10 sm:-inset-16 rounded-full pointer-events-none -z-10 overflow-visible flex items-center justify-center">
              {/* Natural falloff grounding shadow directly behind phone */}
              <div
                className="absolute w-[310px] sm:w-[350px] h-[560px] sm:h-[620px] rounded-[50px] bg-[#070a14]/65 blur-3xl pointer-events-none"
                aria-hidden="true"
              />

              {/* Extremely subtle stage-reactive atmospheric illumination (barely noticeable 2.5–3.5% tint) */}
              {/* Dashboard: very subtle deep teal/blue tint */}
              <motion.div
                style={{ opacity: screen1Opacity }}
                className="absolute w-[420px] sm:w-[500px] h-[560px] sm:h-[640px] rounded-full bg-[#10b981]/[0.032] blur-[100px] sm:blur-[120px] pointer-events-none"
              />
              {/* Chat: very subtle indigo/blue tint */}
              <motion.div
                style={{ opacity: screen2Opacity }}
                className="absolute w-[420px] sm:w-[500px] h-[560px] sm:h-[640px] rounded-full bg-[#6366f1]/[0.032] blur-[100px] sm:blur-[120px] pointer-events-none"
              />
              {/* Payments: very subtle blue/amber tint (persists through ending) */}
              <motion.div
                style={{ opacity: screen3Opacity }}
                className="absolute w-[420px] sm:w-[500px] h-[560px] sm:h-[640px] rounded-full bg-[#f59e0b]/[0.024] blur-[100px] sm:blur-[120px] pointer-events-none"
              />
            </div>

            <SmartphoneFrame>
              {/* Screen 1: Dashboard */}
              <motion.div style={{ opacity: screen1Opacity }} className="absolute inset-0 bg-[#f8fafc]">
                <MobileDashboardScreen />
              </motion.div>

              {/* Screen 2: Chat */}
              <motion.div style={{ opacity: screen2Opacity }} className="absolute inset-0 bg-[#f8fafc]">
                <MobileChatScreen />
              </motion.div>

              {/* Screen 3: Payments (Visual Anchor through ending with inside discovery reveal) */}
              <motion.div style={{ opacity: screen3Opacity }} className="absolute inset-0 bg-[#f8fafc]">
                <MobilePaymentsScreen
                  paymentListOpacity={paymentListOpacity}
                  paymentListY={paymentListY}
                  insideMessageOpacity={insideMessageOpacity}
                  insideMessageY={insideMessageY}
                />
              </motion.div>
            </SmartphoneFrame>
          </motion.div>
        </motion.div>

        {/* ── Layer 4: Final Restrained Editorial Statement & Simple CTA (~85–100%) (z-40) ── */}
        <div
          className="absolute left-0 right-0 z-40 flex flex-col items-center justify-center text-center max-w-[640px] mx-auto px-4 select-none top-[calc(50%+min(275px,36.5vh))] sm:top-[calc(50%+min(285px,37.5vh))] pointer-events-none"
        >
          {/* Editorial Statement: Appears after TRACK / EVERY PAYMENT fade */}
          <motion.p
            style={{
              opacity: finalStatementOpacity,
              y: finalStatementY,
            }}
            className="font-['Space_Grotesk'] text-base sm:text-lg md:text-xl font-semibold text-white/95 tracking-[-0.02em] leading-snug mb-3 will-change-transform"
          >
            One workspace for every part of your lending business.
          </motion.p>

          {/* Refined Minimalist Editorial Pill: Appears last */}
          <motion.div
            style={{
              opacity: finalCtaOpacity,
              y: finalCtaY,
              pointerEvents: finalContentPointer,
            }}
            className="will-change-transform pointer-events-auto"
          >
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-white text-[#0c0f1d] hover:bg-[#f8fafc] text-xs sm:text-sm font-bold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 no-underline group"
            >
              <span>Explore Platform</span>
              <ArrowRight
                size={13}
                weight="bold"
                className="text-[#0c0f1d]/70 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
