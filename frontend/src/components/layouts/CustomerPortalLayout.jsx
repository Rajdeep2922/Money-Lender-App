import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { FiHome, FiLogOut, FiCreditCard, FiSearch, FiFileText } from 'react-icons/fi';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import NotificationBadge from '../notifications/NotificationBadge';
import ThemeToggle from '../common/ThemeToggle';

/**
 * Customer Portal Layout - Mobile Optimized & Themed
 */
const CustomerPortalLayout = () => {
    const { isAuthenticated, role, user } = useAuthStore();
    const location = useLocation();
    const { unreadChats } = useNotificationStore();
    const totalUnreadChats = Object.values(unreadChats).reduce((s, n) => s + n, 0);

    if (!isAuthenticated) {
        return <Navigate to="/customer-login" replace />;
    }

    if (role !== 'customer') {
        return <Navigate to="/" replace />;
    }

    const customerName = user?.firstName || user?.fullName || user?.email?.split('@')[0] || 'Customer';

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const handleLogout = () => {
        useAuthStore.getState().logout();
        window.location.href = '/customer-login';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-canvas-dark pb-16 sm:pb-0 transition-colors duration-200">
            {/* Header */}
            <header className="bg-white dark:bg-surface-elevated shadow-sm border-b border-hairline-light dark:border-hairline-dark sticky top-0 z-40">
                <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="flex justify-between items-center h-14 sm:h-16">
                        {/* Logo */}
                        <Link to="/portal" className="flex items-center space-x-2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary-bright rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm">
                                <span className="text-white font-bold text-sm sm:text-base">CP</span>
                            </div>
                            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                                Portal
                            </span>
                        </Link>

                        {/* Desktop: Theme + User info + Logout */}
                        <div className="hidden sm:flex items-center gap-3">
                            <ThemeToggle />
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium ml-2">
                                {customerName}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="btn btn-secondary text-sm ml-1"
                            >
                                Logout
                            </button>
                        </div>

                        {/* Mobile: Theme + Name */}
                        <div className="sm:hidden flex items-center gap-2">
                            <ThemeToggle />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate max-w-[100px]">
                                {customerName}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Desktop Sub-nav tabs */}
            <div className="hidden sm:block border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-14 sm:top-16 z-30">
                <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="flex gap-0 overflow-x-auto">
                        {[
                            { to: '/portal', label: '🏠 Home', exact: true },
                            { to: '/portal/lenders', label: '🏦 Find Lenders' },
                            { to: '/portal/loan-requests', label: '📋 My Requests', badge: totalUnreadChats },
                            { to: '/portal/payments', label: '💳 Payments' },
                        ].map(({ to, label, exact, badge }) => {
                            const active = exact
                                ? location.pathname === to
                                : location.pathname.startsWith(to + '/') || location.pathname === to;
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                        active
                                            ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    {label}
                                    {badge > 0 && (
                                        <NotificationBadge count={badge} />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto">
                <Outlet />
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
                <div className="flex justify-around items-center h-16">
                    <Link
                        to="/portal"
                        className={`flex flex-col items-center justify-center flex-1 h-full ${isActive('/portal') && location.pathname === '/portal' ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        <FiHome className="w-6 h-6" />
                        <span className="text-xs mt-1">Home</span>
                    </Link>
                    <Link
                        to="/portal/lenders"
                        className={`flex flex-col items-center justify-center flex-1 h-full ${isActive('/portal/lenders') ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        <FiSearch className="w-6 h-6" />
                        <span className="text-xs mt-1">Lenders</span>
                    </Link>
                    <Link
                        to="/portal/loan-requests"
                        className={`relative flex flex-col items-center justify-center flex-1 h-full ${isActive('/portal/loan-requests') ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        <FiFileText className="w-6 h-6" />
                        <span className="text-xs mt-1">Requests</span>
                        {totalUnreadChats > 0 && (
                            <NotificationBadge count={totalUnreadChats} className="absolute top-1 right-3" />
                        )}
                    </Link>
                    <Link
                        to="/portal/payments"
                        className={`flex flex-col items-center justify-center flex-1 h-full ${isActive('/portal/payments') ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        <FiCreditCard className="w-6 h-6" />
                        <span className="text-xs mt-1">Payments</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex flex-col items-center justify-center flex-1 h-full text-gray-500 dark:text-gray-400"
                    >
                        <FiLogOut className="w-6 h-6" />
                        <span className="text-xs mt-1">Logout</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};


export default CustomerPortalLayout;
