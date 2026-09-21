import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
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
    ArrowClockwise,
    Clock,
    Info,
    ArrowUpRight,
    ArrowDown,
    Plus,
    FileText,
    FilePlus,
    CreditCard,
    TrendUp,
    Users,
    User,
    UserPlus,
    Warning,
    CheckCircle,
    ShieldCheck,
    CaretRight,
    CalendarBlank,
    MagnifyingGlass,
    Bell,
    ChartBar,
    ArrowRight,
    Wallet,
    Coins,
    Lightning,
    DotsThree,
    ChartPie,
    Prohibit,
    XCircle,
    Receipt,
    ChartLineUp,
} from '@phosphor-icons/react';
import { useLoans } from '../hooks/useLoans';
import { usePayments } from '../hooks/usePayments';
import { useStats } from '../hooks/useStats';
import { useLender } from '../hooks/useLender';
import useNotificationStore from '../store/notificationStore';
import { formatCurrency } from '../utils/formatters';
import { PageLoader } from '../components/common/LoadingSpinner';
import { TiltCard } from '../components/common/TiltCard';
import { InputClear } from '../components/common/InputClear';
import { SpinningCounter } from '../components/common/SpinningCounter';
import NotificationBadge from '../components/notifications/NotificationBadge';


const fadeUp = {
    hidden: { opacity: 0, y: 8 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.03, duration: 0.25, ease: [0.22, 1, 0.36, 1] }
    }),
};

function formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshTick, setRefreshTick] = useState(0);
    const [period, setPeriod] = useState('6M'); // '6M' | '12M' | 'YTD'
    const [activityTab, setActivityTab] = useState('loans'); // 'loans' | 'collections'

    const handleSearchSubmit = (query) => {
        if (!query || !query.trim()) return;
        navigate(`/customers?search=${encodeURIComponent(query.trim())}`);
    };

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
        setRefreshTick((t) => t + 1);
        setTimeout(() => setIsRefreshing(false), 400);
    };

    const ownerName = lender?.ownerName || 'Animo';

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
        <div className="w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
            {/* ========================================================================= */}
            {/* TOP HEADER: User Greeting + Search + Notifications + Live Refresh Control */}
            {/* ========================================================================= */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 mb-2"
            >
                <div>
                    <h1 className="text-2xl sm:text-[28px] font-bold text-[#0c0d12] dark:text-white tracking-tight">
                        Hello, {ownerName}!
                    </h1>
                    <p className="text-xs sm:text-sm text-[#717e95] dark:text-gray-400 mt-0.5">
                        Here's an overview of your lending business.
                    </p>
                </div>

                {/* Right Header Controls matching reference screenshot */}
                <div className="flex items-center gap-3 self-start sm:self-auto">
                    {/* Search Pill with Transitions.dev Input Clear Dissolve Animation */}
                    <InputClear
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onClear={() => setSearchQuery('')}
                        onSubmit={handleSearchSubmit}
                        placeholder="Search customers, loans, payments..."
                        className="hidden md:flex items-center rounded-full bg-white dark:bg-[#141722] text-xs text-[#0c0d12] dark:text-white w-64 lg:w-72 h-9"
                    />

                    {/* Notification Bell with Transitions.dev Badge Animation */}
                    <Link
                        to="/loan-requests"
                        aria-label={`Notifications${totalUnread > 0 ? ` (${totalUnread} unread)` : ''}`}
                        className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-[#141722] border border-black/[0.05] dark:border-white/[0.08] text-[#0c0d12] dark:text-gray-300 shadow-2xs hover:bg-gray-50 transition-colors"
                    >
                        <Bell size={18} weight="regular" />
                        <NotificationBadge count={totalUnread} />
                    </Link>

                    {/* User Initials Badge */}
                    <div className="w-9 h-9 rounded-full bg-[#dbeafe] dark:bg-blue-950/50 text-[#2563eb] dark:text-blue-400 font-bold text-xs flex items-center justify-center shadow-2xs">
                        {getInitials(ownerName)}
                    </div>

                    {/* Primary Action Button with Uiverse.io btn-12 Shutter Hover Animation (Pure Black Edges) */}
                    <Link
                        to="/loans/new"
                        className="btn-12 btn-12-compact shrink-0"
                        title="Create New Loan"
                    >
                        <Plus size={14} weight="bold" />
                        <span>New Loan</span>
                    </Link>

                    {/* Expanding Refresh Live Data Button (Uiverse.io by andrew-demchenk0) */}
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="btn-refresh-expand shrink-0"
                        aria-label="Refresh dashboard data"
                        title="Refresh live data"
                    >
                        <span className="button__text">
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </span>
                        <span className="button__icon">
                            <ArrowClockwise size={18} weight="bold" className={`svg ${isRefreshing ? 'animate-spin' : ''}`} />
                        </span>
                    </button>
                </div>
            </motion.div>

            {/* ========================================================================= */}
            {/* TWO-COLUMN MASTER GRID (8 cols Left / 4 cols Right on desktop)             */}
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
                        className="grid grid-cols-1 sm:grid-cols-12 gap-4.5"
                    >
                        {/* 1: Outstanding Amount (Dominant Card: 6 cols in sm, soft pastel blue surface) */}
                        <TiltCard
                            glow="blue"
                            className="sm:col-span-6 h-full"
                            cardClassName="h-full relative p-5 rounded-[24px] bg-gradient-to-br from-[#eaf2fc]/95 via-[#dce9fa]/90 to-[#d0e3f8]/95 dark:from-[#172136]/90 dark:via-[#141926]/85 dark:to-[#101522]/90 flex flex-col justify-between min-h-[190px]"
                            max={10}
                        >
                            {/* Card Top Row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0c0d12] dark:text-white">
                                    <Wallet size={18} weight="regular" className="text-[#0c0d12] dark:text-white" />
                                    <span>Outstanding Amount</span>
                                    <Info size={14} weight="regular" className="text-gray-400 ml-0.5" />
                                </div>
                                <Link
                                    to="/loans"
                                    aria-label="View all loans"
                                    className="w-7 h-7 rounded-full bg-white dark:bg-white/10 shadow-xs flex items-center justify-center text-[#0c0d12] dark:text-white hover:bg-white/80 transition-all"
                                >
                                    <ArrowRight size={15} weight="regular" />
                                </Link>
                            </div>

                            {/* Currency Amount */}
                            <div className="my-1.5 flex items-center">
                                <p className="text-3xl lg:text-[32px] font-extrabold text-[#0c0d12] dark:text-white tracking-tight tabular-nums flex items-center">
                                    <SpinningCounter key={`out-${refreshTick}`} value={totalRemaining} isCurrency={true} spins={2} />
                                </p>
                            </div>

                            {/* Subtitle indicator matching reference */}
                            <div className="flex items-center gap-1.5 text-xs text-[#526077] dark:text-gray-400 mb-2">
                                <TrendUp size={15} weight="regular" className="text-[#0c0d12]/70 dark:text-gray-300 shrink-0" />
                                <span>Total outstanding across {activeLoans} active loans</span>
                            </div>

                            {/* 4 Compact Circular Action Buttons */}
                            <div className="grid grid-cols-4 gap-1.5 pt-2.5 border-t border-black/[0.04] dark:border-white/[0.06]">
                                {/* View Loans */}
                                <Link
                                    to="/loans"
                                    className="quick-action-button flex flex-col items-center group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl px-0.5"
                                    title="View Loans"
                                >
                                    <div className="quick-action-icon w-9 h-9 rounded-full flex items-center justify-center shadow-xs">
                                        <Receipt size={18} weight="regular" />
                                    </div>
                                    <span className="quick-action-label text-[10.5px] font-medium mt-1.5 text-center leading-tight">
                                        View<br />Loans
                                    </span>
                                </Link>

                                {/* Record Payment */}
                                <Link
                                    to="/payments/new"
                                    className="quick-action-button flex flex-col items-center group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl px-0.5"
                                    title="Record Payment"
                                >
                                    <div className="quick-action-icon w-9 h-9 rounded-full flex items-center justify-center shadow-xs">
                                        <CreditCard size={18} weight="regular" />
                                    </div>
                                    <span className="quick-action-label text-[10.5px] font-medium mt-1.5 text-center leading-tight">
                                        Record<br />Payment
                                    </span>
                                </Link>

                                {/* Generate Report */}
                                <Link
                                    to="/invoices"
                                    className="quick-action-button flex flex-col items-center group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl px-0.5"
                                    title="Generate Report"
                                >
                                    <div className="quick-action-icon w-9 h-9 rounded-full flex items-center justify-center shadow-xs">
                                        <ChartLineUp size={18} weight="regular" />
                                    </div>
                                    <span className="quick-action-label text-[10.5px] font-medium mt-1.5 text-center leading-tight">
                                        Generate<br />Report
                                    </span>
                                </Link>

                                {/* New Loan */}
                                <Link
                                    to="/loans/new"
                                    className="quick-action-button flex flex-col items-center group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl px-0.5"
                                    title="New Loan"
                                >
                                    <div className="quick-action-icon w-9 h-9 rounded-full flex items-center justify-center shadow-xs">
                                        <FilePlus size={18} weight="regular" />
                                    </div>
                                    <span className="quick-action-label text-[10.5px] font-medium mt-1.5 text-center leading-tight">
                                        New<br />Loan
                                    </span>
                                </Link>
                            </div>
                        </TiltCard>

                        {/* 2: Total Collected (3 cols in sm) */}
                        <TiltCard
                            glow="blue"
                            as={Link}
                            to="/payments"
                            className="sm:col-span-3 h-full"
                            cardClassName="h-full relative p-5 rounded-[24px] bg-white/90 dark:bg-[#141722]/90 flex flex-col justify-between min-h-[190px] group block"
                            max={12}
                        >
                            <div className="flex items-center gap-2">
                                <Coins size={20} weight="regular" className="text-[#0c0d12] dark:text-white shrink-0" />
                                <span className="text-xs font-semibold text-[#0c0d12] dark:text-white truncate">
                                    Total Collected
                                </span>
                            </div>

                            <div className="my-2 flex items-center">
                                <p className="text-2xl sm:text-[26px] font-bold text-[#0c0d12] dark:text-white tracking-tight tabular-nums flex items-center">
                                    <SpinningCounter key={`col-${refreshTick}`} value={totalReceived} isCurrency={true} spins={2} />
                                </p>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-[#717e95] dark:text-gray-400">
                                <CreditCard size={15} weight="regular" className="text-gray-600 dark:text-gray-400 shrink-0" />
                                <span className="truncate">All time collections</span>
                            </div>
                        </TiltCard>

                        {/* 3: Projected Interest (3 cols in sm) */}
                        <TiltCard
                            glow="blue"
                            className="sm:col-span-3 h-full"
                            cardClassName="h-full relative p-5 rounded-[24px] bg-white/90 dark:bg-[#141722]/90 flex flex-col justify-between min-h-[190px]"
                            max={12}
                        >
                            <div className="flex items-center gap-2">
                                <TrendUp size={20} weight="regular" className="text-[#0c0d12] dark:text-white shrink-0" />
                                <span className="text-xs font-semibold text-[#0c0d12] dark:text-white truncate">
                                    Projected Interest
                                </span>
                            </div>

                            <div className="my-2 flex items-center">
                                <p className="text-2xl sm:text-[26px] font-bold text-[#0c0d12] dark:text-white tracking-tight tabular-nums flex items-center">
                                    <SpinningCounter key={`int-${refreshTick}`} value={projectedInterest} isCurrency={true} spins={2} />
                                </p>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-[#717e95] dark:text-gray-400">
                                <ChartBar size={15} weight="regular" className="text-gray-600 dark:text-gray-400 shrink-0" />
                                <span className="truncate">From active loans</span>
                            </div>
                        </TiltCard>
                    </motion.div>

                    {/* ROW 2: LOAN VS COLLECTION CHART */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={2}
                    >
                        <TiltCard
                            glow="blue"
                            cardClassName="bg-white dark:bg-[#141722] no-card-video rounded-[24px] p-5 flex flex-col justify-between"
                            max={4}
                        >
                        {/* Header */}
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-[#f4f5f7] dark:bg-white/[0.06] text-[#0c0d12] dark:text-white flex items-center justify-center shrink-0">
                                    <ChartBar size={18} weight="regular" />
                                </div>
                                <div>
                                    <h2 className="text-sm sm:text-base font-bold text-[#0c0d12] dark:text-white leading-tight">
                                        Loan vs Collection
                                    </h2>
                                    <p className="text-xs text-[#717e95] dark:text-gray-400 mt-0.5">
                                        Money lent vs money collected over time
                                    </p>
                                </div>
                            </div>

                            {/* Period Filter Capsule */}
                            <div className="inline-flex items-center p-0.5 rounded-full bg-[#f1f5f9] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06]">
                                {['6M', '12M', 'YTD'].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPeriod(p)}
                                        className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${period === p
                                            ? 'bg-[#0c0d12] text-white shadow-xs'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-[#0c0d12] dark:hover:text-white'
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
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={4}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={formatYAxis}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(59, 130, 246, 0.04)', radius: 4 }}
                                        content={({ active, payload, label }) => {
                                            if (!active || !payload?.length) return null;
                                            return (
                                                <div className="bg-white dark:bg-[#181a20] border border-black/[0.06] dark:border-white/[0.12] rounded-xl p-2.5 shadow-lg text-xs">
                                                    <p className="font-bold text-[#0c0d12] dark:text-white mb-1.5">{label}</p>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-[#3b82f6] shrink-0" />
                                                            <span className="text-gray-500 dark:text-gray-400">Lent:</span>
                                                            <span className="font-bold text-[#0c0d12] dark:text-white tabular-nums">
                                                                {formatCurrency(payload[0]?.value || 0)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-[#0c0d12] dark:bg-gray-300 shrink-0" />
                                                            <span className="text-gray-500 dark:text-gray-400">Collected:</span>
                                                            <span className="font-bold text-[#0c0d12] dark:text-white tabular-nums">
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
                                        fill="#3b82f6"
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={20}
                                    />
                                    <Bar
                                        dataKey="collected"
                                        name="Collected"
                                        fill="#0c0d12"
                                        className="dark:fill-gray-300"
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={20}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-center gap-6 pt-3 mt-3 text-xs font-medium">
                            <div className="flex items-center gap-2 text-[#0c0d12] dark:text-gray-300">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                                <span>Lent</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#0c0d12] dark:text-gray-300">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#0c0d12] dark:bg-gray-300" />
                                <span>Collected</span>
                            </div>
                        </div>
                        </TiltCard>
                    </motion.div>

                    {/* ROW 3: RECENT ACTIVITY */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={3}
                    >
                        <TiltCard
                            glow="blue"
                            cardClassName="bg-white dark:bg-[#141722] no-card-video rounded-[24px] p-5"
                            max={4}
                        >
                        <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.04] dark:border-white/[0.08]">
                            <div className="flex items-center gap-2">
                                <Clock size={18} weight="regular" className="text-[#0c0d12] dark:text-white" />
                                <h2 className="text-base font-bold text-[#0c0d12] dark:text-white">
                                    Recent Activity
                                </h2>
                            </div>

                            {/* Segmented Pills for Loans & Collections + More button */}
                            <div className="flex items-center gap-2">
                                <div className="inline-flex items-center p-0.5 rounded-full bg-[#f1f5f9] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06]">
                                    <button
                                        onClick={() => setActivityTab('loans')}
                                        className={`relative px-3.5 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${activityTab === 'loans'
                                                ? 'text-white'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-[#0c0d12] dark:hover:text-white'
                                            }`}
                                    >
                                        {activityTab === 'loans' && (
                                            <motion.span
                                                layoutId="dashboardActivityTabPill"
                                                className="absolute inset-0 rounded-full bg-[#0c0d12] shadow-xs z-0"
                                                transition={{
                                                    duration: 0.25,
                                                    ease: [0.22, 1, 0.36, 1],
                                                }}
                                            />
                                        )}
                                        <span className="relative z-10">Loans</span>
                                    </button>
                                    <button
                                        onClick={() => setActivityTab('collections')}
                                        className={`relative px-3.5 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${activityTab === 'collections'
                                                ? 'text-white'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-[#0c0d12] dark:hover:text-white'
                                            }`}
                                    >
                                        {activityTab === 'collections' && (
                                            <motion.span
                                                layoutId="dashboardActivityTabPill"
                                                className="absolute inset-0 rounded-full bg-[#0c0d12] shadow-xs z-0"
                                                transition={{
                                                    duration: 0.25,
                                                    ease: [0.22, 1, 0.36, 1],
                                                }}
                                            />
                                        )}
                                        <span className="relative z-10">Collections</span>
                                    </button>
                                </div>
                                <DotsThree size={20} weight="bold" className="text-gray-400 ml-0.5" />
                            </div>
                        </div>

                        <div className="divide-y divide-black/[0.03] dark:divide-white/[0.04] mt-1">
                            {activityTab === 'loans' ? (
                                <>
                                    {recentLoansData?.loans?.slice(0, 4).map((loan) => {
                                        const borrowerName = `${loan.customerId?.firstName || 'Unknown'} ${loan.customerId?.lastName || ''}`.trim();
                                        const initials = getInitials(borrowerName);
                                        const formattedDate = formatDisplayDate(loan.createdAt || loan.startDate);
                                        return (
                                            <Link
                                                key={loan._id}
                                                to={`/loans/${loan._id}`}
                                                className="py-3.5 flex items-center justify-between hover:bg-gray-50/80 dark:hover:bg-white/[0.02] px-1 rounded-xl transition-colors group"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-9 h-9 rounded-full bg-[#dbe8fa] dark:bg-blue-950/40 text-[#1a56db] dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                        {initials}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-[#0c0d12] dark:text-white truncate group-hover:text-[#2563eb] transition-colors">
                                                            {borrowerName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                            Loan created • {formattedDate}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3.5 shrink-0 ml-4">
                                                    <span className="text-sm font-bold text-[#0c0d12] dark:text-white tabular-nums">
                                                        {formatCurrency(loan.principal)}
                                                    </span>
                                                    <span
                                                        className={`text-[11px] font-semibold px-3 py-0.5 rounded-full capitalize ${loan.status === 'active'
                                                            ? 'bg-[#e6f4ea] text-[#137333] dark:bg-emerald-950/40 dark:text-emerald-400'
                                                            : loan.status === 'completed'
                                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                                                                : loan.status === 'defaulted'
                                                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                                            }`}
                                                    >
                                                        {loan.status}
                                                    </span>
                                                    <CaretRight size={16} weight="regular" className="text-gray-400 group-hover:text-[#0c0d12] dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                                                </div>
                                            </Link>
                                        );
                                    })}
                                    {(!recentLoansData?.loans || recentLoansData.loans.length === 0) && (
                                        <div className="py-8 text-center">
                                            <p className="text-xs text-gray-400 dark:text-gray-500">No loans recorded yet</p>
                                            <Link to="/loans/new" className="text-xs font-semibold text-[#2563eb] mt-1 inline-block hover:underline">
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
                                        const formattedDate = formatDisplayDate(payment.paymentDate);
                                        return (
                                            <div
                                                key={payment._id}
                                                className="py-3.5 flex items-center justify-between hover:bg-gray-50/80 dark:hover:bg-white/[0.02] px-1 rounded-xl transition-colors"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-9 h-9 rounded-full bg-[#dbe8fa] dark:bg-blue-950/40 text-[#1a56db] dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                        {initials}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-[#0c0d12] dark:text-white truncate">
                                                            {borrowerName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                            Payment received • {formattedDate}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3.5 shrink-0 ml-4">
                                                    <span className="text-sm font-bold text-[#0c0d12] dark:text-white tabular-nums">
                                                        +{formatCurrency(payment.amountPaid)}
                                                    </span>
                                                    <span className="text-[11px] font-semibold px-3 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569] dark:bg-white/[0.06] dark:text-gray-300">
                                                        Payment
                                                    </span>
                                                    <CaretRight size={16} weight="regular" className="text-gray-400" />
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
                        </TiltCard>
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
                        className="h-full"
                    >
                        <TiltCard
                            glow="blue"
                            as={Link}
                            to="/customers"
                            className="h-full"
                            cardClassName="relative p-5 rounded-[24px] bg-white/90 dark:bg-[#141722]/90 flex flex-col justify-between min-h-[190px] h-full group block"
                            max={12}
                        >
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#0c0d12] dark:text-white">
                                <Users size={20} weight="regular" className="text-[#0c0d12] dark:text-white shrink-0" />
                                <span>Total Customers</span>
                            </div>

                            <div className="my-2 flex items-center">
                                <p className="text-2xl sm:text-[28px] font-bold text-[#0c0d12] dark:text-white tracking-tight tabular-nums flex items-center">
                                    <SpinningCounter key={`cust-${refreshTick}`} value={totalCustomers} spins={2} />
                                </p>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-[#526077] dark:text-gray-400">
                                <User size={15} weight="regular" className="text-gray-600 dark:text-gray-400 shrink-0" />
                                <span>{activeLoans} active borrowers</span>
                            </div>
                        </TiltCard>
                    </motion.div>

                    {/* ROW 2: QUICK ACTIONS */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={2}
                    >
                        <TiltCard
                            glow="blue"
                            cardClassName="bg-white/90 dark:bg-[#141722]/90 rounded-[24px] p-5"
                            max={8}
                        >
                            <div className="flex items-center justify-between mb-3.5">
                                <div className="flex items-center gap-2">
                                    <Lightning size={18} weight="regular" className="text-[#0c0d12] dark:text-white" />
                                    <h2 className="text-base font-bold text-[#0c0d12] dark:text-white">
                                        Quick Actions
                                    </h2>
                                </div>
                                <DotsThree size={20} weight="bold" className="text-gray-400" />
                            </div>

                            <div className="grid grid-cols-3 gap-2.5">
                                {/* Action 1: New Customer */}
                                <Link
                                    to="/customers/new"
                                    className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#f4f6fa] dark:bg-white/[0.03] border border-transparent hover:border-black/[0.06] dark:hover:border-white/10 hover:bg-[#edf2f7] dark:hover:bg-white/[0.06] transition-all text-center group min-h-[96px]"
                                >
                                    <UserPlus size={22} weight="regular" className="text-[#0c0d12] dark:text-white mb-2 group-hover:scale-105 transition-transform" />
                                    <span className="text-[11px] font-semibold text-[#0c0d12] dark:text-gray-200 leading-tight">
                                        New<br />Customer
                                    </span>
                                </Link>

                                {/* Action 2: Create Loan */}
                                <Link
                                    to="/loans/new"
                                    className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#f4f6fa] dark:bg-white/[0.03] border border-transparent hover:border-black/[0.06] dark:hover:border-white/10 hover:bg-[#edf2f7] dark:hover:bg-white/[0.06] transition-all text-center group min-h-[96px]"
                                >
                                    <FilePlus size={22} weight="regular" className="text-[#0c0d12] dark:text-white mb-2 group-hover:scale-105 transition-transform" />
                                    <span className="text-[11px] font-semibold text-[#0c0d12] dark:text-gray-200 leading-tight">
                                        Create<br />Loan
                                    </span>
                                </Link>

                                {/* Action 3: Record Payment */}
                                <Link
                                    to="/payments/new"
                                    className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#f4f6fa] dark:bg-white/[0.03] border border-transparent hover:border-black/[0.06] dark:hover:border-white/10 hover:bg-[#edf2f7] dark:hover:bg-white/[0.06] transition-all text-center group min-h-[96px]"
                                >
                                    <CreditCard size={22} weight="regular" className="text-[#0c0d12] dark:text-white mb-2 group-hover:scale-105 transition-transform" />
                                    <span className="text-[11px] font-semibold text-[#0c0d12] dark:text-gray-200 leading-tight">
                                        Record<br />Payment
                                    </span>
                                </Link>
                            </div>
                        </TiltCard>
                    </motion.div>

                    {/* ROW 3: ATTENTION NEEDED */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={3}
                    >
                        {needsAttention ? (
                            <TiltCard
                                glow="blue"
                                cardClassName="rounded-[24px] p-5 bg-[#fef2f2] dark:bg-[#1c1214] no-card-video flex flex-col justify-between"
                                max={8}
                            >
                                <div className="flex items-center justify-between pb-3 border-b border-rose-200/50 dark:border-rose-900/40">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-[#fde8e8] dark:bg-rose-900/40 text-[#ef4444] flex items-center justify-center">
                                            <Warning size={18} weight="regular" className="text-[#ef4444]" />
                                        </div>
                                        <span className="text-sm font-bold text-[#0c0d12] dark:text-white">
                                            Attention Needed
                                        </span>
                                    </div>
                                    <Link
                                        to={overdueLoans > 0 ? "/loans" : "/payments"}
                                        aria-label="Review overdue loans"
                                        className="w-7 h-7 rounded-full bg-white dark:bg-white/10 shadow-xs flex items-center justify-center text-[#ef4444] hover:bg-[#ef4444] hover:text-white transition-colors"
                                    >
                                        <ArrowRight size={15} weight="regular" />
                                    </Link>
                                </div>

                                <div className="space-y-2.5 pt-3 text-xs">
                                    {overdueLoans > 0 && (
                                        <div className="flex items-start gap-2.5">
                                            <Clock size={16} weight="regular" className="text-[#ef4444] shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-bold text-[#0c0d12] dark:text-white">
                                                    {overdueLoans} Overdue Loan{overdueLoans !== 1 ? 's' : ''}
                                                </p>
                                                <p className="text-[11px] text-[#717e95] dark:text-gray-400 mt-0.5">
                                                    Accounts past EMI grace period requiring follow-up
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {todaysDueEMIs > 0 && (
                                        <div className="flex items-start gap-2.5">
                                            <CalendarBlank size={16} weight="regular" className="text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-bold text-[#0c0d12] dark:text-white">
                                                    {todaysDueEMIs} EMI{todaysDueEMIs !== 1 ? 's' : ''} Due Today
                                                </p>
                                                <p className="text-[11px] text-[#717e95] dark:text-gray-400 mt-0.5">
                                                    Scheduled collections queue for today
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TiltCard>
                        ) : (
                            <TiltCard
                                glow="blue"
                                cardClassName="rounded-[24px] p-5 bg-[#f0fdf4] dark:bg-[#0f1f16] no-card-video flex flex-col justify-between"
                                max={8}
                            >
                                <div className="flex items-center justify-between pb-3 border-b border-emerald-200/50 dark:border-emerald-900/40">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                            <CheckCircle size={18} weight="regular" />
                                        </div>
                                        <span className="text-sm font-bold text-[#0c0d12] dark:text-white">
                                            Portfolio Healthy
                                        </span>
                                    </div>
                                    <Link
                                        to="/loans"
                                        aria-label="View loans"
                                        className="w-7 h-7 rounded-full bg-white dark:bg-white/10 shadow-xs flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors"
                                    >
                                        <ArrowRight size={15} weight="regular" />
                                    </Link>
                                </div>

                                <div className="pt-3 text-xs flex items-center gap-2">
                                    <ShieldCheck size={16} weight="regular" className="text-emerald-600 shrink-0" />
                                    <p className="text-[11px] text-gray-600 dark:text-gray-400">
                                        All {activeLoans} active loans are on schedule. No overdue accounts.
                                    </p>
                                </div>
                            </TiltCard>
                        )}
                    </motion.div>

                    {/* ROW 4: PORTFOLIO HEALTH */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={4}
                    >
                        <TiltCard
                            glow="blue"
                            cardClassName="bg-white/90 dark:bg-[#141722]/90 rounded-[24px] p-5"
                            max={6}
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-black/[0.04] dark:border-white/[0.08]">
                                <div className="flex items-center gap-2">
                                    <ChartPie size={18} weight="regular" className="text-[#0c0d12] dark:text-white" />
                                    <h2 className="text-base font-bold text-[#0c0d12] dark:text-white">
                                        Portfolio Health
                                    </h2>
                                </div>
                                <Link
                                    to="/loans"
                                    className="text-xs font-semibold text-[#2563eb] hover:underline"
                                >
                                    View all
                                </Link>
                            </div>

                            {/* Status Breakdown Rows */}
                            <div className="space-y-2.5 mt-3.5 text-xs">
                                {/* Active Loans */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 w-32 shrink-0">
                                        <FileText size={15} weight="regular" className="text-gray-600 dark:text-gray-400 shrink-0" />
                                        <span className="text-gray-600 dark:text-gray-400 font-medium text-[11px] truncate">Active Loans</span>
                                    </div>
                                    <div className="flex-1 h-2 bg-[#f1f5f9] dark:bg-white/[0.06] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#3b82f6] rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(100, Math.max(activeLoans > 0 ? 8 : 0, (activeLoans / Math.max(1, totalLoansCount)) * 100))}%` }}
                                        />
                                    </div>
                                    <span className="font-bold text-[#0c0d12] dark:text-white tabular-nums w-4 text-right text-[11px]">
                                        {activeLoans}
                                    </span>
                                </div>

                                {/* Completed Loans */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 w-32 shrink-0">
                                        <CheckCircle size={15} weight="regular" className="text-gray-600 dark:text-gray-400 shrink-0" />
                                        <span className="text-gray-600 dark:text-gray-400 font-medium text-[11px] truncate">Completed Loans</span>
                                    </div>
                                    <div className="flex-1 h-2 bg-[#f1f5f9] dark:bg-white/[0.06] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#bfdbfe] dark:bg-blue-900/60 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(100, Math.max(completedLoans > 0 ? 8 : 0, (completedLoans / Math.max(1, totalLoansCount)) * 100))}%` }}
                                        />
                                    </div>
                                    <span className="font-bold text-[#0c0d12] dark:text-white tabular-nums w-4 text-right text-[11px]">
                                        {completedLoans}
                                    </span>
                                </div>

                                {/* Overdue Loans */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 w-32 shrink-0">
                                        <Clock size={15} weight="regular" className="text-gray-600 dark:text-gray-400 shrink-0" />
                                        <span className="text-gray-600 dark:text-gray-400 font-medium text-[11px] truncate">Overdue Loans</span>
                                    </div>
                                    <div className="flex-1 h-2 bg-[#f1f5f9] dark:bg-white/[0.06] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#f97316] rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(100, Math.max(overdueLoans > 0 ? 8 : 0, (overdueLoans / Math.max(1, totalLoansCount)) * 100))}%` }}
                                        />
                                    </div>
                                    <span className="font-bold text-[#0c0d12] dark:text-white tabular-nums w-4 text-right text-[11px]">
                                        {overdueLoans}
                                    </span>
                                </div>

                                {/* Foreclosed Loans */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 w-32 shrink-0">
                                        <Prohibit size={15} weight="regular" className="text-gray-600 dark:text-gray-400 shrink-0" />
                                        <span className="text-gray-600 dark:text-gray-400 font-medium text-[11px] truncate">Foreclosed Loans</span>
                                    </div>
                                    <div className="flex-1 h-2 bg-[#f1f5f9] dark:bg-white/[0.06] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#cbd5e1] dark:bg-gray-600 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(100, Math.max(foreclosedLoans > 0 ? 8 : 0, (foreclosedLoans / Math.max(1, totalLoansCount)) * 100))}%` }}
                                        />
                                    </div>
                                    <span className="font-bold text-[#0c0d12] dark:text-white tabular-nums w-4 text-right text-[11px]">
                                        {foreclosedLoans}
                                    </span>
                                </div>

                                {/* Defaulted Loans */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 w-32 shrink-0">
                                        <XCircle size={15} weight="regular" className="text-gray-600 dark:text-gray-400 shrink-0" />
                                        <span className="text-gray-600 dark:text-gray-400 font-medium text-[11px] truncate">Defaulted Loans</span>
                                    </div>
                                    <div className="flex-1 h-2 bg-[#f1f5f9] dark:bg-white/[0.06] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#cbd5e1] dark:bg-gray-600 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(100, Math.max(defaultedLoans > 0 ? 8 : 0, (defaultedLoans / Math.max(1, totalLoansCount)) * 100))}%` }}
                                        />
                                    </div>
                                    <span className="font-bold text-[#0c0d12] dark:text-white tabular-nums w-4 text-right text-[11px]">
                                        {defaultedLoans}
                                    </span>
                                </div>
                            </div>

                            {/* Rates Breakdown */}
                            <div className="pt-3.5 border-t border-black/[0.04] dark:border-white/[0.08] space-y-2.5 mt-3.5 text-xs">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-gray-600 dark:text-gray-400 w-28 font-medium text-[11px]">Collection Rate</span>
                                    <div className="flex-1 h-2.5 bg-[#f1f5f9] dark:bg-white/[0.06] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#2563eb] rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(100, Math.max(0, collectionRate))}%` }}
                                        />
                                    </div>
                                    <span className="font-bold text-[#0c0d12] dark:text-white tabular-nums w-8 text-right text-[11px]">
                                        {collectionRate}%
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-gray-600 dark:text-gray-400 w-28 font-medium text-[11px]">Recovery Rate</span>
                                    <div className="flex-1 h-2.5 bg-[#f1f5f9] dark:bg-white/[0.06] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#2563eb] rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(100, Math.max(0, recoveryRate))}%` }}
                                        />
                                    </div>
                                    <span className="font-bold text-[#0c0d12] dark:text-white tabular-nums w-8 text-right text-[11px]">
                                        {recoveryRate}%
                                    </span>
                                </div>
                            </div>
                        </TiltCard>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
