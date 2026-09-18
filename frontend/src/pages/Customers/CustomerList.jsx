import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiPhone, FiMail, FiTrash2, FiRefreshCw, FiUser, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCustomers, useDeleteCustomer } from '../../hooks/useCustomers';
import { useDebounce } from '../../hooks/useDebounce';
import { TableSkeleton } from '../../components/common/Skeletons';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { InputClear } from '../../components/common/InputClear';
import { formatPhone } from '../../utils/formatters';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.04
        }
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.22,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    },
};

const STATUS_TABS = [
    { id: '', label: 'All Borrowers' },
    { id: 'active', label: 'Active' },
    { id: 'inactive', label: 'Inactive' },
];

export const CustomerList = () => {
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebounce(searchInput, 300);
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, customer: null });
    const deleteCustomer = useDeleteCustomer();

    // Edge Case Fix: Reset page to 1 whenever search query or status filter changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, status]);

    const { data, isLoading, error, refetch } = useCustomers({
        page,
        limit: 20,
        search: debouncedSearch,
        status: status || undefined
    });

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setTimeout(() => setIsRefreshing(false), 400);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.customer) return;
        const toastId = toast.loading('Deleting customer...');
        try {
            await deleteCustomer.mutateAsync(deleteModal.customer._id);
            toast.success('Customer deleted successfully', { id: toastId });
            setDeleteModal({ isOpen: false, customer: null });
        } catch (err) {
            toast.error(err.message || 'Failed to delete customer', { id: toastId });
        }
    };

    if (isLoading && !data) return <TableSkeleton columns={4} rows={8} />;
    if (error) return (
        <div className="card p-8 text-center text-red-500 border border-red-200 dark:border-red-900/30">
            <p className="font-medium">Failed to load customers</p>
            <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">{error.message}</p>
            <button onClick={handleRefresh} className="btn btn-secondary btn-sm mt-4">Retry</button>
        </div>
    );

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
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Customers</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Manage your borrower database, contact info, and loan histories
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        className="btn btn-secondary h-10 w-10 !p-0 flex items-center justify-center rounded-xl"
                        disabled={isRefreshing}
                        title="Refresh List"
                    >
                        <FiRefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-300 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <Link to="/customers/new" className="btn btn-primary h-10 px-4 rounded-xl gap-2 text-sm font-semibold shadow-sm">
                        <FiPlus className="w-4 h-4" />
                        Add Customer
                    </Link>
                </div>
            </motion.div>

            {/* Filters: Search + Status Tabs */}
            <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex-1">
                    <InputClear
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search by name, email, or phone number..."
                        className="w-full rounded-xl h-11 text-sm border border-hairline-light dark:border-hairline-dark bg-white dark:bg-surface-elevated shadow-2xs"
                    />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {STATUS_TABS.map((tab) => {
                        const isActive = status === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setStatus(tab.id)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                                    isActive
                                        ? 'bg-primary text-white shadow-sm font-semibold'
                                        : 'bg-white dark:bg-surface-elevated text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-hairline-light dark:border-hairline-dark'
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Customer List Container */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl overflow-hidden shadow-sm">
                {customers.length === 0 ? (
                    <div className="p-16 text-center max-w-sm mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                            <FiUser className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">No customers found</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
                            {searchInput ? 'No borrowers match your search query.' : 'Add your first customer to start issuing loans.'}
                        </p>
                        <Link to="/customers/new" className="btn btn-primary btn-sm rounded-xl">
                            Add First Customer
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-hairline-light dark:divide-hairline-dark">
                        {customers.map((customer) => (
                            <div
                                key={customer._id}
                                onClick={() => navigate(`/customers/${customer._id}`)}
                                className="p-4 sm:p-5 flex items-center gap-4 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                            >
                                {/* Avatar */}
                                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary dark:text-primary-bright flex items-center justify-center font-bold text-sm tracking-tight flex-shrink-0 border border-primary/20">
                                    {customer.firstName?.[0]?.toUpperCase()}{customer.lastName?.[0]?.toUpperCase()}
                                </div>

                                {/* Main info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-base group-hover:text-primary dark:group-hover:text-primary-bright transition-colors truncate">
                                            {customer.firstName} {customer.lastName}
                                        </h3>
                                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                                            customer.status === 'active'
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                        }`}>
                                            {customer.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1.5 truncate">
                                            <FiMail className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                                            {customer.email}
                                        </span>
                                        {customer.phone && (
                                            <span className="flex items-center gap-1.5">
                                                <FiPhone className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                                                {formatPhone(customer.phone)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: true, customer })}
                                        className="p-2 text-gray-400 hover:text-accent-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                        title="Delete Customer"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/customers/${customer._id}`)}
                                        className="p-2 text-gray-400 group-hover:text-primary transition-colors hidden sm:block"
                                        title="View Details"
                                    >
                                        <FiChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <motion.div variants={itemVariants} className="flex justify-center items-center gap-2 pt-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="btn btn-secondary btn-sm rounded-xl text-xs"
                    >
                        Previous
                    </button>
                    <span className="text-xs font-medium px-3 text-gray-600 dark:text-gray-400 tabular-nums">
                        Page {page} of {pagination.pages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                        disabled={page === pagination.pages}
                        className="btn btn-secondary btn-sm rounded-xl text-xs"
                    >
                        Next
                    </button>
                </motion.div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, customer: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Customer"
                message={`Are you sure you want to delete ${deleteModal.customer?.firstName} ${deleteModal.customer?.lastName}? This will permanently remove their records.`}
                confirmText="Delete Customer"
                cancelText="Cancel"
                type="danger"
                confirmStyle="danger"
                loading={deleteCustomer.isPending}
            />
        </motion.div>
    );
};

export default CustomerList;
