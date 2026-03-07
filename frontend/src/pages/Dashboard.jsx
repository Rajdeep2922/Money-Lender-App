import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLoans } from '../hooks/useLoans';
import { usePayments } from '../hooks/usePayments';
import { useStats } from '../hooks/useStats';
import { useLender } from '../hooks/useLender';
import { formatCurrency } from '../utils/formatters';
import { PageLoader } from '../components/common/LoadingSpinner';

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }
    }),
};

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

function relativeDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export const Dashboard = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useStats();
    const { data: lender, isLoading: loadingLender, refetch: refetchLender } = useLender();
    const { data: recentLoansData, isLoading: loadingRecentLoans, refetch: refetchLoans } = useLoans({ limit: 5 });
    const { data: recentPaymentsData, isLoading: loadingRecentPayments, refetch: refetchPayments } = usePayments({
        limit: 5,
        sortBy: '-paymentDate'
    });

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([refetchStats(), refetchLender(), refetchLoans(), refetchPayments()]);
        setTimeout(() => setIsRefreshing(false), 500);
    };

    if (loadingStats || loadingRecentLoans || loadingRecentPayments || loadingLender) {
        return <PageLoader />;
    }

    const ownerName = lender?.ownerName || 'there';
    const businessName = lender?.businessName || 'your business';

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

    const collectionRate = totalLent > 0 ? Math.round((totalReceived / totalLent) * 100) : 0;

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0}
                className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
            >
                <div>
                    <p className="text-sm font-medium text-gray-400 dark:text-gray-500 tracking-wide uppercase">
                        {businessName}
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mt-1">
                        {getGreeting()}, {ownerName}
                    </h1>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors disabled:opacity-50"
                >
                    <svg
                        className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </motion.div>

            {/* Key Numbers */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
                    <Link to="/loans" className="block group">
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl p-5 hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Portfolio</span>
                                <span className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{formatCurrency(totalRemaining)}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{activeLoans} active loan{activeLoans !== 1 ? 's' : ''}</p>
                        </div>
                    </Link>
                </motion.div>

                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
                    <Link to="/loans" className="block group">
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl p-5 hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Interest</span>
                                <span className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{formatCurrency(projectedInterest)}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">projected earnings</p>
                        </div>
                    </Link>
                </motion.div>

                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
                    <Link to="/payments" className="block group">
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl p-5 hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Collected</span>
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{formatCurrency(totalReceived)}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{collectionRate}% of total lent</p>
                        </div>
                    </Link>
                </motion.div>

                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}>
                    <Link to="/customers" className="block group">
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl p-5 hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Customers</span>
                                <span className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{totalCustomers}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {overdueLoans > 0 ? `${overdueLoans} overdue` : 'all on track'}
                            </p>
                        </div>
                    </Link>
                </motion.div>
            </div>

            {/* Chart + Recent Loans */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Chart */}
                <motion.div
                    variants={fadeUp} initial="hidden" animate="visible" custom={5}
                    className="lg:col-span-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl p-5 sm:p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Cash Flow</h2>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Last 6 months</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
                                <span className="text-gray-500 dark:text-gray-400">Lent</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                <span className="text-gray-500 dark:text-gray-400">Collected</span>
                            </span>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 280, minHeight: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gLent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.15} />
                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gCollected" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="#f0f0f0" strokeDasharray="4 4" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={8}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1f2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#f9fafb',
                                        fontSize: '12px',
                                        padding: '8px 12px',
                                    }}
                                    itemStyle={{ color: '#d1d5db' }}
                                    labelStyle={{ color: '#9ca3af', marginBottom: '4px', fontSize: '11px' }}
                                    formatter={(value) => formatCurrency(value)}
                                    cursor={{ stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="lent"
                                    name="Lent"
                                    stroke="#8b5cf6"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#gLent)"
                                    dot={false}
                                    activeDot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#8b5cf6' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="collected"
                                    name="Collected"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#gCollected)"
                                    dot={false}
                                    activeDot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#10b981' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Recent Loans */}
                <motion.div
                    variants={fadeUp} initial="hidden" animate="visible" custom={6}
                    className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl overflow-hidden flex flex-col"
                >
                    <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Loans</h2>
                        <Link to="/loans" className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors">
                            View all →
                        </Link>
                    </div>
                    <div className="flex-1 divide-y divide-gray-50 dark:divide-gray-700/40">
                        {recentLoansData?.loans?.slice(0, 5).map((loan) => (
                            <Link
                                key={loan._id}
                                to={`/loans/${loan._id}`}
                                className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {loan.customerId?.firstName} {loan.customerId?.lastName}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        {loan.loanNumber}
                                    </p>
                                </div>
                                <div className="text-right ml-4 shrink-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {formatCurrency(loan.principal)}
                                    </p>
                                    <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider mt-0.5 ${loan.status === 'active'
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : loan.status === 'closed'
                                                ? 'text-gray-400 dark:text-gray-500'
                                                : 'text-amber-600 dark:text-amber-400'
                                        }`}>
                                        {loan.status}
                                    </span>
                                </div>
                            </Link>
                        ))}
                        {(!recentLoansData?.loans || recentLoansData.loans.length === 0) && (
                            <div className="px-5 py-10 text-center">
                                <p className="text-sm text-gray-400 dark:text-gray-500">No loans yet</p>
                                <Link to="/loans/new" className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-1 inline-block hover:underline">
                                    Create your first loan →
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Recent Payments + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Recent Payments */}
                <motion.div
                    variants={fadeUp} initial="hidden" animate="visible" custom={7}
                    className="lg:col-span-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl overflow-hidden"
                >
                    <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Payments</h2>
                        <Link to="/payments" className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors">
                            View all →
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-gray-700/40">
                        {recentPaymentsData?.payments?.map((payment) => (
                            <div
                                key={payment._id}
                                className="px-5 py-3.5 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                                        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                        </svg>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {payment.customerId?.firstName} {payment.customerId?.lastName}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                            {relativeDate(payment.paymentDate)}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 ml-4 shrink-0">
                                    +{formatCurrency(payment.amountPaid)}
                                </p>
                            </div>
                        ))}
                        {(!recentPaymentsData?.payments || recentPaymentsData.payments.length === 0) && (
                            <div className="px-5 py-10 text-center">
                                <p className="text-sm text-gray-400 dark:text-gray-500">No payments recorded yet</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    variants={fadeUp} initial="hidden" animate="visible" custom={8}
                    className="lg:col-span-2 space-y-3"
                >
                    <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1">Quick Actions</h2>
                    <Link
                        to="/customers/new"
                        className="flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl p-4 hover:border-gray-200 dark:hover:border-gray-600 transition-colors group"
                    >
                        <span className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </span>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">New Customer</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Add a borrower profile</p>
                        </div>
                    </Link>
                    <Link
                        to="/loans/new"
                        className="flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl p-4 hover:border-gray-200 dark:hover:border-gray-600 transition-colors group"
                    >
                        <span className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Create Loan</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Issue a new loan</p>
                        </div>
                    </Link>
                    <Link
                        to="/payments/new"
                        className="flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl p-4 hover:border-gray-200 dark:hover:border-gray-600 transition-colors group"
                    >
                        <span className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                            </svg>
                        </span>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Record Payment</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Log a received payment</p>
                        </div>
                    </Link>

                    {/* Mini summary */}
                    {overdueLoans > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl p-4 mt-2">
                            <div className="flex items-start gap-3">
                                <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                        {overdueLoans} overdue loan{overdueLoans !== 1 ? 's' : ''}
                                    </p>
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                                        Review and follow up with borrowers
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
