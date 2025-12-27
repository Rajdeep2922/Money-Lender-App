import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useLoans, useUpdateLoanStatus, useDeleteLoan } from '../../hooks/useLoans';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { TableSkeleton } from '../../components/common/Skeletons';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { formatCurrency, formatDate, formatStatus, getStatusColor } from '../../utils/formatters';

// Smooth staggered animations for both mobile and desktop
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.05
        }
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.25,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    },
};


export const LoanList = () => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, loan: null });
    const deleteLoan = useDeleteLoan();

    const { data, isLoading, error, refetch } = useLoans({ page, limit: 20, status: status || undefined, search });

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setTimeout(() => setIsRefreshing(false), 500);
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

    if (isLoading && !data) return <TableSkeleton columns={8} rows={10} />;
    if (error) return <div className="text-red-500">Error: {error.message}</div>;

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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loans</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage your loan portfolio
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
                    <Link to="/loans/new" className="btn btn-primary">
                        <FiPlus className="w-4 h-4 mr-2" />
                        Create Loan
                    </Link>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by loan number or customer name..."
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
                    <option value="pending_approval">Pending Approval</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="defaulted">Defaulted</option>
                </select>
            </motion.div>

            {/* Loan Table */}
            <motion.div variants={itemVariants} className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Loan #</th>
                            <th>Customer</th>
                            <th>Principal</th>
                            <th>EMI</th>
                            <th>Rate</th>
                            <th>Balance</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loans.map((loan) => (
                            <tr key={loan._id}>
                                <td>
                                    <Link to={`/loans/${loan._id}`} className="text-teal-600 hover:text-teal-700 font-medium">
                                        {loan.loanNumber}
                                    </Link>
                                </td>
                                <td>
                                    {loan.customerId?.firstName} {loan.customerId?.lastName}
                                </td>
                                <td className="font-medium">{formatCurrency(loan.principal)}</td>
                                <td>{formatCurrency(loan.monthlyEMI)}</td>
                                <td>{loan.monthlyInterestRate}%</td>
                                <td className="font-medium">{formatCurrency(loan.remainingBalance)}</td>
                                <td>
                                    <StatusToggle loan={loan} />
                                </td>
                                <td>
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: true, loan })}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                        title="Delete Loan"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {loans.length === 0 && (
                            <tr>
                                <td colSpan={8} className="text-center py-8 text-gray-500">
                                    No loans found. <Link to="/loans/new" className="text-teal-600">Create your first loan</Link>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </motion.div>

            {/* Pagination */}
            {
                pagination.pages > 1 && (
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
                )
            }

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, loan: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Loan"
                message={`Are you sure you want to delete loan ${deleteModal.loan?.loanNumber}? This action cannot be undone and all related data will be removed.`}
                confirmText="Delete Loan"
                cancelText="Cancel"
                type="danger"
                confirmStyle="danger"
                loading={deleteLoan.isPending}
            />
        </motion.div >
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

    // If status is not one of the manual manageable ones, just show badge
    if (!['pending_approval', 'approved', 'active'].includes(loan.status)) {
        return (
            <span className={`badge ${getStatusColor(loan.status)}`}>
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
                    className={`appearance-none cursor-pointer pl-3 pr-7 py-1.5 rounded-lg text-xs font-semibold 
                        border shadow-sm focus:ring-2 focus:ring-offset-1 focus:outline-none transition-all duration-200
                        hover:shadow-md
                        ${loan.status === 'pending_approval'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700'
                            : loan.status === 'approved'
                                ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700'
                                : loan.status === 'active'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700'
                                    : 'bg-gray-100 text-gray-700 border-gray-200 focus:ring-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
                        }`}
                >
                    <option value="pending_approval" className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">⏳ Pending</option>
                    <option value="approved" className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">✅ Approved</option>
                    <option value="active" className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">🟢 Active</option>
                </select>
                {/* Custom Arrow */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className={`w-3.5 h-3.5 transition-colors ${loan.status === 'pending_approval' ? 'text-amber-600 dark:text-amber-400' :
                        loan.status === 'approved' ? 'text-blue-600 dark:text-blue-400' :
                            loan.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' :
                                'text-gray-500 dark:text-gray-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>




            {/* Status Change Confirmation Modal */}
            <ConfirmModal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal({ isOpen: false, newStatus: '' })}
                onConfirm={handleConfirm}
                title="Change Status"
                message={`Are you sure you want to change the status to "${getStatusLabel(statusModal.newStatus)}"?`}
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
