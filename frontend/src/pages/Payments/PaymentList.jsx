import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiCalendar, FiDownload, FiTrash2, FiCreditCard, FiArrowUpRight, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { usePayments, useDownloadReceipt, useDeletePayment } from '../../hooks/usePayments';
import { useDebounce } from '../../hooks/useDebounce';
import { TableSkeleton } from '../../components/common/Skeletons';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { InputClear } from '../../components/common/InputClear';
import { formatCurrency, formatDate } from '../../utils/formatters';

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

export const PaymentList = () => {
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebounce(searchInput, 300);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, payment: null });
    const downloadReceipt = useDownloadReceipt();
    const deletePayment = useDeletePayment();

    // Edge Case Fix: Reset page to 1 whenever search query or date range filters change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, dateFrom, dateTo]);

    const { data, isLoading, error } = usePayments({
        page,
        limit: 20,
        search: debouncedSearch,
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

    if (isLoading && !data) return <TableSkeleton columns={7} rows={8} />;
    if (error) return (
        <div className="card p-8 text-center text-red-500 border border-red-200 dark:border-red-900/30">
            <p className="font-medium">Failed to load payments</p>
            <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">{error.message}</p>
        </div>
    );

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
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Payments</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Track EMI collections, download receipts, and view payment histories
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link to="/payments/new" className="btn btn-primary h-10 px-4 rounded-xl gap-2 text-sm font-semibold shadow-sm">
                        <FiPlus className="w-4 h-4" />
                        Record Payment
                    </Link>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                <div className="sm:col-span-2">
                    <InputClear
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search by Ref ID, Loan #, or Customer..."
                        className="w-full rounded-xl h-11 text-sm bg-white dark:bg-[#141722] text-[#0c0d12] dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">From Date</label>
                    <div className="relative">
                        <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="input pl-9 rounded-xl h-11 text-xs border-hairline-light dark:border-hairline-dark bg-white dark:bg-surface-elevated"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">To Date</label>
                    <div className="relative">
                        <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="input pl-9 rounded-xl h-11 text-xs border-hairline-light dark:border-hairline-dark bg-white dark:bg-surface-elevated"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Desktop Table View (Hidden on mobile < 768px) */}
            <motion.div variants={itemVariants} className="hidden md:block table-container bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl overflow-hidden shadow-sm">
                <table className="table w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-hairline-light dark:border-hairline-dark text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-surface-deep/40">
                            <th className="py-3.5 px-4 font-semibold">Date</th>
                            <th className="py-3.5 px-4 font-semibold">Reference</th>
                            <th className="py-3.5 px-4 font-semibold">Loan #</th>
                            <th className="py-3.5 px-4 font-semibold">Customer</th>
                            <th className="py-3.5 px-4 font-semibold text-right">Amount</th>
                            <th className="py-3.5 px-4 font-semibold text-center">Method</th>
                            <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline-light dark:divide-hairline-dark text-sm">
                        {payments.map((payment) => (
                            <tr key={payment._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 active:scale-[0.998] transition-all duration-150">
                                <td className="py-3.5 px-4 text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                    {formatDate(payment.paymentDate)}
                                </td>
                                <td className="py-3.5 px-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                                    {payment.referenceId || '—'}
                                </td>
                                <td className="py-3.5 px-4">
                                    <Link to={`/loans/${payment.loanId?._id}`} className="font-mono text-xs font-semibold text-primary dark:text-primary-bright hover:underline">
                                        {payment.loanId?.loanNumber}
                                    </Link>
                                </td>
                                <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                    {payment.customerId?.firstName} {payment.customerId?.lastName}
                                </td>
                                <td className="py-3.5 px-4 text-right font-bold text-accent-teal dark:text-accent-teal tabular-nums">
                                    {formatCurrency(payment.amountPaid)}
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 capitalize">
                                        {payment.paymentMethod?.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                    <button
                                        onClick={() => downloadReceipt.mutate(payment._id)}
                                        disabled={downloadReceipt.isPending}
                                        className="btn btn-secondary btn-sm rounded-lg text-xs py-1 px-2.5 gap-1.5 mr-2"
                                        title="Download Receipt PDF"
                                    >
                                        <FiDownload className="w-3.5 h-3.5" />
                                        Receipt
                                    </button>
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: true, payment })}
                                        className="p-1.5 text-gray-400 hover:text-accent-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Delete Payment"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {payments.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-16">
                                    <div className="max-w-sm mx-auto flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                                            <FiCreditCard className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="font-semibold text-gray-900 dark:text-white">No payments found</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
                                            {searchInput || dateFrom || dateTo ? 'No payments match your date or search filters.' : 'Record your first EMI payment to build history.'}
                                        </p>
                                        <Link to="/payments/new" className="btn btn-primary btn-sm rounded-xl">
                                            Record First Payment
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
                {payments.map((payment) => (
                    <div
                        key={payment._id}
                        className="card p-4 bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl space-y-3"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-xs font-mono font-bold text-primary dark:text-primary-bright">
                                    {payment.loanId?.loanNumber}
                                </span>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">
                                    {payment.customerId?.firstName} {payment.customerId?.lastName}
                                </h3>
                            </div>
                            <span className="text-base font-bold text-accent-teal tabular-nums">
                                {formatCurrency(payment.amountPaid)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-hairline-light dark:border-hairline-dark">
                            <span className="flex items-center gap-1">
                                <FiClock className="w-3.5 h-3.5" />
                                {formatDate(payment.paymentDate)}
                            </span>
                            <span className="capitalize font-medium">
                                {payment.paymentMethod?.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-hairline-light dark:border-hairline-dark">
                            <span className="text-[11px] font-mono text-gray-400 truncate max-w-[140px]">
                                {payment.referenceId || 'No Ref'}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => downloadReceipt.mutate(payment._id)}
                                    disabled={downloadReceipt.isPending}
                                    className="btn btn-secondary btn-sm py-1 px-2.5 rounded-lg text-xs gap-1"
                                >
                                    <FiDownload className="w-3.5 h-3.5" />
                                    Receipt
                                </button>
                                <button
                                    onClick={() => setDeleteModal({ isOpen: true, payment })}
                                    className="p-1.5 text-gray-400 hover:text-accent-danger rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {payments.length === 0 && (
                    <div className="card p-8 text-center bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                            <FiCreditCard className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">No payments found</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
                            {searchInput || dateFrom || dateTo ? 'No payments match your date or search filters.' : 'Record your first EMI payment to build history.'}
                        </p>
                        <Link to="/payments/new" className="btn btn-primary btn-sm rounded-xl">
                            Record First Payment
                        </Link>
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
                onClose={() => setDeleteModal({ isOpen: false, payment: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Payment"
                message="Deleting this payment will automatically restore the loan balance. Are you sure you want to proceed?"
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
