import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiDownload, FiRefreshCw, FiAlertCircle, FiCheckCircle, FiClock, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useInvoices, useGenerateInvoices, useDownloadInvoice, useDeleteInvoice, invoiceKeys } from '../../hooks/useInvoices';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { TableSkeleton, CardSkeleton } from '../../components/common/Skeletons';
import { ConfirmModal } from '../../components/common/ConfirmModal';

// Defined outside component to prevent recreation on every render (matches PaymentList pattern)
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.05,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.25,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

const InvoiceList = () => {
    const queryClient = useQueryClient();
    const { data, isLoading, error } = useInvoices();
    const generateInvoices = useGenerateInvoices();
    const downloadInvoice = useDownloadInvoice();
    const deleteInvoice = useDeleteInvoice();
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, invoice: null });

    const handleGenerate = async () => {
        const toastId = toast.loading('Generating invoices...');
        try {
            const result = await generateInvoices.mutateAsync();
            toast.success(`Successfully generated ${result.data.count} new invoices!`, { id: toastId });
            queryClient.removeQueries({ queryKey: invoiceKeys.all });
            queryClient.refetchQueries({ queryKey: invoiceKeys.all, type: 'all' });
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Generation failed';
            toast.error(errorMessage, { id: toastId });
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.invoice) return;
        const toastId = toast.loading('Deleting invoice...');
        try {
            await deleteInvoice.mutateAsync(deleteModal.invoice._id);
            toast.success('Invoice deleted successfully', { id: toastId });
            setDeleteModal({ isOpen: false, invoice: null });
        } catch (err) {
            toast.error(err.message || 'Failed to delete invoice', { id: toastId });
        }
    };

    // Only show skeleton on true first load (no cached data) — matches PaymentList pattern
    if (isLoading && !data) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                </div>
                <div className="md:hidden">
                    <CardSkeleton count={3} />
                </div>
                <div className="hidden md:block">
                    <TableSkeleton columns={7} rows={5} />
                </div>
            </div>
        );
    }

    if (error) return <div className="text-red-500 text-center p-8">Error: {error.message}</div>;

    // Filter to show ONLY paid/partial invoices (Receipts)
    const invoices = (data?.invoices || []).filter(inv => inv.amountPaid > 0 || inv.status === 'paid');

    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid': return <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
            case 'overdue': return <FiAlertCircle className="w-3.5 h-3.5 text-red-500" />;
            default: return <FiClock className="w-3.5 h-3.5 text-amber-500" />;
        }
    };

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
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Billing &amp; Invoices</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage monthly EMI billing and receipts for your customers</p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={generateInvoices.isPending}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs tracking-tight text-white bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm w-full sm:w-auto disabled:opacity-50"
                >
                    <FiRefreshCw className={`w-3.5 h-3.5 ${generateInvoices.isPending ? 'animate-spin' : ''}`} />
                    {generateInvoices.isPending ? 'Generating...' : 'Generate Monthly Invoices'}
                </button>
            </motion.div>

            {/* Mobile View (Cards) */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-3 md:hidden">
                {invoices.map((invoice) => (
                    <div key={invoice._id} className="bg-white dark:bg-surface-elevated border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-4 space-y-3 shadow-xs">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-mono text-xs font-semibold text-primary dark:text-primary-bright">{invoice.invoiceNumber}</p>
                                <p className="font-medium text-gray-900 dark:text-white text-sm mt-0.5">
                                    {invoice.customerId?.firstName} {invoice.customerId?.lastName}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                                <span className="font-semibold text-gray-900 dark:text-white tabular-nums text-sm">
                                    {formatCurrency(invoice.amountDue)}
                                </span>
                                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                    invoice.status === 'paid'
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                        : invoice.status === 'overdue'
                                        ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                }`}>
                                    {getStatusIcon(invoice.status)}
                                    {invoice.status}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-xs pt-3 border-t border-black/[0.04] dark:border-white/[0.06]">
                            <div className="text-gray-500 dark:text-gray-400">
                                <p>Loan: <span className="font-mono">{invoice.loanId?.loanNumber}</span></p>
                                <p className={`mt-0.5 ${new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' ? 'text-red-500 font-medium' : ''}`}>
                                    Due: {formatDate(invoice.dueDate)}
                                </p>
                            </div>
                            <div className="flex gap-1.5">
                                <button
                                    onClick={() => downloadInvoice.mutate(invoice._id)}
                                    disabled={downloadInvoice.isPending || invoice.status === 'pending' || (invoice.amountPaid || 0) <= 0}
                                    className={`p-2 rounded-xl transition-colors ${invoice.status === 'pending' || (invoice.amountPaid || 0) <= 0
                                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                        : 'text-primary dark:text-primary-bright hover:bg-primary/10'
                                        }`}
                                    title={invoice.status === 'pending' ? "Payment required to download" : "Download PDF"}
                                >
                                    <FiDownload className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setDeleteModal({ isOpen: true, invoice })}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                                    title="Delete Invoice"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {invoices.length === 0 && (
                    <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-xs">
                        <p>No invoices found.</p>
                    </div>
                )}
            </motion.div>

            {/* Desktop View (Table) */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-surface-elevated border border-black/[0.06] dark:border-white/[0.08] rounded-2xl overflow-hidden hidden md:block shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-black/[0.06] dark:border-white/[0.08] bg-gray-50/50 dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 font-medium">
                                <th className="px-5 py-3.5">Invoice No</th>
                                <th className="px-5 py-3.5">Customer</th>
                                <th className="px-5 py-3.5">Loan No</th>
                                <th className="px-5 py-3.5">EMI Due</th>
                                <th className="px-5 py-3.5">Amount</th>
                                <th className="px-5 py-3.5">Status</th>
                                <th className="px-5 py-3.5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                            {invoices.map((invoice) => (
                                <tr
                                    key={invoice._id}
                                    className="hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors"
                                >
                                    <td className="px-5 py-3.5 font-mono font-semibold text-primary dark:text-primary-bright">{invoice.invoiceNumber}</td>
                                    <td className="px-5 py-3.5">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {invoice.customerId?.firstName} {invoice.customerId?.lastName}
                                        </p>
                                    </td>
                                    <td className="px-5 py-3.5 font-mono text-gray-500 dark:text-gray-400">{invoice.loanId?.loanNumber}</td>
                                    <td className={`px-5 py-3.5 tabular-nums ${new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' ? 'text-red-500 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {formatDate(invoice.dueDate)}
                                    </td>
                                    <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white tabular-nums">{formatCurrency(invoice.amountDue)}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                            invoice.status === 'paid'
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                : invoice.status === 'overdue'
                                                ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                        }`}>
                                            {getStatusIcon(invoice.status)}
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <button
                                            onClick={() => downloadInvoice.mutate(invoice._id)}
                                            disabled={downloadInvoice.isPending || invoice.status === 'pending' || (invoice.amountPaid || 0) <= 0}
                                            className={`p-1.5 rounded-lg transition-colors inline-block mr-1 ${invoice.status === 'pending' || (invoice.amountPaid || 0) <= 0
                                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                                : 'text-primary dark:text-primary-bright hover:bg-primary/10'
                                                }`}
                                            title={invoice.status === 'pending' ? "Payment required to download" : "Download PDF"}
                                        >
                                            <FiDownload className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal({ isOpen: true, invoice })}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors inline-block"
                                            title="Delete Invoice"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {invoices.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center py-16 text-gray-400 dark:text-gray-500">
                                        <FiFileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        <p className="text-xs">No invoices generated yet for this billing cycle.</p>
                                        <button
                                            onClick={handleGenerate}
                                            className="text-primary dark:text-primary-bright font-semibold text-xs mt-2 hover:underline inline-block"
                                        >
                                            Generate invoices now →
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, invoice: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Invoice"
                message={`Are you sure you want to delete invoice ${deleteModal.invoice?.invoiceNumber}? This action cannot be undone.`}
                confirmText="Delete Invoice"
                cancelText="Cancel"
                type="danger"
                confirmStyle="danger"
                loading={deleteInvoice.isPending}
            />
        </motion.div>
    );
};

export default InvoiceList;
