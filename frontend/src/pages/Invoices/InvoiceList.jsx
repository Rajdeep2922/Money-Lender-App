import React from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiDownload, FiRefreshCw, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';
import { useInvoices, useGenerateInvoices, useDownloadInvoice } from '../../hooks/useInvoices';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PageLoader } from '../../components/common/LoadingSpinner';

const InvoiceList = () => {
    const { data, isLoading, refetch } = useInvoices();
    const generateInvoices = useGenerateInvoices();
    const downloadInvoice = useDownloadInvoice();

    const handleGenerate = async () => {
        try {
            const result = await generateInvoices.mutateAsync();
            alert(`Succesfully generated ${result.data.count} new invoices for this billing cycle!`);
        } catch (error) {
            alert('Generation failed: ' + error.message);
        }
    };

    if (isLoading) return <PageLoader />;

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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Invoices</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage monthly EMI billing for your customers</p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={generateInvoices.isPending}
                    className="btn btn-primary gap-2"
                >
                    <FiRefreshCw className={`w-4 h-4 ${generateInvoices.isPending ? 'animate-spin' : ''}`} />
                    {generateInvoices.isPending ? 'Generating...' : 'Generate Monthly Invoices'}
                </button>
            </div>

            <div className="card overflow-hidden">
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
                                            className="p-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors"
                                            title="Download PDF"
                                        >
                                            <FiDownload className="w-5 h-5" />
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
        </motion.div>
    );
};

export default InvoiceList;
