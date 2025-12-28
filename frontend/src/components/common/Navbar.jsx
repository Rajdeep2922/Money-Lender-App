import React, { useState, useEffect, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet,
    Menu,
    X,
    Home,
    CreditCard,
    Users,
    Banknote,
    LogOut,
    User,
    Settings,
    Moon,
    Sun,
    FileText
} from 'lucide-react';
import Button from './Button';
import { useLender } from '../../hooks/useLender';
import useAuthStore from '../../store/authStore';
import { useLogout } from '../../hooks/useAuth';

// Mobile detection for reduced animations
const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;

const Navbar = () => {
    const { data: lender } = useLender();
    const { user: authUser, isAuthenticated } = useAuthStore();
    const logoutMutation = useLogout();
    const navigate = useNavigate();
    const user = authUser ? { username: authUser.username } : null;
    const businessName = lender?.businessName || 'MoneyLender';
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [darkMode, setDarkMode] = useState(() => {
        // Initial state from localStorage to prevent flash/re-render
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('darkMode') === 'true' ||
            (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });
    const location = useLocation();

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('darkMode', String(newMode));
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const logout = () => {
        window.location.href = '/signout';
    };

    const isActiveLink = (path) => location.pathname === path;

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-2"
                    >
                        <Link to="/" className="flex items-center space-x-2 group">
                            <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                <Wallet className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                                {businessName}
                            </span>
                        </Link>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {user ? (
                            <>
                                <NavItem
                                    to="/"
                                    icon={Home}
                                    label="Dashboard"
                                    isActive={isActiveLink('/')}
                                />
                                <NavItem
                                    to="/customers"
                                    icon={Users}
                                    label="Customers"
                                    isActive={isActiveLink('/customers')}
                                />
                                <NavItem
                                    to="/loans"
                                    icon={Banknote}
                                    label="Loans"
                                    isActive={isActiveLink('/loans')}
                                />
                                <NavItem
                                    to="/payments"
                                    icon={CreditCard}
                                    label="Payments"
                                    isActive={isActiveLink('/payments')}
                                />
                                <NavItem
                                    to="/invoices"
                                    icon={FileText}
                                    label="Invoices"
                                    isActive={isActiveLink('/invoices')}
                                />
                                <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-gray-200 dark:border-gray-700">
                                    <Link to="/settings">
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            className="flex items-center space-x-2 cursor-pointer"
                                        >
                                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                                                {lender?.companyStamp ? (
                                                    <img src={lender.companyStamp} alt="Logo" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-sm font-bold text-white">
                                                        {user.username?.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden lg:block">
                                                {user.username}
                                            </span>
                                        </motion.div>
                                    </Link>

                                    <Button
                                        variant="danger"
                                        onClick={logout}
                                        className="ml-4"
                                        icon={LogOut}
                                    >
                                        <span className="hidden lg:inline">Logout</span>
                                    </Button>
                                </div>
                            </>
                        ) : null}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-2 md:hidden">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleMobileMenu}
                            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu - Smooth slide animation */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scaleY: 0.8, originY: 0 }}
                        animate={{ opacity: 1, scaleY: 1, originY: 0 }}
                        exit={{ opacity: 0, scaleY: 0.8, originY: 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 origin-top"
                    >

                        <div className="px-4 py-4 space-y-2">
                            {user && (
                                <>
                                    <MobileNavItem
                                        to="/"
                                        icon={Home}
                                        label="Dashboard"
                                        isActive={isActiveLink('/')}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    />
                                    <MobileNavItem
                                        to="/customers"
                                        icon={Users}
                                        label="Customers"
                                        isActive={location.pathname.startsWith('/customers')}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    />
                                    <MobileNavItem
                                        to="/loans"
                                        icon={Banknote}
                                        label="Loans"
                                        isActive={location.pathname.startsWith('/loans')}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    />
                                    <MobileNavItem
                                        to="/payments"
                                        icon={CreditCard}
                                        label="Payments"
                                        isActive={location.pathname.startsWith('/payments')}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    />
                                    <MobileNavItem
                                        to="/invoices"
                                        icon={FileText}
                                        label="Invoices"
                                        isActive={location.pathname.startsWith('/invoices')}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    />

                                    {/* User Info */}
                                    <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                                        <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                                            <div className="flex items-center space-x-3 px-3 py-2 hover:bg-teal-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                                                    {lender?.companyStamp ? (
                                                        <img src={lender.companyStamp} alt="Logo" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-sm font-bold text-white">
                                                            {user.username?.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {user.username}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        View Settings
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                        <Button
                                            variant="danger"
                                            onClick={async () => {
                                                await logoutMutation.mutateAsync();
                                                setIsMobileMenuOpen(false);
                                                navigate('/login');
                                            }}
                                            className="w-full justify-start mt-2"
                                            icon={LogOut}
                                        >
                                            Logout
                                        </Button>
                                    </div>

                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>


    );
};

// Desktop Navigation Item Component - Memoized
const NavItem = memo(({ to, icon: Icon, label, isActive }) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
    >
        <Link
            to={to}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                : 'text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
        >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
        </Link>
    </motion.div>
));

// Mobile Navigation Item Component - No framer-motion
const MobileNavItem = memo(({ to, icon: Icon, label, onClick, isPrimary = false, isActive = false }) => (
    <Link
        to={to}
        onClick={onClick}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 active:scale-95 ${isPrimary
            ? 'bg-gradient-to-r from-teal-600 to-emerald-500 text-white'
            : isActive
                ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-l-2 border-teal-500'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
    >
        <Icon className={`h-4 w-4 ${isActive ? 'text-teal-600 dark:text-teal-400' : ''}`} />
        <span>{label}</span>
    </Link>
));


export default memo(Navbar);
