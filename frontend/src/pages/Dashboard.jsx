import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import {
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    UserPlus,
    FilePlus,
    ArrowDownLeft,
    ArrowUpRight,
    TrendingUp,
    ShieldCheck,
    Users,
    ChevronRight,
    HandCoins,
    CreditCard
} from 'lucide-react';
import { useLoans } from '../hooks/useLoans';
import { usePayments } from '../hooks/usePayments';
import { useStats } from '../hooks/useStats';
import { useLender } from '../hooks/useLender';
import { formatCurrency } from '../utils/formatters';
import { PageLoader } from '../components/common/LoadingSpinner';

const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }
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
    const [period, setPeriod] = useState('6M'); // '6M' | '12M' | 'YTD'
    const [activityTab, setActivityTab] = useState('loans'); // 'loans' | 'collections'

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
        setTimeout(() => setIsRefreshing(false), 400);
    };

    const ownerName = lender?.ownerName || 'there';
    const businessName = lender?.businessName || 'Your Business';

    const {
        totalCustomers = 0,
        activeLoans = 0,
        totalLent = 0,
        totalReceived = 0,
        totalRemaining = 0,
        projectedInterest = 0,
        overdueLoans = 0,
        completedLoans = 0,
        foreclosedLoans = 0,
        defaultedLoans = 0,
        todaysDueEMIs = 0,
        collectionRate: collectionRateFromAPI = 0,
        recoveryRate = 0,
        monthlyData = {}
    } = stats || {};

    const collectionRate = collectionRateFromAPI || (totalLent > 0 ? Math.round((totalReceived / totalLent) * 100) : 0);

    // Chart data calculation strictly from real monthlyData
    const chartData = useMemo(() => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        const months = [];

        let count = 6;
        if (period === '12M') count = 12;
        if (period === 'YTD') count = now.getMonth() + 1;

        for (let i = count - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const m = d.getMonth() + 1;
            const y = d.getFullYear();
            const name = `${monthNames[m - 1]} '${y.toString().slice(-2)}`;
            const lent = monthlyData.loans?.find(l => l._id.month === m && l._id.year === y)?.total || 0;
            const collected = monthlyData.payments?.find(p => p._id.month === m && p._id.year === y)?.total || 0;
            months.push({ name, lent, collected });
        }
        return months;
    }, [monthlyData, period]);

    const periodTotals = useMemo(() => {
        const totalLentPeriod = chartData.reduce((s, c) => s + (c.lent || 0), 0);
        const totalCollectedPeriod = chartData.reduce((s, c) => s + (c.collected || 0), 0);
        return { totalLent: totalLentPeriod, totalCollected: totalCollectedPeriod };
    }, [chartData]);

    if (loadingStats || loadingRecentLoans || loadingRecentPayments || loadingLender) {
        return <PageLoader />;
    }

    const needsAttention = overdueLoans > 0 || todaysDueEMIs > 0;

    return (
        <div className="space-y-6 pb-12">
            {/* ========================================================================= */}
            {/* 1. WORKSPACE HEADER                                                       */}
            {/* ========================================================================= */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1"
            >
                <div>
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                        <p className="text-[11px] font-semibold text-primary dark:text-primary-bright uppercase tracking-wider">
                            {businessName}
                        </p>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight mt-1">
                        {getGreeting()}, {ownerName}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Here's an overview of your lending business performance.
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-[#111215] border border-black/[0.08] dark:border-white/[0.08] rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all active:scale-[0.98] disabled:opacity-50 shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
                        aria-label="Refresh dashboard data"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>
            </motion.div>

            {/* ========================================================================= */}
            {/* 2. FINANCIAL OVERVIEW (4 Hero Metric Cards)                                */}
            {/* ========================================================================= */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={1}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {/* 2A: Outstanding Amount (Hero Metric) */}
                <Link
                    to="/loans"
                    className="relative p-5 rounded-2xl bg-white dark:bg-[#111215] border border-black/[0.06] dark:border-white/[0.08] hover:border-primary/40 dark:hover:border-primary/40 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)] group flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Outstanding Balance
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary dark:text-primary-bright flex items-center justify-center">
                            <HandCoins className="w-4 h-4" strokeWidth={2} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight tabular-nums">
                            {formatCurrency(totalRemaining)}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {activeLoans} active loan{activeLoans !== 1 ? 's' : ''}
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                        </div>
                    </div>
                </Link>

                {/* 2B: Total Collected */}
                <Link
                    to="/payments"
                    className="relative p-5 rounded-2xl bg-white dark:bg-[#111215] border border-black/[0.06] dark:border-white/[0.08] hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)] group flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Total Collected
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <CreditCard className="w-4 h-4" strokeWidth={2} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight tabular-nums">
                            {formatCurrency(totalReceived)}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 tabular-nums">
                                {collectionRate}%
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                collection rate
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                        </div>
                    </div>
                </Link>

                {/* 2C: Projected Interest */}
                <div className="relative p-5 rounded-2xl bg-white dark:bg-[#111215] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Projected Interest
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4" strokeWidth={2} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight tabular-nums">
                            {formatCurrency(projectedInterest)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                            Accruing across portfolio
                        </p>
                    </div>
                </div>

                {/* 2D: Borrowers / Customers */}
                <Link
                    to="/customers"
                    className="relative p-5 rounded-2xl bg-white dark:bg-[#111215] border border-black/[0.06] dark:border-white/[0.08] hover:border-primary/40 dark:hover:border-primary/40 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)] group flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Total Borrowers
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                            <Users className="w-4 h-4" strokeWidth={2} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight tabular-nums">
                            {totalCustomers}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {activeLoans} currently active
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                        </div>
                    </div>
                </Link>
            </motion.div>

            {/* ========================================================================= */}
            {/* 3. ATTENTION / HEALTH STATUS BANNER                                       */}
            {/* ========================================================================= */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
                {needsAttention ? (
                    <div className="rounded-2xl p-4 sm:p-5 bg-amber-500/[0.06] border border-amber-500/20 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Attention required
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                    {overdueLoans > 0 && todaysDueEMIs > 0
                                        ? `${overdueLoans} overdue loan${overdueLoans !== 1 ? 's' : ''} · ${todaysDueEMIs} EMI payment${todaysDueEMIs !== 1 ? 's' : ''} due today`
                                        : overdueLoans > 0
                                        ? `${overdueLoans} overdue loan${overdueLoans !== 1 ? 's' : ''} requiring borrower follow-up`
                                        : `${todaysDueEMIs} EMI payment${todaysDueEMIs !== 1 ? 's' : ''} scheduled for today`}
                                </p>
                            </div>
                        </div>
                        <Link
                            to={overdueLoans > 0 ? "/loans" : "/payments"}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200 hover:text-amber-950 dark:hover:text-white shrink-0 self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/20 transition-all active:scale-[0.98]"
                        >
                            <span>Review collections</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                ) : (
                    <div className="rounded-2xl p-4 sm:p-5 bg-emerald-500/[0.05] border border-emerald-500/15 text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Portfolio is healthy
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                    All {activeLoans} active loans are on schedule. No overdue accounts detected.
                                </p>
                            </div>
                        </div>
                        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            <ShieldCheck className="w-4 h-4" />
                            <span>100% On-time</span>
                        </span>
                    </div>
                )}
            </motion.div>

            {/* ========================================================================= */}
            {/* MAIN OPERATIONAL WORKSPACE (2 Columns: 1.55fr / 1fr)                      */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-6 items-start">
                {/* --------------------------------------------------------------------- */}
                {/* LEFT COLUMN: Cash Flow Chart + Recent Activity Table                  */}
                {/* --------------------------------------------------------------------- */}
                <div className="space-y-6">
                    {/* 4. CASH FLOW ANALYTICS SECTION */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={3}
                        className="bg-white dark:bg-[#111215] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-5 sm:p-6"
                    >
                        {/* Header & Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                    Cash Flow Performance
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Lent principal vs collected repayments over time
                                </p>
                            </div>

                            {/* Period selector */}
                            <div className="inline-flex items-center p-1 rounded-xl bg-gray-100 dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.06] self-start sm:self-auto">
                                {['6M', '12M', 'YTD'].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPeriod(p)}
                                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                                            period === p
                                                ? 'bg-white dark:bg-[#1c1d22] text-gray-900 dark:text-white shadow-2xs font-semibold'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Summary totals for selected period */}
                        <div className="flex flex-wrap items-center gap-6 py-2.5 mb-5 border-y border-black/[0.04] dark:border-white/[0.06] text-xs">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                                <span className="text-gray-500 dark:text-gray-400">Total Lent:</span>
                                <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
                                    {formatCurrency(periodTotals.totalLent)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                                <span className="text-gray-500 dark:text-gray-400">Total Collected:</span>
                                <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
                                    {formatCurrency(periodTotals.totalCollected)}
                                </span>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div style={{ width: '100%', height: 280, minHeight: 280 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gLent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#494fdf" stopOpacity={0.20} />
                                            <stop offset="100%" stopColor="#494fdf" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gCollected" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#00a87e" stopOpacity={0.20} />
                                            <stop offset="100%" stopColor="#00a87e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.12)" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 11, fill: '#8d969e' }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={8}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: '#8d969e' }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                                    />
                                    <Tooltip
                                        content={({ active, payload, label }) => {
                                            if (!active || !payload?.length) return null;
                                            return (
                                                <div className="bg-white/95 dark:bg-[#181a20]/95 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.12] rounded-xl p-3 shadow-xl text-xs">
                                                    <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                                            <span className="text-gray-500 dark:text-gray-400">Lent:</span>
                                                            <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
                                                                {formatCurrency(payload[0]?.value || 0)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                                            <span className="text-gray-500 dark:text-gray-400">Collected:</span>
                                                            <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
                                                                {formatCurrency(payload[1]?.value || 0)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="lent"
                                        name="Lent"
                                        stroke="#494fdf"
                                        strokeWidth={2.2}
                                        fillOpacity={1}
                                        fill="url(#gLent)"
                                        dot={false}
                                        activeDot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#494fdf' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="collected"
                                        name="Collected"
                                        stroke="#00a87e"
                                        strokeWidth={2.2}
                                        fillOpacity={1}
                                        fill="url(#gCollected)"
                                        dot={false}
                                        activeDot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#00a87e' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* 6. RECENT ACTIVITY SECTION */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={4}
                        className="bg-white dark:bg-[#111215] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden"
                    >
                        {/* Header + Tabs */}
                        <div className="px-5 py-4 flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08]">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                    Recent Activity
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Latest ledger movements & borrower events
                                </p>
                            </div>

                            {/* Segmented Pill Control */}
                            <div className="inline-flex items-center p-1 rounded-xl bg-gray-100 dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.06]">
                                <button
                                    onClick={() => setActivityTab('loans')}
                                    className={`px-3 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                                        activityTab === 'loans'
                                            ? 'bg-white dark:bg-[#1c1d22] text-gray-900 dark:text-white shadow-2xs font-semibold'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium'
                                    }`}
                                >
                                    Loans
                                </button>
                                <button
                                    onClick={() => setActivityTab('collections')}
                                    className={`px-3 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                                        activityTab === 'collections'
                                            ? 'bg-white dark:bg-[#1c1d22] text-gray-900 dark:text-white shadow-2xs font-semibold'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium'
                                    }`}
                                >
                                    Collections
                                </button>
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                            {activityTab === 'loans' ? (
                                <>
                                    {recentLoansData?.loans?.slice(0, 5).map((loan) => {
                                        const borrowerName = `${loan.customerId?.firstName || 'Unknown'} ${loan.customerId?.lastName || ''}`.trim();
                                        const outstandingBal = loan.remainingBalance != null ? loan.remainingBalance : (loan.totalAmountPayable || loan.principal);
                                        return (
                                            <Link
                                                key={loan._id}
                                                to={`/loans/${loan._id}`}
                                                className="px-5 py-3.5 flex items-center justify-between hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors group"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-primary dark:group-hover:text-primary-bright transition-colors">
                                                        {borrowerName}
                                                    </p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                        {loan.loanNumber}
                                                    </p>
                                                </div>
                                                <div className="text-right ml-4 shrink-0">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                                                        {formatCurrency(loan.principal)}
                                                    </p>
                                                    <div className="flex items-center justify-end gap-2 mt-0.5">
                                                        <span className="text-[11px] text-gray-500 dark:text-gray-400 tabular-nums">
                                                            {formatCurrency(outstandingBal)} bal
                                                        </span>
                                                        <span
                                                            className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                                                                loan.status === 'active'
                                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                                    : loan.status === 'completed'
                                                                    ? 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                                                                    : loan.status === 'defaulted'
                                                                    ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                            }`}
                                                        >
                                                            {loan.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                    {(!recentLoansData?.loans || recentLoansData.loans.length === 0) && (
                                        <div className="px-5 py-10 text-center">
                                            <p className="text-sm text-gray-400 dark:text-gray-500">No loans recorded yet</p>
                                            <Link to="/loans/new" className="text-xs text-primary dark:text-primary-bright font-semibold mt-1 inline-block hover:underline">
                                                Issue your first loan →
                                            </Link>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {recentPaymentsData?.payments?.slice(0, 5).map((payment) => {
                                        const borrowerName = `${payment.customerId?.firstName || 'Unknown'} ${payment.customerId?.lastName || ''}`.trim();
                                        return (
                                            <div
                                                key={payment._id}
                                                className="px-5 py-3.5 flex items-center justify-between hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                        {borrowerName}
                                                    </p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                        {relativeDate(payment.paymentDate)} · {payment.paymentMethod || 'Payment'}
                                                    </p>
                                                </div>
                                                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 ml-4 shrink-0 tabular-nums">
                                                    +{formatCurrency(payment.amountPaid)}
                                                </p>
                                            </div>
                                        );
                                    })}
                                    {(!recentPaymentsData?.payments || recentPaymentsData.payments.length === 0) && (
                                        <div className="px-5 py-10 text-center">
                                            <p className="text-sm text-gray-400 dark:text-gray-500">No payments recorded yet</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* --------------------------------------------------------------------- */}
                {/* RIGHT COLUMN: Quick Actions + Portfolio Health + Contextual Insight   */}
                {/* --------------------------------------------------------------------- */}
                <div className="space-y-6">
                    {/* 7. QUICK ACTIONS SECTION */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={5}
                        className="bg-white dark:bg-[#111215] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-5"
                    >
                        <div className="flex items-center justify-between mb-3.5">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                Quick Actions
                            </h2>
                            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                                Operations
                            </span>
                        </div>

                        <div className="space-y-2">
                            <Link
                                to="/customers/new"
                                className="flex items-center justify-between p-3 rounded-xl border border-black/[0.04] dark:border-white/[0.06] hover:border-black/[0.12] dark:hover:border-white/[0.15] hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-gray-700 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary-bright transition-colors">
                                        <UserPlus className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">New Customer</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">Add a borrower profile</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary dark:group-hover:text-primary-bright group-hover:translate-x-0.5 transition-all" />
                            </Link>

                            <Link
                                to="/loans/new"
                                className="flex items-center justify-between p-3 rounded-xl border border-black/[0.04] dark:border-white/[0.06] hover:border-black/[0.12] dark:hover:border-white/[0.15] hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-gray-700 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary-bright transition-colors">
                                        <FilePlus className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Create Loan</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">Issue a new loan agreement</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary dark:group-hover:text-primary-bright group-hover:translate-x-0.5 transition-all" />
                            </Link>

                            <Link
                                to="/payments/new"
                                className="flex items-center justify-between p-3 rounded-xl border border-black/[0.04] dark:border-white/[0.06] hover:border-black/[0.12] dark:hover:border-white/[0.15] hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                        <ArrowDownLeft className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Record Payment</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">Log a received repayment</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* 5. PORTFOLIO HEALTH SECTION */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={6}
                        className="bg-white dark:bg-[#111215] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-5"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                    Portfolio Health
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Status breakdown & loan performance
                                </p>
                            </div>
                            <Link
                                to="/loans"
                                className="text-xs font-semibold text-primary dark:text-primary-bright hover:underline"
                            >
                                View all
                            </Link>
                        </div>

                        {/* Status Breakdown Rows */}
                        <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04] text-sm mt-1">
                            <Link
                                to="/loans?status=active"
                                className="py-2.5 flex items-center justify-between hover:bg-black/[0.015] dark:hover:bg-white/[0.02] px-1 rounded-lg transition-colors"
                            >
                                <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-xs font-medium">
                                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                    Active
                                </span>
                                <span className="font-semibold text-gray-900 dark:text-white tabular-nums text-xs">
                                    {activeLoans}
                                </span>
                            </Link>

                            <Link
                                to="/loans?status=completed"
                                className="py-2.5 flex items-center justify-between hover:bg-black/[0.015] dark:hover:bg-white/[0.02] px-1 rounded-lg transition-colors"
                            >
                                <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-xs font-medium">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                    Completed
                                </span>
                                <span className="font-semibold text-gray-900 dark:text-white tabular-nums text-xs">
                                    {completedLoans}
                                </span>
                            </Link>

                            <Link
                                to="/loans?status=foreclosed"
                                className="py-2.5 flex items-center justify-between hover:bg-black/[0.015] dark:hover:bg-white/[0.02] px-1 rounded-lg transition-colors"
                            >
                                <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-xs font-medium">
                                    <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0" />
                                    Foreclosed
                                </span>
                                <span className="font-semibold text-gray-900 dark:text-white tabular-nums text-xs">
                                    {foreclosedLoans}
                                </span>
                            </Link>

                            <Link
                                to="/loans"
                                className="py-2.5 flex items-center justify-between hover:bg-black/[0.015] dark:hover:bg-white/[0.02] px-1 rounded-lg transition-colors"
                            >
                                <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-xs font-medium">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                    Overdue
                                </span>
                                <span className={`font-semibold tabular-nums text-xs ${overdueLoans > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>
                                    {overdueLoans}
                                </span>
                            </Link>

                            {defaultedLoans > 0 && (
                                <Link
                                    to="/loans?status=defaulted"
                                    className="py-2.5 flex items-center justify-between hover:bg-black/[0.015] dark:hover:bg-white/[0.02] px-1 rounded-lg transition-colors"
                                >
                                    <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-xs font-medium">
                                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                        Defaulted
                                    </span>
                                    <span className="font-semibold text-red-600 dark:text-red-400 tabular-nums text-xs">
                                        {defaultedLoans}
                                    </span>
                                </Link>
                            )}
                        </div>

                        {/* Progress Meters */}
                        <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] space-y-3.5 mt-3">
                            <div>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">Collection rate</span>
                                    <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
                                        {collectionRate}%
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-black/[0.05] dark:bg-white/[0.08] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, Math.max(0, collectionRate))}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">Recovery rate</span>
                                    <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
                                        {recoveryRate}%
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-black/[0.05] dark:bg-white/[0.08] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, Math.max(0, recoveryRate))}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 8. PORTFOLIO INSIGHT SECTION */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={7}
                        className="bg-white dark:bg-[#111215] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-5 flex flex-col justify-between"
                    >
                        <div>
                            <span className="text-[11px] font-semibold text-primary dark:text-primary-bright uppercase tracking-wider">
                                Portfolio Insight
                            </span>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                                {overdueLoans > 0
                                    ? "Attention required on overdue accounts"
                                    : todaysDueEMIs > 0
                                    ? "Scheduled collections for today"
                                    : "Operations running smoothly"}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                                {overdueLoans > 0
                                    ? `${overdueLoans} borrower${overdueLoans !== 1 ? 's are' : ' is'} currently past their EMI grace period. Timely reminders typically recover 80%+ of early overdue balances.`
                                    : todaysDueEMIs > 0
                                    ? `${todaysDueEMIs} EMI payment${todaysDueEMIs !== 1 ? 's are' : ' is'} scheduled for collection today. Maintain high collection velocity by logging them promptly.`
                                    : `Your portfolio collection rate stands at ${collectionRate}% with zero overdue loans. Keep up the consistent repayment discipline across all ${activeLoans} active accounts.`}
                            </p>
                        </div>
                        <div className="pt-3 mt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
                            <Link
                                to={overdueLoans > 0 ? "/loans" : todaysDueEMIs > 0 ? "/payments" : "/loans"}
                                className="text-xs font-semibold text-primary dark:text-primary-bright hover:underline inline-flex items-center gap-1"
                            >
                                <span>{overdueLoans > 0 ? "Review overdue loans" : todaysDueEMIs > 0 ? "View today's queue" : "Explore loan portfolio"}</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
export default Dashboard;
