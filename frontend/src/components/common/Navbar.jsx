import React, { useState, useEffect, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Landmark,
    LayoutDashboard,
    Users,
    HandCoins,
    CreditCard,
    FileText,
    Calculator,
    Settings,
    LogOut,
    Menu,
    X,
    Inbox,
} from 'lucide-react';
import { useLender } from '../../hooks/useLender';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import NotificationBadge from '../notifications/NotificationBadge';
import ThemeToggle from './ThemeToggle';

const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, matchExact: true },
    { to: '/customers', label: 'Customers', icon: Users },
    { to: '/loans', label: 'Loans', icon: HandCoins },
    { to: '/payments', label: 'Payments', icon: CreditCard },
    { to: '/invoices', label: 'Invoices', icon: FileText },
    { to: '/loan-requests', label: 'Requests', icon: Inbox, badgeKey: 'requests' },
    { to: '/calculator', label: 'Calculator', icon: Calculator, public: true },
];

const Navbar = () => {
    const { data: lender } = useLender();
    const { user: authUser } = useAuthStore();
    const location = useLocation();
    const { unreadRequests, unreadChats } = useNotificationStore();
    const totalUnreadChats = Object.values(unreadChats).reduce((s, n) => s + n, 0);
    const displayName = lender?.ownerName || authUser?.username || '';
    const user = authUser ? { username: displayName } : null;
    const businessName = lender?.businessName || '';

    const getBadgeCount = (link) => {
        if (link.badgeKey === 'requests') return unreadRequests + totalUnreadChats;
        return 0;
    };

    const [mobileOpen, setMobileOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    // Close mobile drawer on escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && mobileOpen) {
                setMobileOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mobileOpen]);

    const checkActive = (link) => {
        if (link.matchExact) {
            return location.pathname === link.to || (link.to === '/' && location.pathname === '/dashboard');
        }
        return location.pathname.startsWith(link.to);
    };

    const visibleLinks = user ? navLinks : navLinks.filter(l => l.public);

    return (
        <>
            {/* ========================================================================= */}
            {/* DESKTOP VERTICAL NAVIGATION RAIL (md and above)                            */}
            {/* ========================================================================= */}
            <aside
                aria-label="Lending workspace navigation"
                className="hidden md:flex fixed inset-y-0 left-0 w-[72px] z-40 bg-white dark:bg-black border-r border-black/[0.06] dark:border-white/[0.08] flex-col items-center justify-between py-5 select-none transition-colors"
            >
                {/* Top Section: Business Brand Mark */}
                <div className="flex flex-col items-center w-full px-3">
                    <Link
                        to="/"
                        className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-primary text-white shadow-xs hover:opacity-95 transition-all group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-black focus:outline-none"
                        aria-label={businessName ? `${businessName} Dashboard` : 'Money Lender Dashboard'}
                    >
                        {lender?.companyStamp ? (
                            <img
                                src={lender.companyStamp}
                                alt="Company Stamp"
                                className="w-full h-full object-cover rounded-2xl"
                            />
                        ) : (
                            <Landmark className="w-5 h-5 text-white" strokeWidth={2.2} />
                        )}

                        {/* Brand Hover Tooltip */}
                        <div
                            role="tooltip"
                            className="absolute left-full ml-3.5 px-2.5 py-1 bg-gray-900 dark:bg-gray-800 text-white text-[12px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 shadow-lg z-50 pointer-events-none"
                        >
                            {businessName || 'Money Lender'}
                        </div>
                    </Link>
                </div>

                {/* Middle Section: Main Navigation Links */}
                <nav
                    className="flex flex-col items-center gap-2 w-full px-3"
                    aria-label="Main menu"
                >
                    {visibleLinks.map((link) => {
                        const Icon = link.icon;
                        const active = checkActive(link);
                        const badge = getBadgeCount(link);

                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                aria-current={active ? 'page' : undefined}
                                aria-label={link.label}
                                className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-all group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-black focus:outline-none ${
                                    active
                                        ? 'bg-primary/10 text-primary dark:text-primary-bright font-semibold'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                                }`}
                            >
                                {/* Left violet active indicator bar */}
                                {active && (
                                    <motion.div
                                        layoutId="rail-active-pill"
                                        className="absolute -left-3 w-1 h-5 bg-primary dark:bg-primary-bright rounded-r-full"
                                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                    />
                                )}

                                <Icon
                                    className={`w-5 h-5 transition-colors ${
                                        active
                                            ? 'text-primary dark:text-primary-bright'
                                            : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                                    }`}
                                    strokeWidth={active ? 2.2 : 1.8}
                                />

                                {/* Notification count badge */}
                                {badge > 0 && (
                                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-primary rounded-full ring-2 ring-white dark:ring-black">
                                        {badge > 99 ? '99+' : badge}
                                    </span>
                                )}

                                {/* Floating Tooltip */}
                                <div
                                    role="tooltip"
                                    className="absolute left-full ml-3.5 px-2.5 py-1 bg-gray-900 dark:bg-gray-800 text-white text-[12px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 shadow-lg z-50 pointer-events-none"
                                >
                                    {link.label}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section: ThemeToggle, Settings, Profile & Logout */}
                <div className="flex flex-col items-center gap-2.5 w-full px-3 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
                    {/* Compact Theme Toggle */}
                    <ThemeToggle compact />

                    {user && (
                        <>
                            {/* Settings Link */}
                            <Link
                                to="/settings"
                                aria-label="Settings"
                                className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-all group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-black focus:outline-none ${
                                    location.pathname.startsWith('/settings')
                                        ? 'bg-primary/10 text-primary dark:text-primary-bright'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                                }`}
                            >
                                <Settings className="w-5 h-5" strokeWidth={1.8} />
                                <div
                                    role="tooltip"
                                    className="absolute left-full ml-3.5 px-2.5 py-1 bg-gray-900 dark:bg-gray-800 text-white text-[12px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 shadow-lg z-50 pointer-events-none"
                                >
                                    Settings
                                </div>
                            </Link>

                            {/* User Profile Avatar Link */}
                            <Link
                                to="/settings"
                                aria-label={`Workspace Profile: ${user.username}`}
                                className="relative flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden border border-black/[0.08] dark:border-white/[0.1] bg-primary text-white shadow-2xs hover:opacity-90 transition-opacity group focus-visible:ring-2 focus-visible:ring-primary focus:outline-none mt-0.5"
                            >
                                {lender?.companyStamp ? (
                                    <img
                                        src={lender.companyStamp}
                                        alt="Company Stamp"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-[12px] font-bold text-white leading-none">
                                        {user.username?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                )}
                                <div
                                    role="tooltip"
                                    className="absolute left-full ml-3.5 px-2.5 py-1 bg-gray-900 dark:bg-gray-800 text-white text-[12px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 shadow-lg z-50 pointer-events-none"
                                >
                                    {user.username || 'Profile'}
                                </div>
                            </Link>

                            {/* Logout Button */}
                            <button
                                type="button"
                                onClick={() => {
                                    window.location.href = '/signout';
                                }}
                                aria-label="Log out"
                                className="relative flex items-center justify-center w-10 h-10 rounded-xl text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-950/20 transition-colors group focus-visible:ring-2 focus-visible:ring-red-500 focus:outline-none"
                            >
                                <LogOut className="w-4 h-4" strokeWidth={1.8} />
                                <div
                                    role="tooltip"
                                    className="absolute left-full ml-3.5 px-2.5 py-1 bg-gray-900 dark:bg-gray-800 text-white text-[12px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 shadow-lg z-50 pointer-events-none"
                                >
                                    Log out
                                </div>
                            </button>
                        </>
                    )}
                </div>
            </aside>

            {/* ========================================================================= */}
            {/* MOBILE TOP NAVIGATION BAR (< md)                                          */}
            {/* ========================================================================= */}
            <header
                className="md:hidden fixed top-0 left-0 right-0 h-14 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-black/[0.06] dark:border-white/[0.08] px-4 flex items-center justify-between transition-colors"
                aria-label="Mobile workspace header"
            >
                {/* Brand & Workspace Identity */}
                <Link
                    to="/"
                    className="flex items-center gap-2.5 shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                    aria-label="Dashboard"
                >
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                        {lender?.companyStamp ? (
                            <img
                                src={lender.companyStamp}
                                alt="Company Stamp"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Landmark className="w-4 h-4 text-white" strokeWidth={2.2} />
                        )}
                    </div>
                    <span className="text-[14px] font-semibold text-gray-900 dark:text-white tracking-tight truncate max-w-[180px]">
                        {businessName || 'Money Lender'}
                    </span>
                </Link>

                {/* Right controls: ThemeToggle + Hamburger */}
                <div className="flex items-center gap-1.5">
                    <ThemeToggle compact />
                    <button
                        type="button"
                        onClick={() => setMobileOpen((prev) => !prev)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X className="w-5 h-5" strokeWidth={2} /> : <Menu className="w-5 h-5" strokeWidth={2} />}
                    </button>
                </div>
            </header>

            {/* ========================================================================= */}
            {/* MOBILE NAVIGATION DRAWER (Slide-out from left)                             */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 md:hidden backdrop-blur-xs"
                            onClick={() => setMobileOpen(false)}
                            aria-hidden="true"
                        />

                        {/* Slide-out Drawer Panel */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                            className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-[#0a0b0d] border-r border-black/[0.08] dark:border-white/[0.1] shadow-2xl flex flex-col justify-between p-4 md:hidden"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Navigation drawer"
                        >
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 overflow-hidden">
                                        {lender?.companyStamp ? (
                                            <img
                                                src={lender.companyStamp}
                                                alt="Company Stamp"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Landmark className="w-4 h-4 text-white" strokeWidth={2.2} />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {businessName || 'Money Lender'}
                                        </p>
                                        <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                                            Lending Workspace
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setMobileOpen(false)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                                    aria-label="Close navigation"
                                >
                                    <X className="w-4 h-4" strokeWidth={2} />
                                </button>
                            </div>

                            {/* Drawer Links */}
                            <div className="py-4 space-y-1 overflow-y-auto flex-1">
                                {visibleLinks.map((link) => {
                                    const Icon = link.icon;
                                    const active = checkActive(link);
                                    const badge = getBadgeCount(link);

                                    return (
                                        <Link
                                            key={link.to}
                                            to={link.to}
                                            aria-current={active ? 'page' : undefined}
                                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                                                active
                                                    ? 'bg-primary/10 text-primary dark:text-primary-bright font-semibold'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                                            }`}
                                        >
                                            <Icon
                                                className={`w-4 h-4 shrink-0 ${
                                                    active
                                                        ? 'text-primary dark:text-primary-bright'
                                                        : 'text-gray-400 dark:text-gray-500'
                                                }`}
                                                strokeWidth={1.8}
                                            />
                                            <span className="truncate">{link.label}</span>
                                            {badge > 0 && (
                                                <NotificationBadge count={badge} className="ml-auto" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Drawer Bottom Workspace & User Card */}
                            {user && (
                                <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2">
                                    <Link
                                        to="/settings"
                                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center overflow-hidden shrink-0">
                                            {lender?.companyStamp ? (
                                                <img
                                                    src={lender.companyStamp}
                                                    alt="Company Stamp"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-[12px] font-bold text-white leading-none">
                                                    {user.username?.charAt(0).toUpperCase() || 'U'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                {user.username}
                                            </p>
                                            <p className="text-[11px] text-gray-400 dark:text-gray-500">
                                                Workspace Settings
                                            </p>
                                        </div>
                                        <Settings className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMobileOpen(false);
                                            window.location.href = '/signout';
                                        }}
                                        className="flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-950/20 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" strokeWidth={1.8} />
                                        <span>Log out</span>
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default memo(Navbar);
