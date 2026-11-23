import React from 'react';
import { motion } from 'framer-motion';
import { TrendUp, Users, CreditCard, ChartBar, CheckCircle } from '@phosphor-icons/react';

/**
 * AuthShowcase — High-Craft Financial Showcase
 * Features the three financial overview cards (Total Disbursed, Monthly Repayment Pace, and Recent Disbursals)
 * with refined, authentic typography and seamless Light & Dark theme harmonization.
 */
const AuthShowcase = () => {
    return (
        <div className="relative h-full w-full bg-gradient-to-br from-[#eaf2fc] via-[#e4eefb] to-[#d8e7f8] dark:from-[#000000] dark:via-[#090a0f] dark:to-[#000000] text-[#17191F] dark:text-white flex flex-col justify-between p-8 xl:p-12 overflow-hidden border-l border-[#c9dcfa] dark:border-white/[0.08] transition-colors duration-200">
            {/* Subtle Ambient Lighting */}
            <div
                className="absolute top-1/4 -right-20 w-[420px] h-[420px] bg-[#494FDF]/10 dark:bg-[#494FDF]/15 rounded-full blur-[120px] pointer-events-none"
                aria-hidden="true"
            />
            <div
                className="absolute -bottom-20 left-10 w-[360px] h-[360px] bg-[#d2e2fa]/60 dark:bg-[#494FDF]/10 rounded-full blur-[100px] pointer-events-none"
                aria-hidden="true"
            />

            {/* Top Showcase Header */}
            <div className="relative z-10 max-w-md">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#d2e2fa] dark:bg-white/[0.05] border border-[#bcd2f5] dark:border-white/[0.08] backdrop-blur-md mb-5">
                    <span className="w-2 h-2 rounded-full bg-[#494FDF] animate-pulse" />
                    <span className="text-[11px] font-semibold tracking-wider uppercase text-[#2f349f] dark:text-gray-300">
                        Portfolio Overview
                    </span>
                </div>

                <h2 className="text-2xl xl:text-3xl font-bold tracking-tight text-[#0c0d12] dark:text-white leading-tight">
                    Your lending business. <br />
                    <span className="text-[#657085] dark:text-gray-400">Under complete control.</span>
                </h2>
                <p className="mt-2 text-sm text-[#657085] dark:text-gray-400 leading-relaxed">
                    Automated ledger tracking, organized borrower accounts, and transparent repayment records.
                </p>
            </div>

            {/* Center: Financial Showcase Cards */}
            <div className="relative z-10 my-6 flex flex-col gap-4 max-w-md w-full">
                {/* Card 1: Total Loans Disbursed */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="p-5 rounded-2xl bg-white/95 dark:bg-[#16181A] border border-[#c9dcfa] dark:border-white/[0.08] shadow-[0_12px_36px_rgba(73,79,223,0.06)] dark:shadow-2xl relative overflow-hidden"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#eef2fd] dark:bg-white/[0.06] border border-[#dcdefb] dark:border-white/[0.08] flex items-center justify-center text-[#494FDF] dark:text-[#4F55F1]">
                                <CreditCard size={18} weight="bold" />
                            </div>
                            <span className="text-xs font-semibold text-[#17191F] dark:text-gray-300 tracking-wide">
                                Total Loans Disbursed
                            </span>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                            <TrendUp size={11} weight="bold" />
                            +14.2% MoM
                        </span>
                    </div>

                    <div className="mt-3.5 flex items-baseline gap-2">
                        <span className="text-2xl xl:text-3xl font-bold text-[#0c0d12] dark:text-white tracking-tight">
                            ₹14,28,500
                        </span>
                        <span className="text-xs text-[#657085] dark:text-gray-500 font-medium">active portfolio</span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#eef2f7] dark:border-white/[0.06] flex items-center justify-between text-xs text-[#657085] dark:text-gray-400">
                        <span className="flex items-center gap-1.5">
                            <Users size={14} className="text-[#657085] dark:text-gray-400" />
                            <span>Active Borrowers: <strong className="text-[#17191F] dark:text-gray-200">128</strong></span>
                        </span>
                        <span>Outstanding: <strong className="text-[#17191F] dark:text-gray-200">₹4,12,000</strong></span>
                    </div>
                </motion.div>

                {/* Card 2: Monthly Repayment Pace */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.08 }}
                    className="p-4 rounded-2xl bg-white/95 dark:bg-[#16181A] border border-[#c9dcfa] dark:border-white/[0.08] shadow-[0_8px_24px_rgba(73,79,223,0.05)] dark:shadow-lg"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <ChartBar size={16} className="text-[#494FDF] dark:text-[#4F55F1]" weight="bold" />
                            <span className="text-xs font-semibold text-[#17191F] dark:text-gray-300">
                                Monthly Repayment Pace
                            </span>
                        </div>
                        <span className="text-[10px] text-[#657085] dark:text-gray-400 font-medium">
                            Collections 2026
                        </span>
                    </div>

                    <div className="grid grid-cols-6 gap-2 items-end h-14 pt-2">
                        {[
                            { month: 'Jun', height: '45%' },
                            { month: 'Jul', height: '60%' },
                            { month: 'Aug', height: '55%' },
                            { month: 'Sep', height: '75%' },
                            { month: 'Oct', height: '85%' },
                            { month: 'Nov', height: '96%', active: true },
                        ].map((bar, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                                <div
                                    style={{ height: bar.height }}
                                    className={`w-full rounded-md transition-all ${
                                        bar.active
                                            ? 'bg-[#494FDF] shadow-[0_0_12px_rgba(73,79,223,0.4)]'
                                            : 'bg-[#dce9f8] dark:bg-white/[0.08]'
                                    }`}
                                />
                                <span className="text-[10px] text-[#657085] dark:text-gray-500 font-medium">
                                    {bar.month}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Card 3: Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.16 }}
                    className="p-3.5 rounded-xl bg-white/80 dark:bg-white/[0.03] border border-[#c9dcfa] dark:border-white/[0.06] flex items-center justify-between shadow-xs"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <CheckCircle size={14} weight="bold" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-semibold text-[#17191F] dark:text-gray-200">
                                Loan Account #LN-4089
                            </p>
                            <p className="text-[10px] text-[#657085] dark:text-gray-400">
                                Principal ₹50,000 • Disbursed & Active
                            </p>
                        </div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-500/20">
                        Disbursed
                    </span>
                </motion.div>
            </div>

            {/* Bottom Proof Strip */}
            <div className="relative z-10 pt-4 border-t border-[#c9dcfa] dark:border-white/[0.06] flex items-center justify-between text-xs text-[#657085] dark:text-gray-400">
                <span>Designed for commercial and independent lenders</span>
                <span>Active Ledger Engine</span>
            </div>
        </div>
    );
};

export default AuthShowcase;
