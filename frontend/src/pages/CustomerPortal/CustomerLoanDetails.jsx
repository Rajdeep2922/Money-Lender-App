import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiDollarSign, FiCalendar, FiPercent, FiClock, FiCheckCircle, FiDownload, FiLoader, FiChevronDown, FiChevronUp, FiAlertCircle } from 'react-icons/fi';
import { customerPortalAPI } from '../../services/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import useAuthStore from '../../store/authStore';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount || 0);
};

const formatCurrencyPDF = (amount) => {
    return `Rs. ${new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount || 0)}`;
};

const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const CustomerLoanDetails = () => {
    const { id } = useParams();
    const { user } = useAuthStore();
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [showSchedule, setShowSchedule] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ['customerLoan', id],
        queryFn: async () => {
            const response = await customerPortalAPI.getLoanDetails(id);
            return response.data;
        },
        enabled: !!id,
    });

    const { data: scheduleData, isLoading: isLoadingSchedule } = useQuery({
        queryKey: ['loanSchedule', id],
        queryFn: async () => {
            const response = await customerPortalAPI.getLoanSchedule(id);
            return response.data;
        },
        enabled: showSchedule && !!id,
    });

    const schedule = scheduleData?.data?.schedule || [];

    const loan = data?.data?.loan || data?.loan || {};
    const payments = data?.data?.payments || data?.payments || [];

    const generatePDF = async () => {
        setIsGeneratingPDF(true);
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            let y = 20;

            const teal = [13, 148, 136];
            const darkText = [33, 33, 33];
            const grayText = [100, 100, 100];

            // Header
            doc.setFillColor(...teal);
            doc.rect(0, 0, pageWidth, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('LOAN STATEMENT', pageWidth / 2, 18, { align: 'center' });
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Loan #${loan.loanNumber || id.slice(-6).toUpperCase()}`, pageWidth / 2, 28, { align: 'center' });
            doc.text(`Generated: ${formatDate(new Date())}`, pageWidth / 2, 36, { align: 'center' });

            y = 50;

            // Customer Info
            doc.setTextColor(...darkText);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Customer Information', margin, y);
            y += 8;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...grayText);
            const customerName = `${user?.firstName || ''} ${user?.lastName || user?.fullName || 'Customer'}`.trim();
            doc.text(`Name: ${customerName}`, margin, y);
            y += 12;

            // Loan Details
            doc.setTextColor(...darkText);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Loan Details', margin, y);
            y += 6;

            autoTable(doc, {
                startY: y,
                body: [
                    ['Principal', formatCurrencyPDF(loan.principal), 'Interest', `${loan.monthlyInterestRate}%/mo`],
                    ['Duration', `${loan.loanDurationMonths} months`, 'EMI', formatCurrencyPDF(loan.monthlyEMI)],
                    ['Status', (loan.status || 'Active').toUpperCase(), 'Start', formatDate(loan.startDate)],
                ],
                theme: 'plain',
                styles: { fontSize: 9, cellPadding: 3 },
                columnStyles: {
                    0: { fontStyle: 'bold', textColor: grayText, cellWidth: 30 },
                    1: { textColor: darkText, cellWidth: 40 },
                    2: { fontStyle: 'bold', textColor: grayText, cellWidth: 30 },
                    3: { textColor: darkText, cellWidth: 40 },
                },
                margin: { left: margin, right: margin },
            });

            y = doc.lastAutoTable.finalY + 10;

            // Financial Summary
            doc.setFillColor(...teal);
            doc.roundedRect(margin, y, pageWidth - (margin * 2), 35, 3, 3, 'F');
            const amountPaid = (loan.totalAmountPayable || 0) - (loan.remainingBalance || 0);
            const boxWidth = (pageWidth - (margin * 2)) / 3;

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.text('TOTAL', margin + boxWidth * 0.5, y + 10, { align: 'center' });
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(formatCurrencyPDF(loan.totalAmountPayable), margin + boxWidth * 0.5, y + 22, { align: 'center' });

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text('PAID', margin + boxWidth * 1.5, y + 10, { align: 'center' });
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(formatCurrencyPDF(amountPaid), margin + boxWidth * 1.5, y + 22, { align: 'center' });

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text('DUE', margin + boxWidth * 2.5, y + 10, { align: 'center' });
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(formatCurrencyPDF(loan.remainingBalance), margin + boxWidth * 2.5, y + 22, { align: 'center' });

            y += 45;

            // Payment History
            if (payments.length > 0) {
                doc.setTextColor(...darkText);
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.text('Payment History', margin, y);
                y += 6;

                const paymentData = payments.slice(0, 6).map((p, i) => [
                    i + 1,
                    formatDate(p.paymentDate),
                    formatCurrencyPDF(p.amount),
                    p.paymentMethod || 'Cash',
                ]);

                autoTable(doc, {
                    startY: y,
                    head: [['#', 'Date', 'Amount', 'Method']],
                    body: paymentData,
                    theme: 'striped',
                    headStyles: { fillColor: teal, fontSize: 9 },
                    styles: { fontSize: 9, cellPadding: 3 },
                    margin: { left: margin, right: margin },
                });
            }

            // Footer
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
            doc.setFontSize(8);
            doc.setTextColor(...grayText);
            doc.text('Computer-generated statement', pageWidth / 2, pageHeight - 12, { align: 'center' });

            doc.save(`Loan_${loan.loanNumber || id.slice(-6)}.pdf`);
        } catch (err) {
            console.error('PDF error:', err);
            alert('Failed to generate PDF');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    if (isLoading) return <PageLoader />;

    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500 mb-4">Error: {error.message}</p>
                <Link to="/portal" className="text-teal-600">← Back</Link>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
                <div className="flex items-center gap-3">
                    <Link to="/portal" className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <FiArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                            Loan #{loan.loanNumber || id.slice(-6).toUpperCase()}
                        </h1>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${loan.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                            {loan.status}
                        </span>
                    </div>
                </div>

                <button
                    onClick={generatePDF}
                    disabled={isGeneratingPDF}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 sm:py-2 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-xl font-medium shadow-md active:scale-[0.98] transition-transform disabled:opacity-70"
                >
                    {isGeneratingPDF ? (
                        <><FiLoader className="w-4 h-4 animate-spin" /> Generating...</>
                    ) : (
                        <><FiDownload className="w-4 h-4" /> Download PDF</>
                    )}
                </button>
            </motion.div>

            {/* Stats Grid - Mobile: 2x2 */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-3 sm:p-4">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
                        <FiDollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                        Principal
                    </div>
                    <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(loan.principal)}</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-3 sm:p-4">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
                        <FiPercent className="w-3 h-3 sm:w-4 sm:h-4" />
                        Interest
                    </div>
                    <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">{loan.monthlyInterestRate}%</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-3 sm:p-4">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
                        <FiClock className="w-3 h-3 sm:w-4 sm:h-4" />
                        Duration
                    </div>
                    <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">{loan.loanDurationMonths} months</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-3 sm:p-4">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
                        <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        EMI
                    </div>
                    <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(loan.monthlyEMI)}</p>
                </motion.div>
            </div>

            {/* Balance Summary */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card p-4 sm:p-6">
                <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Balance</h2>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                        <p className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(loan.totalAmountPayable)}</p>
                    </div>
                    <div className="p-3 sm:p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl text-center">
                        <p className="text-xs text-teal-600 dark:text-teal-400">Paid</p>
                        <p className="text-sm sm:text-xl font-bold text-teal-700 dark:text-teal-300">
                            {formatCurrency((loan.totalAmountPayable || 0) - (loan.remainingBalance || 0))}
                        </p>
                    </div>
                    <div className="p-3 sm:p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-center">
                        <p className="text-xs text-orange-600 dark:text-orange-400">Due</p>
                        <p className="text-sm sm:text-xl font-bold text-orange-700 dark:text-orange-300">{formatCurrency(loan.remainingBalance)}</p>
                    </div>
                </div>
            </motion.div>

            {/* EMI Schedule */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="card">
                <button
                    onClick={() => setShowSchedule(!showSchedule)}
                    className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <FiCalendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">EMI Schedule</h2>
                    </div>
                    {showSchedule ? <FiChevronUp className="w-5 h-5 text-gray-400" /> : <FiChevronDown className="w-5 h-5 text-gray-400" />}
                </button>

                {showSchedule && (
                    <div className="border-t border-gray-100 dark:border-gray-800">
                        {isLoadingSchedule ? (
                            <div className="p-8 text-center">
                                <FiLoader className="w-6 h-6 animate-spin mx-auto text-teal-600" />
                                <p className="text-sm text-gray-500 mt-2">Loading schedule...</p>
                            </div>
                        ) : schedule.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                <FiAlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                No schedule available
                            </div>
                        ) : (
                            <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                                {schedule.map((item, index) => {
                                    const isPaid = (item.balance || 0) <= 0 || (index < (loan.paymentsReceived || 0)); // Estimation
                                    const isPastDue = new Date(item.dueDate) < new Date() && !isPaid;

                                    return (
                                        <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {formatDate(item.dueDate)}
                                                    </span>
                                                    {isPaid ? (
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">PAID</span>
                                                    ) : isPastDue ? (
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">OVERDUE</span>
                                                    ) : (
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">UPCOMING</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Prin: {formatCurrency(item.principal)} + Int: {formatCurrency(item.interest)}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900 dark:text-white">
                                                    {formatCurrency(item.emi)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Bal: {formatCurrency(item.balance)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Payment History */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="card">
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">Payments</h2>
                </div>

                {payments.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                        No payments yet
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {payments.map((payment) => (
                            <div key={payment._id} className="p-3 sm:p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                                        <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">{formatCurrency(payment.amountPaid)}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatDate(payment.paymentDate)}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500">{payment.paymentMethod || 'Cash'}</span>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default CustomerLoanDetails;
