import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FiDollarSign, FiCalendar, FiCreditCard, FiAlertCircle, FiChevronRight, FiSearch, FiFileText } from 'react-icons/fi';
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
        <div className="space-y-5 sm:space-y-6">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Welcome back, {user?.firstName || user?.fullName || 'Customer'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Manage your loan applications, outstanding balances, and repayment schedules.
                </p>
            </motion.div>

            {/* ── Quick Actions ── */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
                <Link
                    to="/portal/lenders"
                    className="group flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-primary hover:bg-primary-hover text-white shadow-xs hover:-translate-y-0.5 transition-all"
                >
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                        <FiSearch className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base">Browse Verified Lenders</p>
                        <p className="text-white/80 text-xs mt-0.5">Find competitive rates and submit financing inquiries</p>
                    </div>
                    <FiChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                    to="/portal/loan-requests"
                    className="group flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark hover:border-gray-300 dark:hover:border-hairline-dark-hover hover:-translate-y-0.5 transition-all shadow-xs"
                >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <FiFileText className="w-5 h-5 text-primary dark:text-primary-light" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">My Loan Requests</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Track status updates and open live chat</p>
                    </div>
                    <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Link>
            </motion.div>

            {/* Error Display */}
            {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-xl">
                    <p className="text-rose-700 dark:text-rose-400 text-sm">
                        Error: {error.response?.data?.message || error.message}
                    </p>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl p-4 shadow-xs"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light rounded-xl">
                            <FiDollarSign className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Outstanding</p>
                            <p className="text-xl font-bold font-mono tabular-nums text-gray-900 dark:text-white mt-0.5">
                                {formatCurrency(totalOutstanding)}
                            </p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl p-4 shadow-xs"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                            <FiCreditCard className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Active Loans</p>
                            <p className="text-xl font-bold font-mono tabular-nums text-gray-900 dark:text-white mt-0.5">
                                {activeLoans.length}
                            </p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl p-4 shadow-xs"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gray-100 dark:bg-surface-border text-gray-600 dark:text-gray-300 rounded-xl">
                            <FiCalendar className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Borrowed Loans</p>
                            <p className="text-xl font-bold font-mono tabular-nums text-gray-900 dark:text-white mt-0.5">
                                {loans.length}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Loans List */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl shadow-xs overflow-hidden"
            >
                <div className="p-4 sm:p-5 border-b border-hairline-light dark:border-hairline-dark">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                        Your Loans
                    </h2>
                </div>

                {loans.length === 0 ? (
                    <div className="p-12 text-center">
                        <FiAlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                            You don't have any active loans yet.
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Browse lenders to apply for financing.
                        </p>
                    </div>
                ) : (
                    <div className="p-3 sm:p-4 space-y-2.5">
                        {loans.map((loan) => (
                            <Link
                                key={loan._id}
                                to={`/portal/loans/${loan._id}`}
                                className="block p-4 bg-gray-50/70 dark:bg-canvas-dark/40 border border-hairline-light dark:border-hairline-dark rounded-xl hover:border-gray-300 dark:hover:border-hairline-dark-hover active:scale-[0.99] transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                            Loan #{loan.loanNumber || loan._id.slice(-6).toUpperCase()}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono tabular-nums mt-0.5">
                                            {formatCurrency(loan.principal)} · {loan.loanDurationMonths} months · {loan.interestRate}% p.a.
                                        </p>
                                    </div>
                                    <FiChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-hairline-light dark:border-hairline-dark">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                        loan.status === 'active'
                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40'
                                            : loan.status === 'completed'
                                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/40'
                                                : 'bg-gray-100 dark:bg-surface-border text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                            loan.status === 'active' ? 'bg-emerald-500' : loan.status === 'completed' ? 'bg-blue-500' : 'bg-gray-400'
                                        }`} />
                                        {loan.status}
                                    </span>
                                    <p className="font-mono tabular-nums font-semibold text-sm text-gray-900 dark:text-white">
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
