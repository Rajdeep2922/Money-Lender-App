import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Mail, Lock, ArrowRight, Loader2, AlertCircle, Flame, Search } from 'lucide-react';
import { useLogin } from '../../hooks/useAuth';
import PublicLoanFlow from '../Public/PublicLoanFlow';
import TrackLoanRequest from '../Public/TrackLoanRequest';

const Login = () => {
    const navigate = useNavigate();
    const loginMutation = useLogin();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showLoanFlow, setShowLoanFlow] = useState(false);
    const [showTracker, setShowTracker] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginMutation.mutateAsync(formData);
            const redirectTo = response.data?.redirectTo || '/';
            navigate(redirectTo);
        } catch (error) {
            // handled by mutation
        }
    };

    const isLoading = loginMutation.isPending;
    const error = loginMutation.error;

    return (
        <>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="flex justify-center">
                        <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg">
                            <Wallet className="h-10 w-10 text-white" />
                        </div>
                    </motion.div>
                    <motion.h2 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Sign in to your account
                    </motion.h2>
                    <motion.p initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Or{' '}
                        <Link to="/register" className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400">
                            create a new account
                        </Link>
                    </motion.p>
                </div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 dark:border-gray-700">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                                        <div className="flex items-start">
                                            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                                            <div className="ml-3 text-sm text-red-700 dark:text-red-400">
                                                {error.response?.data?.message || 'Invalid credentials. Please try again.'}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} disabled={isLoading} className="input pl-10 disabled:opacity-60 disabled:cursor-not-allowed" placeholder="you@example.com" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input id="password" name="password" type="password" autoComplete="current-password" required value={formData.password} onChange={handleChange} disabled={isLoading} className="input pl-10 disabled:opacity-60 disabled:cursor-not-allowed" placeholder="••••••••" />
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" disabled={isLoading} />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Remember me</label>
                            </div>

                            <motion.button type="submit" disabled={isLoading} whileTap={!isLoading ? { scale: 0.98 } : {}} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                                {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Signing in...</span></> : <><span>Sign in</span><ArrowRight className="w-5 h-5" /></>}
                            </motion.button>
                        </form>
                    </div>

                    {/* ── Customer Section ── */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.45 }} className="mt-6 space-y-3">
                        <p className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            Not a member yet?
                        </p>

                        {/* Request a Loan — opens modal directly, no login needed */}
                        <button
                            onClick={() => setShowLoanFlow(true)}
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold text-sm hover:border-teal-500 hover:text-teal-600 dark:hover:border-teal-400 dark:hover:text-teal-400 transition-all"
                        >
                            <Flame className="w-4 h-4 text-orange-500" />
                            Request a Loan
                        </button>

                        {/* Check My Request — opens tracker modal directly, no login needed */}
                        <button
                            onClick={() => setShowTracker(true)}
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold text-sm hover:border-teal-500 hover:text-teal-600 dark:hover:border-teal-400 dark:hover:text-teal-400 transition-all"
                        >
                            <Search className="w-4 h-4 text-gray-500" />
                            Check My Loan Request
                        </button>
                    </motion.div>
                </motion.div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showLoanFlow && <PublicLoanFlow onClose={() => setShowLoanFlow(false)} />}
                {showTracker && <TrackLoanRequest onClose={() => setShowTracker(false)} />}
            </AnimatePresence>
        </>
    );
};

export default Login;
