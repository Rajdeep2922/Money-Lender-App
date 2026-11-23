import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Coins,
    ArrowRight,
    CircleNotch,
    WarningCircle,
    Eye,
    EyeSlash,
    ShieldCheck
} from '@phosphor-icons/react';
import { useRegister } from '../../hooks/useAuth';
import AuthShowcase from './components/AuthShowcase';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import toast from 'react-hot-toast';

/**
 * Register — Premium Split-View Lender Registration
 * Matches both Light (Fintech Sky Pastel #E4EEFB) and Dark (Pitch-Black Obsidian) themes.
 * Eliminates confirm-password friction and includes real-time strength feedback.
 */
const Register = () => {
    const navigate = useNavigate();
    const registerMutation = useRegister();

    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showOptionalHandle, setShowOptionalHandle] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Calculate password strength
    const passwordScore = useMemo(() => {
        const pwd = formData.password;
        if (!pwd) return 0;
        let score = 0;
        if (pwd.length >= 6) score += 1;
        if (pwd.length >= 8) score += 1;
        if (/[0-9]/.test(pwd)) score += 1;
        if (/[^A-Za-z0-9]/.test(pwd) || /[A-Z]/.test(pwd)) score += 1;
        return score; // 0 to 4
    }, [formData.password]);

    const strengthLabel = useMemo(() => {
        if (!formData.password) return '';
        if (passwordScore <= 1) return 'Weak (min 6 characters)';
        if (passwordScore === 2) return 'Fair';
        if (passwordScore === 3) return 'Good';
        return 'Strong';
    }, [formData.password, passwordScore]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            await registerMutation.mutateAsync({
                email: formData.email.trim(),
                username: formData.username.trim() || undefined,
                password: formData.password,
            });
            navigate('/login');
        } catch (error) {
            // Handled by mutation
        }
    };

    const isLoading = registerMutation.isPending;
    const error = registerMutation.error;

    return (
        <div className="min-h-screen w-full bg-[#E4EEFB] dark:bg-[#000000] text-[#17191F] dark:text-white flex flex-col lg:flex-row antialiased selection:bg-[#494FDF]/30 transition-colors duration-200">
            {/* ───────────────────────────────────────────────────────────── */}
            {/* LEFT COLUMN: REGISTRATION CONSOLE (45% on lg screens)         */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="w-full lg:w-[45%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 z-10 bg-white/85 dark:bg-[#000000] border-r border-[#c9dcfa] dark:border-white/[0.08] backdrop-blur-xl transition-colors duration-200">
                {/* Brand Header + Theme Toggle */}
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

                {/* Form Section */}
                <div className="my-auto py-8 max-w-md w-full mx-auto lg:mx-0">
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0c0d12] dark:text-white">
                            Create your lender account
                        </h1>
                        <p className="mt-2 text-sm text-[#657085] dark:text-gray-400 leading-relaxed">
                            Set up your capital operations workspace and streamline your lending portfolio.
                        </p>
                    </div>

                    {/* Error Notification */}
                    {error && (
                        <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5">
                            <WarningCircle size={16} weight="bold" className="text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                            <span>
                                {error.response?.data?.message || 'Registration failed. Please check your details.'}
                            </span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Primary Identifier: Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-[11px] font-semibold uppercase tracking-wider text-[#4e4e56] dark:text-gray-400 mb-1.5"
                            >
                                Work or Business Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                disabled={isLoading}
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@company.com"
                                className="fintech-auth-input"
                            />
                        </div>

                        {/* Optional Custom Handle Toggle */}
                        <div>
                            {!showOptionalHandle ? (
                                <button
                                    type="button"
                                    onClick={() => setShowOptionalHandle(true)}
                                    className="text-[11px] text-[#494FDF] dark:text-[#4F55F1] hover:underline font-medium transition-colors inline-flex items-center gap-1"
                                >
                                    + Customize username / account handle (optional)
                                </button>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label
                                            htmlFor="username"
                                            className="block text-[11px] font-semibold uppercase tracking-wider text-[#4e4e56] dark:text-gray-400"
                                        >
                                            Username (Optional)
                                        </label>
                                        <span className="text-[10px] text-[#657085] dark:text-gray-500">Auto-derived if blank</span>
                                    </div>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        autoComplete="username"
                                        disabled={isLoading}
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="e.g. zenith_capital"
                                        className="fintech-auth-input"
                                    />
                                </motion.div>
                            )}
                        </div>

                        {/* Single Password Input */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label
                                    htmlFor="password"
                                    className="block text-[11px] font-semibold uppercase tracking-wider text-[#4e4e56] dark:text-gray-400"
                                >
                                    Password
                                </label>
                                {strengthLabel && (
                                    <span
                                        className={`text-[10px] font-medium ${
                                            passwordScore <= 1
                                                ? 'text-amber-600 dark:text-amber-400'
                                                : passwordScore === 2
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-emerald-600 dark:text-emerald-400'
                                        }`}
                                    >
                                        {strengthLabel}
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    required
                                    disabled={isLoading}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="At least 6 characters"
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

                            {/* Password Strength Meter */}
                            {formData.password && (
                                <div className="mt-2 grid grid-cols-4 gap-1.5">
                                    {[1, 2, 3, 4].map((step) => (
                                        <div
                                            key={step}
                                            className={`h-1 rounded-full transition-colors duration-200 ${
                                                step <= passwordScore
                                                    ? passwordScore <= 1
                                                        ? 'bg-amber-400'
                                                        : passwordScore === 2
                                                        ? 'bg-blue-400'
                                                        : 'bg-emerald-400'
                                                    : 'bg-[#dce9f8] dark:bg-white/10'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-3 h-11 px-4 rounded-xl bg-[#494FDF] hover:bg-[#4349CF] active:scale-[0.99] text-white font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-md shadow-[#494FDF]/25 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#494FDF] focus:ring-offset-2"
                        >
                            {isLoading ? (
                                <>
                                    <CircleNotch size={18} className="animate-spin" />
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create Lender Account</span>
                                    <ArrowRight size={16} weight="bold" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Back to Sign In */}
                    <div className="mt-6 pt-5 border-t border-[#e2edf9] dark:border-white/[0.08] text-center">
                        <p className="text-xs text-[#657085] dark:text-gray-400">
                            Already registered?{' '}
                            <Link
                                to="/login"
                                className="font-semibold text-[#494FDF] dark:text-white hover:underline underline-offset-4 transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Bottom: Session Security */}
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
    );
};

export default Register;
