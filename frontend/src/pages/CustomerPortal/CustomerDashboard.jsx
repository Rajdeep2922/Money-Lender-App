import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FiDollarSign, FiCalendar, FiCreditCard, FiAlertCircle, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { customerPortalAPI } from '../../services/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import useAuthStore from '../../store/authStore';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount || 0);
};

const CustomerDashboard = () => {
    const { user } = useAuthStore();

    const { data: loansData, isLoading, error } = useQuery({
        queryKey: ['customerLoans'],
        queryFn: async () => {
            const response = await customerPortalAPI.getLoans();
            return response.data;
        },
    });

    if (isLoading) {
        return <PageLoader />;
    }

    const loans = loansData?.data || [];
    const activeLoans = loans.filter(l => l.status === 'active');
    const totalOutstanding = activeLoans.reduce((sum, loan) => sum + (loan.remainingBalance || 0), 0);

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome, {user?.firstName || user?.fullName || 'Customer'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    View your loans and payments
                </p>
            </motion.div>

            {/* Error Display */}
            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-red-800 dark:text-red-300 text-sm">
                        Error: {error.response?.data?.message || error.message}
                    </p>
                </div>
            )}

            {/* Summary Cards - Mobile: Horizontal Scroll */}
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card p-4 min-w-[140px] sm:min-w-0 flex-shrink-0"
                >
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 sm:p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg sm:rounded-xl">
                            <FiDollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Outstanding</p>
                            <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
                                {formatCurrency(totalOutstanding)}
                            </p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card p-4 min-w-[140px] sm:min-w-0 flex-shrink-0"
                >
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg sm:rounded-xl">
                            <FiCreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Active</p>
                            <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
                                {activeLoans.length}
                            </p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card p-4 min-w-[140px] sm:min-w-0 flex-shrink-0"
                >
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg sm:rounded-xl">
                            <FiCalendar className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total</p>
                            <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
                                {loans.length}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Loans List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card"
            >
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        Your Loans
                    </h2>
                </div>

                {loans.length === 0 ? (
                    <div className="p-8 text-center">
                        <FiAlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                            You don't have any loans yet.
                        </p>
                    </div>
                ) : (
                    <div className="p-3 sm:p-4 space-y-3">
                        {loans.map((loan) => (
                            <Link
                                key={loan._id}
                                to={`/portal/loans/${loan._id}`}
                                className="block p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.99] transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            Loan #{loan.loanNumber || loan._id.slice(-6).toUpperCase()}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {formatCurrency(loan.principal)} • {loan.loanDurationMonths} months
                                        </p>
                                    </div>
                                    <FiChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${loan.status === 'active'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : loan.status === 'completed'
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                                        }`}>
                                        {loan.status}
                                    </span>
                                    <p className="font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(loan.remainingBalance || loan.totalAmountPayable)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default CustomerDashboard;
