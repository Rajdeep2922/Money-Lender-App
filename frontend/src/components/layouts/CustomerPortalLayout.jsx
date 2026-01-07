import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { FiHome, FiLogOut, FiCreditCard } from 'react-icons/fi';
import useAuthStore from '../../store/authStore';

/**
 * Customer Portal Layout - Mobile Optimized
 */
const CustomerPortalLayout = () => {
    const { isAuthenticated, role, user } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (role !== 'customer') {
        return <Navigate to="/" replace />;
    }

    const customerName = user?.firstName || user?.fullName || user?.email?.split('@')[0] || 'Customer';

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 sm:pb-0">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
                <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="flex justify-between items-center h-14 sm:h-16">
                        {/* Logo */}
                        <Link to="/portal" className="flex items-center space-x-2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-sm sm:text-base">CP</span>
                            </div>
                            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                                Portal
                            </span>
                        </Link>

                        {/* Desktop: User info + Logout */}
                        <div className="hidden sm:flex items-center gap-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Welcome, {customerName}
                            </span>
                            <button
                                onClick={() => {
                                    useAuthStore.getState().logout();
                                    window.location.href = '/login';
                                }}
                                className="btn btn-secondary text-sm"
                            >
                                Logout
                            </button>
                        </div>

                        {/* Mobile: Just name */}
                        <span className="sm:hidden text-sm text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
                            Hi, {customerName}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto">
                <Outlet />
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
                <div className="flex justify-around items-center h-16">
                    <Link
                        to="/portal"
                        className={`flex flex-col items-center justify-center flex-1 h-full ${isActive('/portal') ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'
                            }`}
                    >
                        <FiHome className="w-6 h-6" />
                        <span className="text-xs mt-1">Home</span>
                    </Link>
                    <Link
                        to="/portal/payments"
                        className={`flex flex-col items-center justify-center flex-1 h-full ${isActive('/portal/payments') ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'
                            }`}
                    >
                        <FiCreditCard className="w-6 h-6" />
                        <span className="text-xs mt-1">Payments</span>
                    </Link>
                    <button
                        onClick={() => {
                            useAuthStore.getState().logout();
                            window.location.href = '/login';
                        }}
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
