import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import {
    RefreshCw,
    Clock,
    Info,
    ArrowUpRight,
    HandCoins,
    ArrowDownLeft,
    CreditCard,
    TrendingUp,
    Users,
    UserCheck,
    Wallet,
    UserPlus,
    AlertTriangle,
    CheckCircle2,
    ShieldCheck,
    ChevronRight,
    Sparkles,
    Calendar,
    AlertCircle,
    Search,
    Bell
} from 'lucide-react';
import { useLoans } from '../hooks/useLoans';
import { usePayments } from '../hooks/usePayments';
import { useStats } from '../hooks/useStats';
import { useLender } from '../hooks/useLender';
import useNotificationStore from '../store/notificationStore';
import { formatCurrency } from '../utils/formatters';
import { PageLoader } from '../components/common/LoadingSpinner';

const fadeUp = {
    hidden: { opacity: 0, y: 8 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.03, duration: 0.25, ease: [0.22, 1, 0.36, 1] }
    }),
};

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

function getInitials(name) {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

function formatYAxis(v) {
    if (v >= 10000000) return `${(v / 10000000).toFixed(1)}Cr`;
    if (v >= 100000) return `${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
    return v;
}

export const Dashboard = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [period, setPeriod] = useState('6M'); // '6M' | '12M' | 'YTD'
    const [activityTab, setActivityTab] = useState('loans'); // 'loans' | 'collections'

    const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useStats();
    const { data: lender, isLoading: loadingLender, refetch: refetchLender } = useLender();
    const { data: recentLoansData, isLoading: loadingRecentLoans, refetch: refetchLoans } = useLoans({ limit: 4 });
    const { data: recentPaymentsData, isLoading: loadingRecentPayments, refetch: refetchPayments } = usePayments({
        limit: 4,
        sortBy: '-paymentDate'
    });
    const { unreadRequests = 0, unreadChats = {} } = useNotificationStore();
    const totalUnread = unreadRequests + Object.values(unreadChats).reduce((s, n) => s + n, 0);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([refetchStats(), refetchLender(), refetchLoans(), refetchPayments()]);
        setTimeout(() => setIsRefreshing(false), 400);
    };

    const ownerName = lender?.ownerName || 'Rajdeep';

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
    const totalLoansCount = activeLoans + completedLoans + foreclosedLoans + overdueLoans + defaultedLoans;

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
            const name = monthNames[m - 1];
            const lent = monthlyData.loans?.find(l => l._id.month === m && l._id.year === y)?.total || 0;
            const collected = monthlyData.payments?.find(p => p._id.month === m && p._id.year === y)?.total || 0;
            months.push({ name, lent, collected });
        }
        return months;
    }, [monthlyData, period]);

    if (loadingStats || loadingRecentLoans || loadingRecentPayments || loadingLender) {
        return <PageLoader />;
    }

    const needsAttention = overdueLoans > 0 || todaysDueEMIs > 0;

    return (
        <div className="space-y-5 pb-8">
            {/* ========================================================================= */}
            {/* A. WORKSPACE HEADER (Spacious, greeting on left, fintech pill on right)    */}
            {/* ========================================================================= */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1"
            >
                <div>
                    <h1 className="text-2xl sm:text-[28px] font-bold text-gray-950 dark:text-white tracking-tight">
                        Hello, {ownerName}!
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Here's an overview of your lending business.
                    </p>
                </div>

                {/* Right Header Controls matching reference screenshot */}
                <div className="flex items-center gap-3 self-start sm:self-auto">
                    {/* Search Pill */}
                    <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#141722] border border-black/[0.06] dark:border-white/[0.08] text-xs text-gray-400 w-52 lg:w-60 shadow-2xs">
                        <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">Search customers, loans, payments...</span>
                    </div>

                    {/* Notification Bell */}
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-[#141722] border border-black/[0.06] dark:border-white/[0.08] text-gray-600 dark:text-gray-300 shadow-2xs">
                        <Bell className="w-3.5 h-3.5" />
                        {totalUnread > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#141722]" />
                        )}
                    </div>

                    {/* User Initials Avatar */}
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary dark:text-primary-bright font-bold text-xs flex items-center justify-center shadow-2xs">
                        {getInitials(ownerName)}
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-[#141722] border border-black/[0.08] dark:border-white/[0.08] rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all active:scale-[0.98] disabled:opacity-50 shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
                        aria-label="Refresh dashboard data"
                        title="Refresh live data"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </motion.div>

            {/* ========================================================================= */}
            {/* TWO-COLUMN MASTER GRID (8 cols Left / 4 cols Right on desktop)             */}
            {/* Matches the reference screenshot's structural alignment perfectly!        */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* ===================================================================== */}
                {/* LEFT MASTER COLUMN (8 cols): Top 3 Metrics + Chart + Recent Activity   */}
                {/* ===================================================================== */}
                <div className="lg:col-span-8 space-y-5">
                    {/* ROW 1: TOP 3 METRICS (Outstanding dominant + Collected + Interest) */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={1}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-4"
                    >
                        {/* 1: Outstanding Amount (Dominant Card: 6 cols in sm, soft violet surface) */}
                        <div className="sm:col-span-6 relative p-5 rounded-2xl bg-[#edf0fe] dark:bg-[#15172b] border border-[#d6dbfa] dark:border-primary/30 shadow-[0_2px_8px_rgba(73,79,223,0.04)] flex flex-col justify-between min-h-[148px] group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    <Clock className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
                                    <span>Outstanding Amount</span>
                                    <Info className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
                                </div>
                                <Link
                                    to="/loans"
                                    aria-label="View all loans"
                                    className="w-7 h-7 rounded-full bg-white dark:bg-white/10 shadow-2xs flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all"
                                >
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            <div className="my-2">
                                <p className="text-2xl sm:text-[28px] lg:text-3xl font-bold text-gray-950 dark:text-white tracking-tight tabular-nums">
                                    {formatCurrency(totalRemaining)}
                                </p>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                <HandCoins className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span>Total outstanding across {activeLoans} active loans</span>
                            </div>
                        </div>

                        {/* 2: Total Collected (3 cols in sm) */}
                        <Link
                            to="/payments"
                            className="sm:col-span-3 relative p-5 rounded-2xl bg-white dark:bg-[#141722] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all flex flex-col justify-between min-h-[148px] group"
                        >
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                    <ArrowDownLeft className="w-3.5 h-3.5" strokeWidth={2.2} />
                                </div>
                                <span className="truncate">Total Collected</span>
                            </div>

                            <div className="my-2">
                                <p className="text-xl sm:text-2xl font-bold text-gray-950 dark:text-white tracking-tight tabular-nums">
                                    {formatCurrency(totalReceived)}
                                </p>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate">All time collections</span>
                            </div>
                        </Link>

                        {/* 3: Projected Interest (3 cols in sm) */}
                        <div className="sm:col-span-3 relative p-5 rounded-2xl bg-white dark:bg-[#141722] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[148px]">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[11px]">
                                    %
                                </div>
                                <span className="truncate">Projected Interest</span>
                            </div>

                            <div className="my-2">
                                <p className="text-xl sm:text-2xl font-bold text-gray-950 dark:text-white tracking-tight tabular-nums">
                                    {formatCurrency(projectedInterest)}
                                </p>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                <TrendingUp className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <span className="truncate">From active loans</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* ROW 2: LOAN VS COLLECTION CHART */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={2}
                        className="bg-white dark:bg-[#141722] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <Wallet className="w-4 h-4" strokeWidth={2} />
                                </div>
                                <div>
                                    <h2 className="text-sm sm:text-base font-bold text-gray-950 dark:text-white leading-tight">
                                        Loan vs Collection
                                    </h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Money lent vs money collected over time
                                    </p>
                                </div>
                            </div>

                            <div className="inline-flex items-center p-0.5 rounded-lg bg-gray-100 dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06]">
                                {['6M', '12M', 'YTD'].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPeriod(p)}
                                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                            period === p
                                                ? 'bg-primary text-white shadow-xs'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chart Canvas */}
                        <div style={{ width: '100%', height: 200, minHeight: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData}
                                    margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
                                    barGap={4}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.12)" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 11, fill: '#8d96a0' }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={4}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: '#8d96a0' }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={formatYAxis}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(73, 79, 223, 0.04)', radius: 4 }}
                                        content={({ active, payload, label }) => {
                                            if (!active || !payload?.length) return null;
                                            return (
                                                <div className="bg-white dark:bg-[#181a20] border border-black/[0.08] dark:border-white/[0.12] rounded-xl p-2.5 shadow-xl text-xs">
                                                    <p className="font-bold text-gray-950 dark:text-white mb-1.5">{label}</p>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                                            <span className="text-gray-500 dark:text-gray-400">Lent:</span>
                                                            <span className="font-bold text-gray-950 dark:text-white tabular-nums">
                                                                {formatCurrency(payload[0]?.value || 0)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-[#121318] dark:bg-gray-400 shrink-0" />
                                                            <span className="text-gray-500 dark:text-gray-400">Collected:</span>
                                                            <span className="font-bold text-gray-950 dark:text-white tabular-nums">
                                                                {formatCurrency(payload[1]?.value || 0)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }}
                                    />
                                    <Bar
                                        dataKey="lent"
                                        name="Lent"
                                        fill="#494fdf"
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={24}
                                    />
                                    <Bar
                                        dataKey="collected"
                                        name="Collected"
                                        fill="#121318"
                                        className="dark:fill-[#4b5563]"
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={24}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-center gap-6 pt-3.5 border-t border-black/[0.04] dark:border-white/[0.06] mt-3.5 text-xs font-medium">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                                <span>Lent</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#121318] dark:bg-gray-400" />
                                <span>Collected</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* ROW 3: RECENT ACTIVITY */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={3}
                        className="bg-white dark:bg-[#141722] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                    >
                        <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.06] dark:border-white/[0.08]">
                            <h2 className="text-base font-bold text-gray-950 dark:text-white">
                                Recent Activity
                            </h2>

                            {/* Segmented Pills for Loans & Collections */}
                            <div className="inline-flex items-center p-0.5 rounded-lg bg-gray-100 dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06]">
                                <button
                                    onClick={() => setActivityTab('loans')}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                        activityTab === 'loans'
                                            ? 'bg-primary text-white shadow-xs'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white'
                                    }`}
                                >
                                    Loans
                                </button>
                                <button
                                    onClick={() => setActivityTab('collections')}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                        activityTab === 'collections'
                                            ? 'bg-primary text-white shadow-xs'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white'
                                    }`}
                                >
                                    Collections
                                </button>
                            </div>
                        </div>

                        <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04] mt-1">
                            {activityTab === 'loans' ? (
                                <>
                                    {recentLoansData?.loans?.slice(0, 4).map((loan) => {
                                        const borrowerName = `${loan.customerId?.firstName || 'Unknown'} ${loan.customerId?.lastName || ''}`.trim();
                                        const initials = getInitials(borrowerName);
                                        return (
                                            <Link
                                                key={loan._id}
                                                to={`/loans/${loan._id}`}
                                                className="py-3 flex items-center justify-between hover:bg-gray-50/80 dark:hover:bg-white/[0.02] px-1 rounded-xl transition-colors group"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-9 h-9 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-bright flex items-center justify-center font-bold text-xs shrink-0">
                                                        {initials}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-gray-950 dark:text-white truncate group-hover:text-primary transition-colors">
                                                            {borrowerName}
                                                        </p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                            Loan created • {relativeDate(loan.createdAt || loan.startDate)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 shrink-0 ml-4">
                                                    <span className="text-sm font-bold text-gray-950 dark:text-white tabular-nums">
                                                        {formatCurrency(loan.principal)}
                                                    </span>
                                                    <span
                                                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                                                            loan.status === 'active'
                                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                                : loan.status === 'completed'
                                                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                                : loan.status === 'defaulted'
                                                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                        }`}
                                                    >
                                                        {loan.status}
                                                    </span>
                                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                                </div>
                                            </Link>
                                        );
                                    })}
                                    {(!recentLoansData?.loans || recentLoansData.loans.length === 0) && (
                                        <div className="py-8 text-center">
                                            <p className="text-xs text-gray-400 dark:text-gray-500">No loans recorded yet</p>
                                            <Link to="/loans/new" className="text-xs font-semibold text-primary mt-1 inline-block hover:underline">
                                                Create your first loan →
                                            </Link>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {recentPaymentsData?.payments?.slice(0, 4).map((payment) => {
                                        const borrowerName = `${payment.customerId?.firstName || 'Unknown'} ${payment.customerId?.lastName || ''}`.trim();
                                        const initials = getInitials(borrowerName);
                                        return (
                                            <div
                                                key={payment._id}
                                                className="py-3 flex items-center justify-between hover:bg-gray-50/80 dark:hover:bg-white/[0.02] px-1 rounded-xl transition-colors"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                        {initials}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-gray-950 dark:text-white truncate">
                                                            {borrowerName}
                                                        </p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                            Payment received • {relativeDate(payment.paymentDate)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 shrink-0 ml-4">
                                                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                                        +{formatCurrency(payment.amountPaid)}
                                                    </span>
                                                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                                        Payment
                                                    </span>
                                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {(!recentPaymentsData?.payments || recentPaymentsData.payments.length === 0) && (
                                        <div className="py-8 text-center">
                                            <p className="text-xs text-gray-400 dark:text-gray-500">No payments recorded yet</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* ===================================================================== */}
                {/* RIGHT MASTER COLUMN (4 cols): Total Customers + Actions + Alert + Health */}
                {/* ===================================================================== */}
                <div className="lg:col-span-4 space-y-5">
                    {/* ROW 1: TOTAL CUSTOMERS (matches height of left 3 metric cards!) */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={1}
                    >
                        <Link
                            to="/customers"
                            className="relative p-5 rounded-2xl bg-white dark:bg-[#141722] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-primary/40 dark:hover:border-primary/40 transition-all flex flex-col justify-between min-h-[148px] group block"
                        >
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                    <Users className="w-3.5 h-3.5" strokeWidth={2} />
                                </div>
                                <span>Total Customers</span>
                            </div>

                            <div className="my-2">
                                <p className="text-2xl sm:text-[28px] font-bold text-gray-950 dark:text-white tracking-tight tabular-nums">
                                    {totalCustomers}
                                </p>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                <UserCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                <span>{activeLoans} active borrowers</span>
                            </div>
                        </Link>
                    </motion.div>

                    {/* ROW 2: QUICK ACTIONS */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={2}
                        className="bg-white dark:bg-[#141722] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                    >
                        <div className="flex items-center justify-between mb-3.5">
                            <h2 className="text-base font-bold text-gray-950 dark:text-white">
                                Quick Actions
                            </h2>
                            <span className="text-gray-400 text-xs font-semibold tracking-widest cursor-default">•••</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5">
                            {/* Action 1: New Customer */}
                            <Link
                                to="/customers/new"
                                className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50/80 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] hover:border-primary/40 dark:hover:border-primary/40 hover:-translate-y-0.5 transition-all text-center group"
                            >
                                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                                    <UserPlus className="w-4 h-4" strokeWidth={2} />
                                </div>
                                <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors leading-tight">
                                    New<br />Customer
                                </span>
                            </Link>

                            {/* Action 2: Create Loan */}
                            <Link
                                to="/loans/new"
                                className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50/80 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] hover:border-primary/40 dark:hover:border-primary/40 hover:-translate-y-0.5 transition-all text-center group"
                            >
                                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                                    <HandCoins className="w-4 h-4" strokeWidth={2} />
                                </div>
                                <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors leading-tight">
                                    Create<br />Loan
                                </span>
                            </Link>

                            {/* Action 3: Record Payment */}
                            <Link
                                to="/payments/new"
                                className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50/80 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] hover:border-primary/40 dark:hover:border-primary/40 hover:-translate-y-0.5 transition-all text-center group"
                            >
                                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                                    <CreditCard className="w-4 h-4" strokeWidth={2} />
                                </div>
                                <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors leading-tight">
                                    Record<br />Payment
                                </span>
                            </Link>
                        </div>
                    </motion.div>

                    {/* ROW 3: ATTENTION NEEDED */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={3}
                    >
                        {needsAttention ? (
                            <div className="rounded-2xl p-5 bg-[#fef2f2] dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                                <div className="flex items-center justify-between pb-3 border-b border-rose-200/60 dark:border-rose-900/40">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                                            <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2.2} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-950 dark:text-white">
                                            Attention Needed
                                        </span>
                                    </div>
                                    <Link
                                        to={overdueLoans > 0 ? "/loans" : "/payments"}
                                        aria-label="Review collections"
                                        className="w-6 h-6 rounded-full bg-white dark:bg-white/10 shadow-2xs flex items-center justify-center text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                                    >
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>

                                <div className="space-y-2.5 pt-3 text-xs">
                                    {overdueLoans > 0 && (
                                        <div className="flex items-start gap-2.5">
                                            <div className="w-5 h-5 rounded-md bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                                                <AlertCircle className="w-3 h-3" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">
                                                    {overdueLoans} Overdue Loan{overdueLoans !== 1 ? 's' : ''}
                                                </p>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                    Accounts past EMI grace period requiring follow-up
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {todaysDueEMIs > 0 && (
                                        <div className="flex items-start gap-2.5">
                                            <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                                                <Calendar className="w-3 h-3" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">
                                                    {todaysDueEMIs} EMI{todaysDueEMIs !== 1 ? 's' : ''} Due Today
                                                </p>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                    Scheduled collections queue for today
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl p-5 bg-[#f0fdf4] dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                                <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60 dark:border-emerald-900/40">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.2} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-950 dark:text-white">
                                            Portfolio Healthy
                                        </span>
                                    </div>
                                    <Link
                                        to="/loans"
                                        aria-label="View loans"
                                        className="w-6 h-6 rounded-full bg-white dark:bg-white/10 shadow-2xs flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors"
                                    >
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>

                                <div className="pt-3 text-xs flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <p className="text-[11px] text-gray-600 dark:text-gray-400">
                                        All {activeLoans} active loans are on schedule. No overdue accounts.
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* ROW 4: PORTFOLIO HEALTH */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={4}
                        className="bg-white dark:bg-[#141722] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                                    <Sparkles className="w-3.5 h-3.5" />
                                </div>
                                <h2 className="text-base font-bold text-gray-950 dark:text-white">
                                    Portfolio Health
                                </h2>
                            </div>
                            <Link
                                to="/loans"
                                className="text-xs font-semibold text-primary dark:text-primary-bright hover:underline"
                            >
                                View all
                            </Link>
                        </div>

                        {/* Status Breakdown Rows */}
                        <div className="space-y-2.5 mt-3.5 text-xs">
                            {/* Active Loans */}
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-gray-600 dark:text-gray-400 w-28 font-medium text-[11px]">Active Loans</span>
                                <div className="flex-1 h-2.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, Math.max(8, (activeLoans / Math.max(1, totalLoansCount)) * 100))}%` }}
                                    />
                                </div>
                                <span className="font-bold text-gray-950 dark:text-white tabular-nums w-6 text-right text-[11px]">
                                    {activeLoans}
                                </span>
                            </div>

                            {/* Completed Loans */}
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-gray-600 dark:text-gray-400 w-28 font-medium text-[11px]">Completed Loans</span>
                                <div className="flex-1 h-2.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-200 dark:bg-indigo-900/60 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, Math.max(8, (completedLoans / Math.max(1, totalLoansCount)) * 100))}%` }}
                                    />
                                </div>
                                <span className="font-bold text-gray-950 dark:text-white tabular-nums w-6 text-right text-[11px]">
                                    {completedLoans}
                                </span>
                            </div>

                            {/* Overdue Loans */}
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-gray-600 dark:text-gray-400 w-28 font-medium text-[11px]">Overdue Loans</span>
                                <div className="flex-1 h-2.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, Math.max(6, (overdueLoans / Math.max(1, totalLoansCount)) * 100))}%` }}
                                    />
                                </div>
                                <span className="font-bold text-gray-950 dark:text-white tabular-nums w-6 text-right text-[11px]">
                                    {overdueLoans}
                                </span>
                            </div>

                            {/* Foreclosed Loans */}
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-gray-600 dark:text-gray-400 w-28 font-medium text-[11px]">Foreclosed Loans</span>
                                <div className="flex-1 h-2.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gray-400 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, Math.max(6, (foreclosedLoans / Math.max(1, totalLoansCount)) * 100))}%` }}
                                    />
                                </div>
                                <span className="font-bold text-gray-950 dark:text-white tabular-nums w-6 text-right text-[11px]">
                                    {foreclosedLoans}
                                </span>
                            </div>

                            {/* Defaulted Loans */}
                            {defaultedLoans > 0 && (
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-gray-600 dark:text-gray-400 w-28 font-medium text-[11px]">Defaulted Loans</span>
                                    <div className="flex-1 h-2.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-rose-500 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(100, Math.max(6, (defaultedLoans / Math.max(1, totalLoansCount)) * 100))}%` }}
                                        />
                                    </div>
                                    <span className="font-bold text-rose-600 tabular-nums w-6 text-right text-[11px]">
                                        {defaultedLoans}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Rates Breakdown */}
                        <div className="pt-3.5 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2.5 mt-3.5 text-xs">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-gray-600 dark:text-gray-400 w-28 font-medium text-[11px]">Collection Rate</span>
                                <div className="flex-1 h-2.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, Math.max(0, collectionRate))}%` }}
                                    />
                                </div>
                                <span className="font-bold text-gray-950 dark:text-white tabular-nums w-8 text-right text-[11px]">
                                    {collectionRate}%
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <span className="text-gray-600 dark:text-gray-400 w-28 font-medium text-[11px]">Recovery Rate</span>
                                <div className="flex-1 h-2.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, Math.max(0, recoveryRate))}%` }}
                                    />
                                </div>
                                <span className="font-bold text-gray-950 dark:text-white tabular-nums w-8 text-right text-[11px]">
                                    {recoveryRate}%
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
