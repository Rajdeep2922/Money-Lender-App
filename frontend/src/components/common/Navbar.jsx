import React, { useState, useEffect, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    HandCoins,
    CreditCard,
    FileText,
    Calculator,
    LogOut,
    Menu,
    X,
} from 'lucide-react';
import { useLender } from '../../hooks/useLender';
import useAuthStore from '../../store/authStore';

const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, matchExact: true },
    { to: '/customers', label: 'Customers', icon: Users },
    { to: '/loans', label: 'Loans', icon: HandCoins },
    { to: '/payments', label: 'Payments', icon: CreditCard },
    { to: '/invoices', label: 'Invoices', icon: FileText },
    { to: '/calculator', label: 'Calculator', icon: Calculator, public: true },
];

const Navbar = () => {
    const { data: lender } = useLender();
    const { user: authUser } = useAuthStore();
    const location = useLocation();
    const displayName = lender?.ownerName || authUser?.username || '';
    const user = authUser ? { username: displayName } : null;
    const businessName = lender?.businessName || 'MoneyLender';

    const getInitials = (name) => {
        if (!name) return 'ML';
        const words = name.trim().split(/\s+/);
        return words.length >= 2
            ? (words[0][0] + words[1][0]).toUpperCase()
            : name.slice(0, 2).toUpperCase();
    };

    const [mobileOpen, setMobileOpen] = useState(false);

    // Auto-detect dark mode from system preference
    useEffect(() => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);
    }, []);

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
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 shrink-0">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm">
                                <span className="text-white text-xs font-bold tracking-tight">
                                    {getInitials(businessName)}
                                </span>
                            </div>
                            <span className="text-[15px] font-semibold text-gray-900 dark:text-white hidden sm:block">
                                {businessName}
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center">
                            <div className="flex items-center bg-gray-50 dark:bg-gray-800/60 rounded-xl p-1 gap-0.5">
                                {visibleLinks.map(link => {
                                    const Icon = link.icon;
                                    const active = checkActive(link);
                                    return (
                                        <Link
                                            key={link.to}
                                            to={link.to}
                                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${active
                                                ? 'bg-white dark:bg-gray-700 text-teal-700 dark:text-teal-300 shadow-sm'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 ${active ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400 dark:text-gray-500'}`} strokeWidth={1.8} />
                                            <span className="hidden lg:inline">{link.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-1.5">

                            {/* User area (desktop) */}
                            {user && (
                                <div className="hidden md:flex items-center gap-1.5 ml-2 pl-3 border-l border-gray-200 dark:border-gray-700">
                                    <Link
                                        to="/settings"
                                        className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-gray-900">
                                            {lender?.companyStamp ? (
                                                <img src={lender.companyStamp} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-[11px] font-bold text-white">
                                                    {user.username?.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[13px] font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors hidden lg:block">
                                            {user.username}
                                        </span>
                                    </Link>
                                    <button
                                        onClick={() => { window.location.href = '/signout'; }}
                                        className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut className="w-[18px] h-[18px]" strokeWidth={1.8} />
                                    </button>
                                </div>
                            )}

                            {/* Mobile hamburger */}
                            <button
                                onClick={() => setMobileOpen(prev => !prev)}
                                className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                            >
                                {mobileOpen
                                    ? <X className="w-5 h-5" strokeWidth={2} />
                                    : <Menu className="w-5 h-5" strokeWidth={2} />
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile menu overlay + panel */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 md:hidden"
                            onClick={() => setMobileOpen(false)}
                        />

                        {/* Menu panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                            className="fixed top-16 left-0 right-0 z-50 md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg shadow-black/5 dark:shadow-black/20"
                        >
                            <div className="max-w-lg mx-auto px-4 py-3 space-y-1">
                                {visibleLinks.map(link => {
                                    const Icon = link.icon;
                                    const active = checkActive(link);
                                    return (
                                        <Link
                                            key={link.to}
                                            to={link.to}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${active
                                                ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                                                : 'text-gray-700 dark:text-gray-300 active:bg-gray-50 dark:active:bg-gray-800'
                                                }`}
                                        >
                                            <Icon
                                                className={`w-5 h-5 ${active ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400 dark:text-gray-500'}`}
                                                strokeWidth={1.8}
                                            />
                                            {link.label}
                                        </Link>
                                    );
                                })}

                                {user && (
                                    <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800 space-y-1">
                                        <Link
                                            to="/settings"
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium text-gray-700 dark:text-gray-300 active:bg-gray-50 dark:active:bg-gray-800"
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center overflow-hidden">
                                                {lender?.companyStamp ? (
                                                    <img src={lender.companyStamp} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[11px] font-bold text-white">
                                                        {user.username?.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{user.username}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">Settings</p>
                                            </div>
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setMobileOpen(false);
                                                window.location.href = '/signout';
                                            }}
                                            className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-[15px] font-medium text-red-500 dark:text-red-400 active:bg-red-50 dark:active:bg-red-900/10 transition-colors"
                                        >
                                            <LogOut className="w-5 h-5" strokeWidth={1.8} />
                                            Logout
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
