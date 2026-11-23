import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Coins,
    ArrowRight,
    CircleNotch,
    WarningCircle,
    Eye,
    EyeSlash,
    UserCheck,
    MagnifyingGlass,
    FilePlus,
    ShieldCheck
} from '@phosphor-icons/react';
import { useLogin } from '../../hooks/useAuth';
import PublicLoanFlow from '../Public/PublicLoanFlow';
import TrackLoanRequest from '../Public/TrackLoanRequest';
import AuthShowcase from './components/AuthShowcase';
import { ThemeToggle } from '../../components/common/ThemeToggle';

/**
 * Login — Premium Split-View Authentication with Adaptive Intent Switcher
 * Combines Option A (Split View) + Option C (Lender Console / Borrower Portal).
 * Seamlessly matches both Light (Fintech Sky Pastel #E4EEFB) and Dark (Pitch-Black Obsidian) themes.
 */
const Login = () => {
    const navigate = useNavigate();
    const loginMutation = useLogin();

    // Form state
    const [activeTab, setActiveTab] = useState('lender'); // 'lender' | 'borrower'
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // Modal state for borrower actions
    const [showLoanFlow, setShowLoanFlow] = useState(false);
    const [showTracker, setShowTracker] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginMutation.mutateAsync({
                identifier: formData.identifier,
                email: formData.identifier, // Fallback for legacy handlers
                password: formData.password,
            });
            const redirectTo = response.data?.redirectTo || '/';
            navigate(redirectTo);
        } catch (error) {
            // Error managed via loginMutation.error
        }
    };

    const isLoading = loginMutation.isPending;
    const error = loginMutation.error;

    return (
        <>
            <div className="min-h-screen w-full bg-[#E4EEFB] dark:bg-[#000000] text-[#17191F] dark:text-white flex flex-col lg:flex-row antialiased selection:bg-[#494FDF]/30 transition-colors duration-200">
                {/* ───────────────────────────────────────────────────────────── */}
                {/* LEFT COLUMN: AUTHENTICATION CONSOLE (45% on lg screens)       */}
                {/* ───────────────────────────────────────────────────────────── */}
                <div className="w-full lg:w-[45%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 z-10 bg-white/85 dark:bg-[#000000] border-r border-[#c9dcfa] dark:border-white/[0.08] backdrop-blur-xl transition-colors duration-200">
                    {/* Top: Brand Header + Theme Toggle */}
                    <div className="flex items-center justify-between">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#494FDF] rounded-xl"
                            aria-label="Money Lender Home"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#d2e2fa] dark:bg-[#16181A] border border-[#bcd2f5] dark:border-white/10 flex items-center justify-center text-[#0c0d12] dark:text-white shadow-xs transition-transform duration-200 group-hover:scale-105">
                                <Coins size={22} weight="regular" />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-sm font-bold tracking-tight text-[#0c0d12] dark:text-white">
                                    Money Lender
                                </span>
                                <span className="text-[11px] font-medium text-[#657085] dark:text-gray-500 tracking-wide mt-0.5">
                                    Capital Operations
                                </span>
                            </div>
                        </Link>

                        {/* Theme Switcher */}
                        <ThemeToggle compact={true} />
                    </div>

                    {/* Middle: Auth Header + Adaptive Intent Switcher + Form */}
                    <div className="my-auto py-8 max-w-md w-full mx-auto lg:mx-0">
                        {/* Typographic Headline */}
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0c0d12] dark:text-white">
                                Financial control, simplified.
                            </h1>
                            <p className="mt-2 text-sm text-[#657085] dark:text-gray-400 leading-relaxed">
                                Securely manage your lending operations and stay in control of every transaction.
                            </p>
                        </div>

                        {/* Adaptive Segmented Role Switcher */}
                        <div className="relative p-1 rounded-xl bg-[#dce9f8] dark:bg-[#16181A] border border-[#c9dcfa] dark:border-white/[0.08] grid grid-cols-2 gap-1 mb-6">
                            <button
                                type="button"
                                onClick={() => setActiveTab('lender')}
                                className={`relative py-2.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 text-center ${
                                    activeTab === 'lender'
                                        ? 'text-[#0c0d12] dark:text-white shadow-xs'
                                        : 'text-[#657085] dark:text-gray-400 hover:text-[#0c0d12] dark:hover:text-gray-200'
                                }`}
                            >
                                {activeTab === 'lender' && (
                                    <motion.div
                                        layoutId="auth-role-pill"
                                        className="absolute inset-0 rounded-lg bg-white dark:bg-[#26262A] border border-[#c9dcfa]/60 dark:border-white/[0.1] -z-10 shadow-xs"
                                        transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                                    />
                                )}
                                Lender Console
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('borrower')}
                                className={`relative py-2.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 text-center ${
                                    activeTab === 'borrower'
                                        ? 'text-[#0c0d12] dark:text-white shadow-xs'
                                        : 'text-[#657085] dark:text-gray-400 hover:text-[#0c0d12] dark:hover:text-gray-200'
                                }`}
                            >
                                {activeTab === 'borrower' && (
                                    <motion.div
                                        layoutId="auth-role-pill"
                                        className="absolute inset-0 rounded-lg bg-white dark:bg-[#26262A] border border-[#c9dcfa]/60 dark:border-white/[0.1] -z-10 shadow-xs"
                                        transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                                    />
                                )}
                                Borrower Portal
                            </button>
                        </div>

                        {/* Form Content Switching */}
                        <AnimatePresence mode="wait">
                            {activeTab === 'lender' ? (
                                <motion.div
                                    key="lender-form"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {/* Error Notification */}
                                    {error && (
                                        <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5">
                                            <WarningCircle size={16} weight="bold" className="text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                                            <span>
                                                {error.response?.data?.message || 'Invalid credentials. Please verify your email/password.'}
                                            </span>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Identifier Input */}
                                        <div>
                                            <label
                                                htmlFor="identifier"
                                                className="block text-[11px] font-semibold uppercase tracking-wider text-[#4e4e56] dark:text-gray-400 mb-1.5"
                                            >
                                                Email Address or Username
                                            </label>
                                            <input
                                                id="identifier"
                                                name="identifier"
                                                type="text"
                                                autoComplete="username"
                                                required
                                                disabled={isLoading}
                                                value={formData.identifier}
                                                onChange={handleChange}
                                                placeholder="you@company.com or username"
                                                className="fintech-auth-input"
                                            />
                                        </div>

                                        {/* Password Input */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label
                                                    htmlFor="password"
                                                    className="block text-[11px] font-semibold uppercase tracking-wider text-[#4e4e56] dark:text-gray-400"
                                                >
                                                    Password
                                                </label>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    id="password"
                                                    name="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    autoComplete="current-password"
                                                    required
                                                    disabled={isLoading}
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    placeholder="Enter your password"
                                                    className="fintech-auth-input pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    tabIndex={-1}
                                                    onClick={() => setShowPassword((prev) => !prev)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#657085] hover:text-[#0c0d12] dark:text-gray-400 dark:hover:text-white transition-colors focus:outline-none"
                                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                >
                                                    {showPassword ? (
                                                        <EyeSlash size={17} weight="bold" />
                                                    ) : (
                                                        <Eye size={17} weight="bold" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Remember Me */}
                                        <div className="flex items-center justify-between pt-1">
                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={rememberMe}
                                                    onChange={(e) => setRememberMe(e.target.checked)}
                                                    className="w-4 h-4 rounded border-[#c9dcfa] dark:border-white/20 bg-white dark:bg-[#16181A] text-[#494FDF] focus:ring-[#494FDF] focus:ring-offset-0 cursor-pointer"
                                                />
                                                <span className="text-xs text-[#657085] dark:text-gray-400">Remember this device</span>
                                            </label>
                                        </div>

                                        {/* Primary Sign In CTA */}
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full mt-2 h-11 px-4 rounded-xl bg-[#494FDF] hover:bg-[#4349CF] active:scale-[0.99] text-white font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-md shadow-[#494FDF]/25 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#494FDF] focus:ring-offset-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <CircleNotch size={18} className="animate-spin" />
                                                    <span>Signing in...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Sign In to Console</span>
                                                    <ArrowRight size={16} weight="bold" />
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    {/* Registration Link */}
                                    <div className="mt-6 pt-5 border-t border-[#e2edf9] dark:border-white/[0.08] text-center">
                                        <p className="text-xs text-[#657085] dark:text-gray-400">
                                            Need a new lender account?{' '}
                                            <Link
                                                to="/register"
                                                className="font-semibold text-[#494FDF] dark:text-white hover:underline underline-offset-4 transition-colors"
                                            >
                                                Create Account
                                            </Link>
                                        </p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="borrower-portal"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-3"
                                >
                                    <div className="p-4 rounded-xl bg-[#eef5fc] dark:bg-[#16181A] border border-[#c9dcfa] dark:border-white/[0.08] mb-4">
                                        <p className="text-xs font-medium text-[#17191F] dark:text-gray-300 leading-relaxed">
                                            Borrower services are managed independently. You can sign in to view active loans, check review status, or submit a new loan request.
                                        </p>
                                    </div>

                                    {/* Action 1: Customer Portal Login */}
                                    <button
                                        type="button"
                                        onClick={() => navigate('/portal/login')}
                                        className="w-full p-3.5 rounded-xl bg-white dark:bg-[#16181A] hover:bg-[#eef5fc] dark:hover:bg-[#1C1D20] border border-[#c9dcfa] dark:border-white/[0.08] hover:border-[#494FDF]/40 transition-all flex items-center justify-between text-left group shadow-xs"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#eef2fd] dark:bg-white/[0.05] border border-[#dcdefb] dark:border-white/[0.08] flex items-center justify-center text-[#494FDF] group-hover:scale-105 transition-transform">
                                                <UserCheck size={18} weight="bold" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-semibold text-[#0c0d12] dark:text-white">
                                                    Customer Portal Login
                                                </h4>
                                                <p className="text-[11px] text-[#657085] dark:text-gray-400">
                                                    Sign in with registered customer credentials
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowRight size={15} className="text-[#657085] group-hover:text-[#494FDF] dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                                    </button>

                                    {/* Action 2: Check Loan Status (Tracker Modal) */}
                                    <button
                                        type="button"
                                        onClick={() => setShowTracker(true)}
                                        className="w-full p-3.5 rounded-xl bg-white dark:bg-[#16181A] hover:bg-[#eef5fc] dark:hover:bg-[#1C1D20] border border-[#c9dcfa] dark:border-white/[0.08] hover:border-[#494FDF]/40 transition-all flex items-center justify-between text-left group shadow-xs"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-white/[0.05] border border-amber-200 dark:border-white/[0.08] flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                                                <MagnifyingGlass size={18} weight="bold" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-semibold text-[#0c0d12] dark:text-white">
                                                    Check Loan Request Status
                                                </h4>
                                                <p className="text-[11px] text-[#657085] dark:text-gray-400">
                                                    Track application progress with your reference ID
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowRight size={15} className="text-[#657085] group-hover:text-[#494FDF] dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                                    </button>

                                    {/* Action 3: Request a Loan (Public Loan Flow Modal) */}
                                    <button
                                        type="button"
                                        onClick={() => setShowLoanFlow(true)}
                                        className="w-full p-3.5 rounded-xl bg-white dark:bg-[#16181A] hover:bg-[#eef5fc] dark:hover:bg-[#1C1D20] border border-[#c9dcfa] dark:border-white/[0.08] hover:border-[#494FDF]/40 transition-all flex items-center justify-between text-left group shadow-xs"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-white/[0.05] border border-emerald-200 dark:border-white/[0.08] flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                                                <FilePlus size={18} weight="bold" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-semibold text-[#0c0d12] dark:text-white">
                                                    Request a New Loan
                                                </h4>
                                                <p className="text-[11px] text-[#657085] dark:text-gray-400">
                                                    Submit an online financing application
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowRight size={15} className="text-[#657085] group-hover:text-[#494FDF] dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Bottom: Session Security Reassurance */}
                    <div className="pt-6 border-t border-[#e2edf9] dark:border-white/[0.08] flex items-center justify-between text-[11px] text-[#657085] dark:text-gray-500">
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-[#494FDF] dark:text-gray-400" />
                            <span>Authenticated session security</span>
                        </div>
                        <span>Money Lender</span>
                    </div>
                </div>

                {/* ───────────────────────────────────────────────────────────── */}
                {/* RIGHT COLUMN: FINANCIAL SHOWCASE (55% on lg screens)          */}
                {/* ───────────────────────────────────────────────────────────── */}
                <div className="hidden lg:block lg:w-[55%] min-h-screen">
                    <AuthShowcase />
                </div>
            </div>

            {/* Existing Borrower Modals (Preserved Without Duplication) */}
            <AnimatePresence>
                {showLoanFlow && <PublicLoanFlow onClose={() => setShowLoanFlow(false)} />}
                {showTracker && <TrackLoanRequest onClose={() => setShowTracker(false)} />}
            </AnimatePresence>
        </>
    );
};

export default Login;
