import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useLoans, useUpdateLoanStatus, useDeleteLoan } from '../../hooks/useLoans';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { TableSkeleton } from '../../components/common/Skeletons';
import { formatCurrency, formatDate, formatStatus, getStatusColor } from '../../utils/formatters';

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

export const LoanList = () => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const deleteLoan = useDeleteLoan();

    const { data, isLoading, error, refetch } = useLoans({ page, limit: 20, status: status || undefined, search });

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setTimeout(() => setIsRefreshing(false), 500);
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
                                        onClick={() => {
                                            Swal.fire({
                                                title: 'Are you sure?',
                                                text: "This action cannot be undone. All related data will be removed.",
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonColor: '#ef4444',
                                                cancelButtonColor: '#3b82f6',
                                                confirmButtonText: 'Yes, delete loan!'
                                            }).then((result) => {
                                                if (result.isConfirmed) {
                                                    const toastId = toast.loading('Deleting loan...');
                                                    deleteLoan.mutate(loan._id, {
                                                        onSuccess: () => {
                                                            toast.success('Loan deleted successfully', { id: toastId });
                                                        },
                                                        onError: (err) => {
                                                            toast.error(err.message || 'Failed to delete loan', { id: toastId });
                                                        }
                                                    });
                                                }
                                            });
                                        }}
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
        </motion.div >
    );
};

const StatusToggle = ({ loan }) => {
    const updateLoanStatus = useUpdateLoanStatus();

    const handleChange = async (e) => {
        const newStatus = e.target.value;
        const currentStatus = loan.status;

        if (newStatus === currentStatus) return;

        // Prevent reverting if payments exist
        if (newStatus === 'pending_approval' && loan.paymentsReceived > 0) {
            alert('Cannot revert to Pending: Payments have already been recorded.');
            return;
        }

        Swal.fire({
            title: 'Confirm Status Change',
            text: `Change status to ${newStatus.replace('_', ' ').toUpperCase()}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, update it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await updateLoanStatus.mutateAsync({ id: loan._id, status: newStatus });
                } catch (error) {
                    toast.error(`Failed to update status: ${error.message}`);
                }
            }
        });
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
        <div className="relative inline-block">
            <select
                value={loan.status}
                onChange={handleChange}
                className={`appearance-none cursor-pointer pl-3 pr-8 py-1 rounded-full text-xs font-semibold border-none focus:ring-2 focus:ring-offset-1 focus:outline-none transition-colors ${loan.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                    loan.status === 'approved' ? 'bg-teal-50 text-teal-700' :
                        loan.status === 'active' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                    }`}
            >
                <option value="pending_approval">Pending</option>
                <option value="approved">Approved</option>
                <option value="active">Active</option>
            </select>
            {/* Custom Arrow */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className={`w-3 h-3 ${loan.status === 'pending_approval' ? 'text-yellow-800' :
                    loan.status === 'approved' ? 'text-teal-700' :
                        loan.status === 'active' ? 'text-green-800' :
                            'text-gray-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    );
};

export default LoanList;
