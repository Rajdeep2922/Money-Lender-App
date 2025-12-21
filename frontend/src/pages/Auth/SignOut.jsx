import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, ArrowRight } from 'lucide-react';


const SignOut = () => {
    useEffect(() => {
        // Clear auth data in real app
        // localStorage.removeItem('token');
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl transform rotate-12"></div>
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl transform -rotate-12"></div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="flex justify-center mb-6"
                >
                    <div className="relative group">
                        <div className="absolute inset-0 bg-red-500/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-500"></div>
                        <div className="relative p-5 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-100 dark:border-gray-700">
                            <LogOut className="h-10 w-10 text-red-500 dark:text-red-400" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                >
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Successfully Signed Out
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                        We hope to see you back soon!
                    </p>
                </motion.div>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
            >
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/20 dark:border-gray-700">
                    <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                            Thank you for using <span className="font-semibold text-gray-900 dark:text-white">MoneyLender</span>. Your session has been securely terminated.
                        </p>

                        <div className="space-y-4">
                            <Link to="/login" className="block w-full">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200"
                                >
                                    Sign In Again
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </motion.button>
                            </Link>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">or</span>
                                </div>
                            </div>

                            <button
                                onClick={() => window.close()}
                                className="w-full flex justify-center items-center py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                            >
                                Close Window
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SignOut;
