import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiDownload, FiRefreshCw, FiAlertCircle, FiCheckCircle, FiClock, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useInvoices, useGenerateInvoices, useDownloadInvoice, useDeleteInvoice, invoiceKeys } from '../../hooks/useInvoices';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { TableSkeleton, CardSkeleton } from '../../components/common/Skeletons';
import { ConfirmModal } from '../../components/common/ConfirmModal';

const InvoiceList = () => {
    const queryClient = useQueryClient();
    const { data, isLoading, isFetching } = useInvoices();
    const generateInvoices = useGenerateInvoices();
    const downloadInvoice = useDownloadInvoice();
    const deleteInvoice = useDeleteInvoice();
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, invoice: null });

    const handleGenerate = async () => {
        const toastId = toast.loading('Generating invoices...');
        try {
            const result = await generateInvoices.mutateAsync();
            toast.success(`Successfully generated ${result.data.count} new invoices!`, { id: toastId });
            // Reset cache completely and force fresh fetch
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

    // Custom loading state using skeletons
    if (isLoading) {
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

    const invoices = data?.invoices || [];

    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid': return <FiCheckCircle className="text-green-500" />;
            case 'overdue': return <FiAlertCircle className="text-red-500" />;
            default: return <FiClock className="text-yellow-500" />;
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Invoices</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage monthly EMI billing for your customers</p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={generateInvoices.isPending}
                    className="btn btn-primary gap-2 w-full sm:w-auto"
                >
                    <FiRefreshCw className={`w-4 h-4 ${generateInvoices.isPending ? 'animate-spin' : ''}`} />
                    {generateInvoices.isPending ? 'Generating...' : 'Generate Monthly Invoices'}
                </button>
            </div>

            {/* Mobile View (Cards) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {invoices.map((invoice) => (
                    <motion.div
                        key={invoice._id}
                        variants={itemVariants}
                        className="card p-4 space-y-3"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold text-teal-600">{invoice.invoiceNumber}</p>
                                <p className="font-medium text-gray-900 dark:text-white mt-1">
                                    {invoice.customerId?.firstName} {invoice.customerId?.lastName}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(invoice.amountDue)}
                                </span>
                                <div className="flex items-center gap-1 text-xs capitalize">
                                    {getStatusIcon(invoice.status)}
                                    {invoice.status}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-sm pt-3 border-t border-gray-100 dark:border-gray-700">
                            <div className="text-gray-500">
                                <p>Loan: {invoice.loanId?.loanNumber}</p>
                                <p className={`mt-0.5 ${new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' ? 'text-red-500' : ''}`}>
                                    Due: {formatDate(invoice.dueDate)}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => downloadInvoice.mutate(invoice._id)}
                                    disabled={downloadInvoice.isPending}
                                    className="p-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors"
                                    title="Download PDF"
                                >
                                    <FiDownload className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setDeleteModal({ isOpen: true, invoice })}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    title="Delete Invoice"
                                >
                                    <FiTrash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {invoices.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <p>No invoices found.</p>
                    </div>
                )}
            </div>

            {/* Desktop View (Table) */}
            <div className="card overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Invoice No</th>
                                <th>Customer</th>
                                <th>Loan No</th>
                                <th>EMI Due</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {invoices.map((invoice) => (
                                <motion.tr
                                    key={invoice._id}
                                    variants={itemVariants}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <td className="font-semibold text-teal-600">{invoice.invoiceNumber}</td>
                                    <td>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {invoice.customerId?.firstName} {invoice.customerId?.lastName}
                                        </p>
                                    </td>
                                    <td className="text-sm">{invoice.loanId?.loanNumber}</td>
                                    <td className={`text-sm font-medium ${new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {formatDate(invoice.dueDate)}
                                    </td>
                                    <td className="font-bold">{formatCurrency(invoice.amountDue)}</td>
                                    <td>
                                        <div className="flex items-center gap-1.5 capitalize text-sm">
                                            {getStatusIcon(invoice.status)}
                                            {invoice.status}
                                        </div>
                                    </td>
                                    <td className="text-right">
                                        <button
                                            onClick={() => downloadInvoice.mutate(invoice._id)}
                                            disabled={downloadInvoice.isPending}
                                            className="p-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors inline-block mr-1"
                                            title="Download PDF"
                                        >
                                            <FiDownload className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal({ isOpen: true, invoice })}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors inline-block"
                                            title="Delete Invoice"
                                        >
                                            <FiTrash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                            {invoices.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="text-center py-20 text-gray-500">
                                        <FiFileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>No invoices generated yet for this billing cycle.</p>
                                        <button
                                            onClick={handleGenerate}
                                            className="text-teal-600 font-medium mt-2 hover:underline"
                                        >
                                            Generate invoices now
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
