import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiSearch, FiTrash2, FiRefreshCw, FiDollarSign, FiClock, FiUser, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useLoans, useUpdateLoanStatus, useDeleteLoan } from '../../hooks/useLoans';
import { useDebounce } from '../../hooks/useDebounce';
import { TableSkeleton } from '../../components/common/Skeletons';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { InputClear } from '../../components/common/InputClear';
import { formatCurrency, formatDate, formatStatus, getStatusColor } from '../../utils/formatters';

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
    { id: '', label: 'All Loans' },
    { id: 'active', label: 'Active' },
    { id: 'pending_approval', label: 'Pending' },
    { id: 'completed', label: 'Completed' },
    { id: 'defaulted', label: 'Defaulted' },
];

export const LoanList = () => {
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebounce(searchInput, 300);
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, loan: null });
    const deleteLoan = useDeleteLoan();

    // Edge Case Fix: Reset page to 1 whenever search query or status filter changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, status]);

    const { data, isLoading, error, refetch } = useLoans({
        page,
        limit: 20,
        status: status || undefined,
        search: debouncedSearch
    });

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setTimeout(() => setIsRefreshing(false), 400);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.loan) return;
        const toastId = toast.loading('Deleting loan...');
        try {
            await deleteLoan.mutateAsync(deleteModal.loan._id);
            toast.success('Loan deleted successfully', { id: toastId });
            setDeleteModal({ isOpen: false, loan: null });
        } catch (err) {
            toast.error(err.message || 'Failed to delete loan', { id: toastId });
        }
    };

    if (isLoading && !data) return <TableSkeleton columns={8} rows={8} />;
    if (error) return (
        <div className="card p-8 text-center text-red-500 border border-red-200 dark:border-red-900/30">
            <p className="font-medium">Failed to load loans</p>
            <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">{error.message}</p>
            <button onClick={handleRefresh} className="btn btn-secondary btn-sm mt-4">Retry</button>
        </div>
    );

    const { loans = [], pagination = {} } = data || {};

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
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Loans</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Manage your loan portfolio and repayment schedules
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
                    <Link to="/loans/new" className="btn btn-primary h-10 px-4 rounded-xl gap-2 text-sm font-semibold shadow-sm">
                        <FiPlus className="w-4 h-4" />
                        Create Loan
                    </Link>
                </div>
            </motion.div>

            {/* Filters: Search + Segmented Status Tabs */}
            <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <InputClear
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search by loan #, customer name, or email..."
                            className="w-full rounded-xl h-11 text-sm border border-hairline-light dark:border-hairline-dark bg-white dark:bg-surface-elevated shadow-2xs"
                        />
                    </div>
                </div>

                {/* Segmented Status Tabs */}
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

            {/* Desktop Table View (Hidden on mobile < 768px) */}
            <motion.div variants={itemVariants} className="hidden md:block table-container bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl overflow-hidden shadow-sm">
                <table className="table w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-hairline-light dark:border-hairline-dark text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-surface-deep/40">
                            <th className="py-3.5 px-4 font-semibold">Loan #</th>
                            <th className="py-3.5 px-4 font-semibold">Customer</th>
                            <th className="py-3.5 px-4 font-semibold text-right">Principal</th>
                            <th className="py-3.5 px-4 font-semibold text-right">EMI</th>
                            <th className="py-3.5 px-4 font-semibold text-center">Rate</th>
                            <th className="py-3.5 px-4 font-semibold text-right">Balance</th>
                            <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                            <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline-light dark:divide-hairline-dark text-sm">
                        {loans.map((loan) => (
                            <tr
                                key={loan._id}
                                onClick={() => navigate(`/loans/${loan._id}`)}
                                className="cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors group"
                            >
                                <td className="py-3.5 px-4">
                                    <span className="font-semibold text-primary dark:text-primary-bright font-mono text-xs">
                                        {loan.loanNumber}
                                    </span>
                                </td>
                                <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white">
                                    {loan.customerId?.firstName} {loan.customerId?.lastName}
                                </td>
                                <td className="py-3.5 px-4 text-right font-medium text-gray-900 dark:text-white tabular-nums">
                                    {formatCurrency(loan.principal)}
                                </td>
                                <td className="py-3.5 px-4 text-right text-gray-700 dark:text-gray-300 tabular-nums">
                                    {formatCurrency(loan.monthlyEMI)}
                                </td>
                                <td className="py-3.5 px-4 text-center text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                                    {loan.monthlyInterestRate}%
                                </td>
                                <td className="py-3.5 px-4 text-right font-bold text-gray-900 dark:text-white tabular-nums">
                                    {formatCurrency(loan.remainingBalance)}
                                </td>
                                <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                    <StatusToggle loan={loan} />
                                </td>
                                <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: true, loan })}
                                        className="p-1.5 text-gray-400 hover:text-accent-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Delete Loan"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {loans.length === 0 && (
                            <tr>
                                <td colSpan={8} className="text-center py-16">
                                    <div className="max-w-sm mx-auto flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                                            <FiDollarSign className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="font-semibold text-gray-900 dark:text-white">No loans found</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
                                            {searchInput ? 'No loans match your search criteria.' : 'Get started by creating your first loan agreement.'}
                                        </p>
                                        <Link to="/loans/new" className="btn btn-primary btn-sm rounded-xl">
                                            Create First Loan
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </motion.div>

            {/* Mobile Touch-Friendly Card Stream (Visible only on screens < 768px) */}
            <motion.div variants={itemVariants} className="md:hidden space-y-3">
                {loans.map((loan) => (
                    <div
                        key={loan._id}
                        onClick={() => navigate(`/loans/${loan._id}`)}
                        className="card p-4 bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl space-y-3 cursor-pointer active:scale-[0.99] transition-transform"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-xs font-mono font-bold text-primary dark:text-primary-bright">
                                    {loan.loanNumber}
                                </span>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">
                                    {loan.customerId?.firstName} {loan.customerId?.lastName}
                                </h3>
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                                <StatusToggle loan={loan} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-hairline-light dark:border-hairline-dark text-xs">
                            <div>
                                <span className="text-gray-400 dark:text-gray-500">Principal</span>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                                    {formatCurrency(loan.principal)}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-gray-400 dark:text-gray-500">Remaining Balance</span>
                                <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                                    {formatCurrency(loan.remainingBalance)}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-400 dark:text-gray-500">Monthly EMI</span>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 tabular-nums">
                                    {formatCurrency(loan.monthlyEMI)}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-gray-400 dark:text-gray-500">Tenure</span>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {loan.loanDurationMonths} mos @ {loan.monthlyInterestRate}%
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-hairline-light dark:border-hairline-dark text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                                <FiClock className="w-3.5 h-3.5" />
                                {loan.startDate ? formatDate(loan.startDate) : 'N/A'}
                            </span>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => setDeleteModal({ isOpen: true, loan })}
                                    className="p-1.5 text-gray-400 hover:text-accent-danger rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                                <span className="text-primary dark:text-primary-bright font-medium flex items-center">
                                    Details <FiChevronRight className="w-3.5 h-3.5 ml-0.5" />
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {loans.length === 0 && (
                    <div className="card p-8 text-center bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                            <FiDollarSign className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">No loans found</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
                            {searchInput ? 'No loans match your search criteria.' : 'Get started by creating your first loan agreement.'}
                        </p>
                        <Link to="/loans/new" className="btn btn-primary btn-sm rounded-xl">
                            Create First Loan
                        </Link>
                    </div>
                )}
            </motion.div>

            {/* Pagination Controls */}
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
                onClose={() => setDeleteModal({ isOpen: false, loan: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Loan"
                message={`Are you sure you want to delete loan ${deleteModal.loan?.loanNumber}? This action cannot be undone and will permanently remove this record.`}
                confirmText="Delete Loan"
                cancelText="Cancel"
                type="danger"
                confirmStyle="danger"
                loading={deleteLoan.isPending}
            />
        </motion.div>
    );
};

const StatusToggle = ({ loan }) => {
    const updateLoanStatus = useUpdateLoanStatus();
    const [statusModal, setStatusModal] = useState({ isOpen: false, newStatus: '' });

    const handleChange = async (e) => {
        const newStatus = e.target.value;
        const currentStatus = loan.status;

        if (newStatus === currentStatus) return;

        // Prevent reverting if payments exist
        if (newStatus === 'pending_approval' && loan.paymentsReceived > 0) {
            toast.error('Cannot revert to Pending: Payments have already been recorded.');
            return;
        }

        setStatusModal({ isOpen: true, newStatus });
    };

    const handleConfirm = async () => {
        try {
            await updateLoanStatus.mutateAsync({ id: loan._id, status: statusModal.newStatus });
            toast.success('Status updated successfully');
            setStatusModal({ isOpen: false, newStatus: '' });
        } catch (error) {
            toast.error(`Failed to update status: ${error.message}`);
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending_approval: 'Pending',
            approved: 'Approved',
            active: 'Active',
        };
        return labels[status] || status.replace('_', ' ').toUpperCase();
    };

    if (!['pending_approval', 'approved', 'active'].includes(loan.status)) {
        return (
            <span className={`badge ${getStatusColor(loan.status)} text-xs px-2.5 py-0.5 rounded-full font-medium`}>
                {formatStatus(loan.status)}
            </span>
        );
    }

    return (
        <>
            <div className="relative inline-block">
                <select
                    value={loan.status}
                    onChange={handleChange}
                    className={`appearance-none cursor-pointer pl-2.5 pr-6 py-1 rounded-lg text-xs font-semibold 
                        border shadow-sm focus:outline-none transition-all duration-200
                        ${loan.status === 'pending_approval'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
                            : loan.status === 'approved'
                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
                        }`}
                >
                    <option value="pending_approval" className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">⏳ Pending</option>
                    <option value="approved" className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">✅ Approved</option>
                    <option value="active" className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">🟢 Active</option>
                </select>
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            <ConfirmModal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal({ isOpen: false, newStatus: '' })}
                onConfirm={handleConfirm}
                title="Change Loan Status"
                message={`Are you sure you want to change the status of loan ${loan.loanNumber} to "${getStatusLabel(statusModal.newStatus)}"?`}
                confirmText="Update Status"
                cancelText="Cancel"
                type="question"
                confirmStyle="primary"
                loading={updateLoanStatus.isPending}
            />
        </>
    );
};

export default LoanList;
