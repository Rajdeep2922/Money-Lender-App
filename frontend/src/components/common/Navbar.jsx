import React, { useState, useEffect, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Coins,
    House,
    Users,
    CreditCard,
    FileText,
    Receipt,
    Calculator,
    Gear,
    SignOut,
    List,
    X,
    Bell,
    Bank,
} from '@phosphor-icons/react';
import { useLender } from '../../hooks/useLender';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import NotificationBadge from '../notifications/NotificationBadge';
import ThemeToggle from './ThemeToggle';

const navLinks = [
    { to: '/', label: 'Dashboard', icon: House, matchExact: true },
    { to: '/customers', label: 'Customers', icon: Users },
    { to: '/loans', label: 'Loans', icon: FileText },
    { to: '/payments', label: 'Payments', icon: CreditCard },
    { to: '/invoices', label: 'Invoices', icon: Receipt },
    { to: '/loan-requests', label: 'Loan Requests', icon: Bell, badgeKey: 'requests' },
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
            {/* DESKTOP WIDE LABELLED SIDEBAR (md and above, 230px Floating Panel)        */}
            {/* Pale Pastel Blue with 24px rounded corners matching reference screenshot  */}
            {/* ========================================================================= */}
            <aside
                aria-label="Lending workspace navigation"
                className="hidden md:flex fixed top-3 left-3 bottom-3 w-[230px] z-40 bg-[#d2e2fa] dark:bg-[#141722] sidebar-3d rounded-[24px] flex-col justify-between py-5 px-3 select-none transition-colors"
            >
                {/* Top Section: Business Brand Mark with Title */}
                <div className="w-full">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-2 py-1 mb-5 rounded-2xl group focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
                        aria-label={businessName ? `${businessName} Dashboard` : 'Money Lender Dashboard'}
                    >
                        <div className="w-10 h-10 rounded-2xl bg-[#0c0d12] dark:bg-[#202738] dark:border dark:border-white/10 text-white flex items-center justify-center shrink-0 shadow-sm transition-colors">
                            <Coins size={20} weight="regular" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-[#0c0d12] dark:text-white tracking-tight leading-tight truncate">
                                Money
                            </span>
                            <span className="text-sm font-bold text-[#0c0d12] dark:text-white tracking-tight leading-tight truncate">
                                Lender
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Links with Icons and Full Labels */}
                    <nav className="flex flex-col gap-1.5 w-full" aria-label="Main menu">
                        {visibleLinks.map((link) => {
                            const Icon = link.icon;
                            const active = checkActive(link);
                            const badge = getBadgeCount(link);

                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    aria-current={active ? 'page' : undefined}
                                    className={`relative flex items-center justify-between px-4 py-2.5 rounded-full text-sm font-medium transition-colors group focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ${active
                                            ? 'text-white font-semibold'
                                            : 'text-[#0c0d12] dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/[0.06] dark:hover:text-white'
                                        }`}
                                >
                                    {active && (
                                        <motion.span
                                            layoutId="desktopNavActivePill"
                                            className="absolute inset-0 rounded-full bg-[#0c0d12] dark:bg-[#202738] dark:border dark:border-white/10 shadow-xs z-0"
                                            transition={{
                                                duration: 0.25,
                                                ease: [0.22, 1, 0.36, 1],
                                            }}
                                        />
                                    )}
                                    <div className="relative z-10 flex items-center gap-3 min-w-0">
                                        <Icon
                                            size={18}
                                            weight="regular"
                                            className={`shrink-0 transition-colors ${active ? 'text-white' : 'text-[#0c0d12] dark:text-gray-300'
                                                }`}
                                        />
                                        <span className="truncate">{link.label}</span>
                                    </div>

                                    {badge > 0 && (
                                        <span className="relative z-10 flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[11px] font-bold text-white bg-[#ff4d4f] rounded-full shadow-xs">
                                            {badge > 99 ? '99+' : badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom Section: Settings, Theme, User Profile & Logout */}
                <div className="flex flex-col gap-1 w-full pt-4 border-t border-[#c0d6f6] dark:border-white/[0.08]">
                    {user && (
                        <Link
                            to="/settings"
                            className={`flex items-center gap-3 px-4 py-2 rounded-full text-sm font-medium transition-all group focus-visible:ring-2 focus-visible:ring-primary focus:outline-none ${location.pathname.startsWith('/settings')
                                    ? 'bg-white/80 dark:bg-white/10 text-[#0c0d12] dark:text-white font-semibold'
                                    : 'text-[#0c0d12] dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/[0.06]'
                                }`}
                        >
                            <Gear size={18} weight="regular" className="text-[#0c0d12] dark:text-gray-300" />
                            <span>Settings</span>
                        </Link>
                    )}

                    {/* Theme Toggle */}
                    <ThemeToggle sidebar />

                    {user && (
                        <>
                            {/* User Profile Card */}
                            <Link
                                to="/settings"
                                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/60 dark:hover:bg-white/[0.06] transition-colors mt-1 group"
                                aria-label={`Workspace Profile: ${user.username}`}
                            >
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-[#0c0d12] dark:bg-[#202738] dark:border dark:border-white/10 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs transition-colors">
                                    {lender?.companyStamp ? (
                                        <img
                                            src={lender.companyStamp}
                                            alt="Company Stamp"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span>{user.username?.charAt(0).toUpperCase() || 'U'}</span>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-[#0c0d12] dark:text-white truncate leading-tight">
                                        {displayName || user.username}
                                    </p>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate leading-tight mt-0.5">
                                        Lender
                                    </p>
                                </div>
                            </Link>

                            {/* Logout */}
                            <button
                                type="button"
                                onClick={() => {
                                    window.location.href = '/signout';
                                }}
                                aria-label="Log out"
                                className="flex items-center gap-3 w-full text-left px-4 py-2 rounded-full text-sm font-medium text-[#0c0d12] dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white/60 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                            >
                                <SignOut size={18} weight="regular" />
                                <span>Log Out</span>
                            </button>
                        </>
                    )}
                </div>
            </aside>

            {/* ========================================================================= */}
            {/* MOBILE TOP NAVIGATION BAR (< md)                                          */}
            {/* ========================================================================= */}
            <header
                className="md:hidden fixed top-0 left-0 right-0 h-14 z-40 bg-white/95 dark:bg-[#141722]/95 backdrop-blur-md border-b-2 border-[#0c0d12] dark:border-[#283044] shadow-[0_2px_0px_#0c0d12] dark:shadow-[0_2px_0px_#000000] px-4 flex items-center justify-between transition-colors"
                aria-label="Mobile workspace header"
            >
                {/* Brand & Workspace Identity */}
                <Link
                    to="/"
                    className="flex items-center gap-2.5 shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                    aria-label="Dashboard"
                >
                    <div className="w-8 h-8 rounded-lg bg-[#0c0d12] dark:bg-[#202738] dark:border dark:border-white/10 text-white flex items-center justify-center shrink-0 shadow-2xs overflow-hidden transition-colors">
                        {lender?.companyStamp ? (
                            <img
                                src={lender.companyStamp}
                                alt="Company Stamp"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Bank size={18} weight="regular" />
                        )}
                    </div>
                    <span className="text-[14px] font-semibold text-gray-900 dark:text-white tracking-tight truncate max-w-[180px]">
                        {businessName || 'Money Lender'}
                    </span>
                </Link>

                {/* Right controls: ThemeToggle + Hamburger */}
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button
                        type="button"
                        onClick={() => setMobileOpen((prev) => !prev)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X size={20} weight="regular" /> : <List size={20} weight="regular" />}
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
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 md:hidden backdrop-blur-xs"
                            onClick={() => setMobileOpen(false)}
                            aria-hidden="true"
                        />

                        {/* Slide-out Drawer Panel (Transitions.dev 07-panel-reveal.md: Open 400ms, Close 350ms) */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{
                                duration: 0.4,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-[#141722] border-r-2 border-[#0c0d12] dark:border-[#283044] shadow-[4px_0px_0px_#0c0d12] dark:shadow-[4px_0px_0px_#000000] flex flex-col justify-between p-4 md:hidden"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Navigation drawer"
                        >
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-[#0c0d12] dark:bg-[#202738] dark:border dark:border-white/10 text-white flex items-center justify-center shrink-0 overflow-hidden transition-colors">
                                        {lender?.companyStamp ? (
                                            <img
                                                src={lender.companyStamp}
                                                alt="Company Stamp"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Bank size={18} weight="regular" />
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
                                    <X size={18} weight="regular" />
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
                                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${active
                                                    ? 'bg-primary/10 text-primary dark:text-primary-bright font-semibold'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                                                }`}
                                        >
                                            <Icon
                                                size={18}
                                                weight="regular"
                                                className={`shrink-0 ${active
                                                        ? 'text-primary dark:text-primary-bright'
                                                        : 'text-gray-400 dark:text-gray-500'
                                                    }`}
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
                            <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2">
                                <ThemeToggle sidebar />
                                {user && (
                                    <>
                                        <Link
                                            to="/settings"
                                            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-[#0c0d12] dark:bg-[#202738] dark:border dark:border-white/10 text-white flex items-center justify-center overflow-hidden shrink-0 transition-colors">
                                                {lender?.companyStamp ? (
                                                    <img
                                                        src={lender.companyStamp}
                                                        alt="Company Stamp"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-[12px] font-bold leading-none">
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
                                            <Gear size={18} weight="regular" className="text-gray-400 dark:text-gray-500 shrink-0" />
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMobileOpen(false);
                                                window.location.href = '/signout';
                                            }}
                                            className="flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-950/20 transition-colors"
                                        >
                                            <SignOut size={18} weight="regular" />
                                            <span>Log out</span>
                                        </button>
                                    </>
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
