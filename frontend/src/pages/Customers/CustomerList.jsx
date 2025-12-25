import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiPhone, FiMail, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useCustomers, useDeleteCustomer } from '../../hooks/useCustomers';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { TableSkeleton } from '../../components/common/Skeletons';
import { formatPhone, formatDate } from '../../utils/formatters';

// Mobile detection for reduced animations
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

const containerVariants = isMobile ? {
    hidden: { opacity: 1 },
    visible: { opacity: 1 },
} : {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = isMobile ? {
    hidden: { opacity: 1 },
    visible: { opacity: 1 },
} : {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
};

export const CustomerList = () => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const deleteCustomer = useDeleteCustomer();

    const { data, isLoading, error, isFetching, refetch } = useCustomers({ page, limit: 20, search, status: status || undefined });

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    // Only show full page loader on initial load, not during search/filter
    if (isLoading && !data) return <TableSkeleton columns={4} rows={10} />;
    if (error) return <div className="text-red-500">Error: {error.message}</div>;

    const { customers = [], pagination = {} } = data || {};

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage your borrowers
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleRefresh}
                        className="btn btn-secondary"
                        disabled={isRefreshing}
                        title="Refresh List"
                    >
                        <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <Link to="/customers/new" className="btn btn-primary">
                        <FiPlus className="w-4 h-4 mr-2" />
                        Add Customer
                    </Link>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input pl-10"
                    />
                </div>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="input sm:w-48"
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </motion.div>

            {/* Customer List */}
            <motion.div variants={itemVariants} className="card">
                {customers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No customers found.{' '}
                        <Link to="/customers/new" className="text-teal-600">Add your first customer</Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {customers.map((customer) => (
                            <div
                                key={customer._id}
                                className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative group"
                            >
                                <Link
                                    to={`/customers/${customer._id}`}
                                    className="absolute inset-0 z-0"
                                />
                                <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-semibold z-10 relative pointer-events-none">
                                    {customer.firstName?.[0]}{customer.lastName?.[0]}
                                </div>
                                <div className="flex-1 min-w-0 z-10 relative pointer-events-none">
                                    <p className="font-medium text-gray-900 dark:text-white truncate">
                                        {customer.firstName} {customer.lastName}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <FiMail className="w-3 h-3" />
                                            {customer.email}
                                        </span>
                                        <span className="flex items-center gap-1 hidden sm:flex">
                                            <FiPhone className="w-3 h-3" />
                                            {formatPhone(customer.phone)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 z-10 relative">
                                    <span className={`badge ${customer.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                                        {customer.status}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            Swal.fire({
                                                title: 'Are you sure?',
                                                text: "You won't be able to revert this!",
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonColor: '#ef4444',
                                                cancelButtonColor: '#3b82f6',
                                                confirmButtonText: 'Yes, delete it!'
                                            }).then((result) => {
                                                if (result.isConfirmed) {
                                                    const toastId = toast.loading('Deleting customer...');
                                                    deleteCustomer.mutate(customer._id, {
                                                        onSuccess: () => {
                                                            toast.success('Customer deleted successfully', { id: toastId });
                                                        },
                                                        onError: (err) => {
                                                            toast.error(err.message || 'Failed to delete customer', { id: toastId });
                                                        }
                                                    });
                                                }
                                            });
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                        title="Delete Customer"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <motion.div variants={itemVariants} className="flex justify-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="btn btn-secondary btn-sm"
                    >
                        Previous
                    </button>
                    <span className="flex items-center px-4 text-gray-600 dark:text-gray-400">
                        Page {page} of {pagination.pages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                        disabled={page === pagination.pages}
                        className="btn btn-secondary btn-sm"
                    >
                        Next
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
};

export default CustomerList;
