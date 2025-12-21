import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';

const SignOut = () => {
    useEffect(() => {
        // Clear auth data in real app
        // localStorage.removeItem('token');
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="flex justify-center"
                >
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <LogOut className="h-12 w-12 text-red-600 dark:text-red-400" />
                    </div>
                </motion.div>
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white"
                >
                    Signed Out
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400"
                >
                    You have been successfully signed out of your account.
                </motion.p>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
            >
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 dark:border-gray-700 text-center">
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                        Thank you for using MoneyLender. You can close this window or sign in again to continue working.
                    </p>

                    <Link to="/login">
                        <Button
                            variant="primary"
                            className="w-full flex justify-center py-2 px-4"
                            icon={ArrowRight}
                        >
                            Sign In Again
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default SignOut;
