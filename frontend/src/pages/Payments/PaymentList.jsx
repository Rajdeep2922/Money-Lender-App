import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiCalendar, FiDownload, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { usePayments, useDownloadReceipt, useDeletePayment } from '../../hooks/usePayments';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { TableSkeleton } from '../../components/common/Skeletons';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { formatCurrency, formatDate } from '../../utils/formatters';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
};

export const PaymentList = () => {
    const [search, setSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, payment: null });
    const downloadReceipt = useDownloadReceipt();
    const deletePayment = useDeletePayment();

    const { data, isLoading, error } = usePayments({
        page,
        limit: 20,
        search,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined
    });

    const handleDeleteConfirm = async () => {
        if (!deleteModal.payment) return;
        const toastId = toast.loading('Deleting payment...');
        try {
            await deletePayment.mutateAsync(deleteModal.payment._id);
            toast.success('Payment deleted successfully', { id: toastId });
            setDeleteModal({ isOpen: false, payment: null });
        } catch (err) {
            toast.error(err.message || 'Failed to delete payment', { id: toastId });
        }
    };

    if (isLoading && !data) return <TableSkeleton columns={7} rows={10} />;
    if (error) return <div className="text-red-500 text-center p-8">Error: {error.message}</div>;

    const { payments = [], pagination = {} } = data || {};

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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Track all EMI payments</p>
                </div>
                <div className="flex gap-2">
                    <Link to="/payments/new" className="btn btn-primary">
                        <FiPlus className="w-4 h-4 mr-2" />
                        Record Payment
                    </Link>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2 relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Ref ID, Loan #, or Customer..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input pl-10"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">From Date</label>
                    <div className="relative">
                        <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="input pl-10 text-sm"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">To Date</label>
                    <div className="relative">
                        <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="input pl-10 text-sm"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Payments Table */}
            <motion.div variants={itemVariants} className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Reference</th>
                            <th>Loan #</th>
                            <th>Customer</th>
                            <th className="text-right">Amount</th>
                            <th className="text-center">Method</th>
                            <th className="text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {payments.map((payment) => (
                            <tr key={payment._id}>
                                <td className="whitespace-nowrap">{formatDate(payment.paymentDate)}</td>
                                <td className="text-xs font-mono text-gray-500">{payment.referenceId || '-'}</td>
                                <td>
                                    <Link to={`/loans/${payment.loanId?._id}`} className="text-teal-600 hover:text-teal-700 font-medium">
                                        {payment.loanId?.loanNumber}
                                    </Link>
                                </td>
                                <td className="whitespace-nowrap">{payment.customerId?.firstName} {payment.customerId?.lastName}</td>
                                <td className="text-right font-bold text-teal-600">
                                    {formatCurrency(payment.amountPaid)}
                                </td>
                                <td className="text-center">
                                    <span className="badge badge-secondary capitalize">
                                        {payment.paymentMethod?.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <button
                                        onClick={() => downloadReceipt.mutate(payment._id)}
                                        disabled={downloadReceipt.isPending}
                                        className="text-teal-600 hover:text-teal-700 p-1 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors inline-flex items-center gap-1 mr-2"
                                        title="Download Receipt"
                                    >
                                        <FiDownload className="w-4 h-4" />
                                        <span className="text-xs font-medium">Receipt</span>
                                    </button>
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: true, payment })}
                                        className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-1"
                                        title="Delete Payment"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {payments.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <p>No payments found matching your filters.</p>
                                        <Link to="/payments/new" className="text-teal-600 font-medium hover:underline">
                                            Record a new payment
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
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
                    <span className="flex items-center px-4 text-gray-600 dark:text-gray-400 text-sm">
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

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, payment: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Payment"
                message="This will revert the loan balance. Are you sure you want to delete this payment? This action cannot be undone."
                confirmText="Delete Payment"
                cancelText="Cancel"
                type="warning"
                confirmStyle="danger"
                loading={deletePayment.isPending}
            />
        </motion.div>
    );
};

export default PaymentList;
