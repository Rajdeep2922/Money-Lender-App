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

    const checkActive = (link) => {
        if (link.matchExact) return location.pathname === link.to;
        return location.pathname.startsWith(link.to);
    };

    const visibleLinks = user ? navLinks : navLinks.filter(l => l.public);

    return (
        <>
            <nav
                className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-black/[0.06] dark:border-white/[0.08] transition-colors"
                aria-label="Main lending workspace navigation"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* Brand & Workspace Identity */}
                        <Link
                            to="/"
                            className="flex items-center gap-2.5 shrink-0 group focus:outline-none"
                            aria-label="SLOBE Dashboard"
                        >
                            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-2xs">
                                <Landmark className="w-4 h-4 text-white" strokeWidth={2.2} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[13px] font-bold tracking-tight text-gray-900 dark:text-white leading-none">
                                        SLOBE
                                    </span>
                                    <span className="hidden sm:inline-block text-[10px] font-mono font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide px-1 py-0.5 rounded bg-gray-100 dark:bg-white/[0.06] leading-none">
                                        Lending
                                    </span>
                                </div>
                                {businessName && (
                                    <span
                                        className="text-[11px] font-medium text-gray-500 dark:text-gray-400 truncate max-w-[120px] sm:max-w-[150px] md:max-w-[180px] leading-tight mt-0.5"
                                        title={businessName}
                                    >
                                        {businessName}
                                    </span>
                                )}
                            </div>
                        </Link>

                        {/* Desktop & Tablet Navigation */}
                        <div className="hidden md:flex items-center h-full gap-0.5 lg:gap-1">
                            {visibleLinks.map(link => {
                                const Icon = link.icon;
                                const active = checkActive(link);
                                const badge = getBadgeCount(link);
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        aria-current={active ? 'page' : undefined}
                                        className={`relative flex items-center h-full gap-1.5 px-2 lg:px-3 text-[12px] lg:text-[13px] transition-colors ${
                                            active
                                                ? 'text-primary dark:text-primary-bright font-semibold'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium'
                                        }`}
                                    >
                                        <Icon
                                            className={`w-4 h-4 shrink-0 transition-colors ${
                                                active
                                                    ? 'text-primary dark:text-primary-bright'
                                                    : 'text-gray-400 dark:text-gray-500'
                                            }`}
                                            strokeWidth={1.8}
                                        />
                                        <span>{link.label}</span>
                                        {badge > 0 && (
                                            <NotificationBadge count={badge} className="ml-0.5" />
                                        )}
                                        {active && (
                                            <motion.div
                                                layoutId="navbar-active-indicator"
                                                className="absolute bottom-0 left-1.5 right-1.5 h-[2px] bg-primary dark:bg-primary-bright rounded-t-full"
                                                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right Area: ThemeToggle + User Profile + Logout */}
                        <div className="flex items-center gap-2 sm:gap-2.5">
                            <ThemeToggle />

                            {/* User Profile Area (Desktop) */}
                            {user && (
                                <div className="hidden md:flex items-center gap-1.5 pl-2.5 border-l border-black/[0.08] dark:border-white/[0.1]">
                                    <Link
                                        to="/settings"
                                        className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg hover:bg-gray-100/70 dark:hover:bg-white/[0.05] transition-colors group"
                                        title="Workspace Settings"
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center overflow-hidden shrink-0 border border-black/[0.06] dark:border-white/[0.1]">
                                            {lender?.companyStamp ? (
                                                <img
                                                    src={lender.companyStamp}
                                                    alt="Company Stamp"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-[11px] font-bold text-white leading-none">
                                                    {user.username?.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors hidden xl:block truncate max-w-[120px]">
                                            {user.username}
                                        </span>
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() => { window.location.href = '/signout'; }}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-950/20 transition-colors"
                                        title="Log out"
                                        aria-label="Log out"
                                    >
                                        <LogOut className="w-4 h-4" strokeWidth={1.8} />
                                    </button>
                                </div>
                            )}

                            {/* Mobile Menu Hamburger */}
                            <button
                                type="button"
                                onClick={() => setMobileOpen(prev => !prev)}
                                className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
                                aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                                aria-expanded={mobileOpen}
                            >
                                {mobileOpen
                                    ? <X className="w-4 h-4" strokeWidth={2} />
                                    : <Menu className="w-4 h-4" strokeWidth={2} />
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="fixed inset-0 z-40 bg-black/30 dark:bg-black/60 md:hidden backdrop-blur-xs"
                            onClick={() => setMobileOpen(false)}
                            aria-hidden="true"
                        />

                        {/* Mobile Menu Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className="fixed top-16 left-0 right-0 z-50 md:hidden bg-white dark:bg-black border-b border-black/[0.08] dark:border-white/[0.1] shadow-lg shadow-black/5 dark:shadow-black/30"
                        >
                            <div className="max-w-lg mx-auto px-4 py-3 space-y-1">
                                {visibleLinks.map(link => {
                                    const Icon = link.icon;
                                    const active = checkActive(link);
                                    const badge = getBadgeCount(link);
                                    return (
                                        <Link
                                            key={link.to}
                                            to={link.to}
                                            aria-current={active ? 'page' : undefined}
                                            className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                                                active
                                                    ? 'bg-primary/10 text-primary dark:text-primary-bright font-semibold'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                                            }`}
                                        >
                                            <Icon
                                                className={`w-4 h-4 ${active ? 'text-primary dark:text-primary-bright' : 'text-gray-400 dark:text-gray-500'}`}
                                                strokeWidth={1.8}
                                            />
                                            <span>{link.label}</span>
                                            {badge > 0 && (
                                                <NotificationBadge count={badge} className="ml-auto" />
                                            )}
                                        </Link>
                                    );
                                })}

                                {user && (
                                    <div className="pt-2 mt-2 border-t border-black/[0.06] dark:border-white/[0.08] space-y-1">
                                        <Link
                                            to="/settings"
                                            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center overflow-hidden shrink-0 border border-black/[0.06] dark:border-white/[0.1]">
                                                {lender?.companyStamp ? (
                                                    <img
                                                        src={lender.companyStamp}
                                                        alt="Company Stamp"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-[11px] font-bold text-white leading-none">
                                                        {user.username?.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight truncate">
                                                    {user.username}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                    Workspace Settings
                                                </p>
                                            </div>
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMobileOpen(false);
                                                window.location.href = '/signout';
                                            }}
                                            className="flex items-center gap-3 w-full text-left px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-950/20 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" strokeWidth={1.8} />
                                            <span>Log out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default memo(Navbar);
