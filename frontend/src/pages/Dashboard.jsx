import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiUsers, FiDollarSign, FiCreditCard, FiTrendingUp, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCustomers } from '../hooks/useCustomers';
import { useLoans } from '../hooks/useLoans';
import { usePayments } from '../hooks/usePayments';
import { useStats } from '../hooks/useStats';
import { useLender } from '../hooks/useLender';
import { formatCurrency } from '../utils/formatters';
import { PageLoader } from '../components/common/LoadingSpinner';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const StatCard = ({ title, value, icon: Icon, color, link }) => (
    <motion.div variants={itemVariants} className="h-full">
        <Link
            to={link}
            className="card p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow group h-full justify-between sm:justify-start text-left w-full"
        >
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${color} flex items-center justify-center shrink-0 mb-1 sm:mb-0`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 w-full min-w-0 flex flex-col items-start justify-end">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-1 text-left">{title}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-200 truncate mt-0.5 sm:mt-0 text-left">{value}</p>
            </div>
            <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform hidden sm:block ml-auto" />
        </Link>
    </motion.div>
);

export const Dashboard = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useStats();
    const { data: lender, isLoading: loadingLender, refetch: refetchLender } = useLender();

    // Fetch specific data for "Recent" sections
    const { data: recentLoansData, isLoading: loadingRecentLoans, refetch: refetchLoans } = useLoans({ limit: 5 });
    const { data: recentPaymentsData, isLoading: loadingRecentPayments, refetch: refetchPayments } = usePayments({
        limit: 5,
        sortBy: '-paymentDate'
    });

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([
            refetchStats(),
            refetchLender(),
            refetchLoans(),
            refetchPayments()
        ]);
        setTimeout(() => setIsRefreshing(false), 500); // minimum duration for visual feedback
    };

    if (loadingStats || loadingRecentLoans || loadingRecentPayments || loadingLender) {
        return <PageLoader />;
    }

    const ownerName = lender?.ownerName || 'Lender';

    const {
        totalCustomers = 0,
        activeLoans = 0,
        totalLent = 0,
        totalReceived = 0,
        totalRemaining = 0,
        projectedInterest = 0,
        overdueLoans = 0,
        healthyLoans = 0,
        monthlyData = {}
    } = stats || {};



    // Prepare Chart Data mapping from backend monthly data
    const chartData = (() => {
        const months = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const m = d.getMonth() + 1;
            const y = d.getFullYear();
            const name = `${monthNames[m - 1]} ${y}`;

            const lent = monthlyData.loans?.find(l => l._id.month === m && l._id.year === y)?.total || 0;
            const collected = monthlyData.payments?.find(p => p._id.month === m && p._id.year === y)?.total || 0;

            months.push({ name, lent, collected });
        }
        return months;
    })();

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {ownerName}!
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Here's what's happening with {lender?.businessName || 'your lending business'} today.
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="btn btn-secondary self-start sm:self-center"
                    disabled={isRefreshing}
                >
                    <FiRefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                    title="Active Portfolio"
                    value={formatCurrency(totalRemaining)}
                    icon={FiDollarSign}
                    color="bg-teal-600"
                    link="/loans"
                />
                <StatCard
                    title="Projected Interest"
                    value={formatCurrency(projectedInterest)}
                    icon={FiTrendingUp}
                    color="bg-purple-600"
                    link="/loans"
                />
                <StatCard
                    title="Total Collected"
                    value={formatCurrency(totalReceived)}
                    icon={FiCreditCard}
                    color="bg-green-600"
                    link="/payments"
                />
                <StatCard
                    title="Total Customers"
                    value={totalCustomers}
                    icon={FiUsers}
                    color="bg-blue-600"
                    link="/customers"
                />
            </div>

            {/* Middle Section: Chart & Recent Loans */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Financial Overview Chart */}
                <motion.div variants={itemVariants} className="card p-4 sm:p-6 lg:col-span-2">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        Financial Overview
                    </h2>
                    {/* Explicit height to fix Recharts loading issue */}
                    <div style={{ width: '100%', height: 300, minHeight: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorLent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `₹${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="lent"
                                    name="Lent"
                                    stroke="#8b5cf6"
                                    fillOpacity={1}
                                    fill="url(#colorLent)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="collected"
                                    name="Collected"
                                    stroke="#10b981"
                                    fillOpacity={1}
                                    fill="url(#colorCollected)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Recent Loans (Moved here) */}
                <motion.div variants={itemVariants} className="card">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Recent Loans
                        </h2>
                        <Link to="/loans" className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                            View all
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {recentLoansData?.loans?.slice(0, 5).map((loan) => (
                            <Link
                                key={loan._id}
                                to={`/loans/${loan._id}`}
                                className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {loan.loanNumber}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {loan.customerId?.firstName} {loan.customerId?.lastName}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {formatCurrency(loan.principal)}
                                    </p>
                                    <span className={`badge ${loan.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                        {loan.status}
                                    </span>
                                </div>
                            </Link>
                        ))}
                        {(!recentLoansData?.loans || recentLoansData.loans.length === 0) && (
                            <div className="p-8 text-center text-gray-500">
                                No loans yet.
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Bottom Section: Recent Payments & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Payments (Expanded) */}
                <motion.div variants={itemVariants} className="card lg:col-span-2">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Recent Payments
                        </h2>
                        <Link to="/payments" className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                            View all
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {recentPaymentsData?.payments?.map((payment) => (
                            <div
                                key={payment._id}
                                className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {payment.customerId?.firstName} {payment.customerId?.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatCurrency(payment.amountPaid)} • {new Date(payment.paymentDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="badge badge-success bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                        Received
                                    </span>
                                </div>
                            </div>
                        ))}
                        {(!recentPaymentsData?.payments || recentPaymentsData.payments.length === 0) && (
                            <div className="p-8 text-center text-gray-500">
                                No payments yet.
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Quick Actions (Moved here) */}
                <motion.div variants={itemVariants} className="card p-4 sm:p-6 h-fit">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Quick Actions
                    </h2>
                    <div className="flex flex-col gap-3">
                        <Link to="/customers/new" className="btn btn-primary w-full justify-start gap-2">
                            <FiUsers className="w-5 h-5" />
                            <span>Add New Customer</span>
                        </Link>
                        <Link to="/loans/new" className="btn btn-secondary w-full justify-start gap-2 border-teal-200 dark:border-teal-900/50">
                            <FiDollarSign className="w-5 h-5" />
                            <span>Create New Loan</span>
                        </Link>
                        <Link to="/payments/new" className="btn btn-secondary w-full justify-start gap-2 border-teal-200 dark:border-teal-900/50">
                            <FiCreditCard className="w-5 h-5" />
                            <span>Record Payment</span>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
