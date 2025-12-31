import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import { useRegister } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const Register = () => {
    const navigate = useNavigate();
    const registerMutation = useRegister();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            await registerMutation.mutateAsync({
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });
            navigate('/login');
        } catch (error) {
            // Error handled by mutation onError
        }
    };

    const isLoading = registerMutation.isPending;
    const error = registerMutation.error;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center"
                >
                    <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg">
                        <Wallet className="h-10 w-10 text-white" />
                    </div>
                </motion.div>
                <motion.h2
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white"
                >
                    Create new account
                </motion.h2>
                <motion.p
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400"
                >
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400">
                        Sign in
                    </Link>
                </motion.p>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
            >
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 dark:border-gray-700">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Error Message Display */}
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4"
                                >
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                                                Registration failed
                                            </h3>
                                            <div className="mt-1 text-sm text-red-700 dark:text-red-400">
                                                {error.response?.data?.message || 'An error occurred. Please try again.'}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Username
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="input pl-10 disabled:opacity-60 disabled:cursor-not-allowed"
                                    placeholder="johndoe"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email address
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input pl-10 disabled:opacity-60 disabled:cursor-not-allowed"
                                    placeholder="you@example.com"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input pl-10 disabled:opacity-60 disabled:cursor-not-allowed"
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Confirm Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="input pl-10 disabled:opacity-60 disabled:cursor-not-allowed"
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileTap={!isLoading ? { scale: 0.98 } : {}}
                                className={`
                                    w-full flex items-center justify-center gap-2 px-4 py-3 
                                    bg-gradient-to-r from-teal-500 to-cyan-500 
                                    text-white font-semibold rounded-xl
                                    shadow-md hover:shadow-lg
                                    transition-all duration-200
                                    disabled:opacity-70 disabled:cursor-not-allowed
                                    disabled:hover:shadow-md
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500
                                `}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Creating account...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
