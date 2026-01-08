import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FiCheckCircle, FiDownload, FiCalendar, FiCreditCard } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { customerPortalAPI } from '../../services/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { jsPDF } from 'jspdf';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount || 0);
};

const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const CustomerPayments = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['customerPayments'],
        queryFn: async () => {
            const response = await customerPortalAPI.getPayments();
            return response.data;
        },
    });

    const generateReceipt = (payment) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;

        // Header
        doc.setFillColor(13, 148, 136);
        doc.rect(0, 0, pageWidth, 45, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('PAYMENT RECEIPT', pageWidth / 2, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Receipt #: ${payment._id.slice(-8).toUpperCase()}`, pageWidth / 2, 32, { align: 'center' });
        doc.text(`Date: ${formatDate(payment.paymentDate)}`, pageWidth / 2, 40, { align: 'center' });

        let y = 60;
        doc.setTextColor(33, 33, 33);

        // Payment Details
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Details', margin, y);
        y += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const details = [
            ['Amount Paid:', formatCurrency(payment.amount).replace('₹', 'Rs. ')],
            ['Payment Method:', payment.paymentMethod || 'Cash'],
            ['Loan Reference:', payment.loanId?.loanNumber || 'N/A'],
            ['Principal Amount:', formatCurrency(payment.loanId?.principal || 0).replace('₹', 'Rs. ')],
        ];

        details.forEach(([label, value]) => {
            doc.setFont('helvetica', 'bold');
            doc.text(label, margin, y);
            doc.setFont('helvetica', 'normal');
            doc.text(value, margin + 50, y);
            y += 8;
        });

        y += 20;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);

        y += 15;
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('This is a computer-generated receipt.', pageWidth / 2, y, { align: 'center' });

        doc.save(`Receipt_${payment._id.slice(-8)}.pdf`);
    };

    if (isLoading) return <PageLoader />;

    const payments = data?.data || [];

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Payment History
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    All your payments across all loans
                </p>
            </motion.div>

            {/* Error Display */}
            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-red-800 dark:text-red-300 text-sm">
                        Error: {error.message}
                    </p>
                </div>
            )}

            {/* Summary Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card p-4 sm:p-6"
            >
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
                        <FiCheckCircle className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Payments</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {payments.length}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Payments List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
            >
                {payments.length === 0 ? (
                    <div className="p-8 text-center">
                        <FiCreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">
                            No payments recorded yet.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {payments.map((payment, index) => (
                            <motion.div
                                key={payment._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full flex-shrink-0">
                                        <FiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(payment.amount)}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <span className="flex items-center gap-1">
                                                <FiCalendar className="w-3 h-3" />
                                                {formatDate(payment.paymentDate)}
                                            </span>
                                            {payment.loanId?.loanNumber && (
                                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                                                    {payment.loanId.loanNumber}
                                                </span>
                                            )}
                                            <span>{payment.paymentMethod || 'Cash'}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => generateReceipt(payment)}
                                    className="p-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors flex-shrink-0"
                                    title="Download Receipt"
                                >
                                    <FiDownload className="w-5 h-5" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default CustomerPayments;
