import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiArrowLeft,
    FiCheckCircle,
    FiDownload,
    FiCalendar,
    FiDollarSign,
    FiClock,
    FiInfo,
    FiFileText,
    FiEdit
} from 'react-icons/fi';
import {
    useLoan,
    useLoanAmortization,
    useApproveLoan,
    useForecloseLoan,
    useDownloadAgreement,
    useDownloadStatement,
    useDownloadNOC
} from '../../hooks/useLoans';
import {
    usePaymentsForLoan,
    useRecordPayment,
    useDeletePayment,
    useDownloadReceipt
} from '../../hooks/usePayments';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { formatCurrency, formatDate, formatStatus, getStatusColor } from '../../utils/formatters';
import toast from 'react-hot-toast';

const LoanDetails = () => {
    const { id } = useParams();
    const { data: loan, isLoading: loadingLoan } = useLoan(id);
    const { data: amortizationData, isLoading: loadingSchedule } = useLoanAmortization(id);
    const { data: paymentsData, isLoading: loadingPayments } = usePaymentsForLoan(id);
    const approveLoan = useApproveLoan();
    const downloadAgreement = useDownloadAgreement();
    const downloadStatement = useDownloadStatement();
    const downloadNOC = useDownloadNOC();
    const forecloseLoan = useForecloseLoan();
    const recordPayment = useRecordPayment();
    const deletePayment = useDeletePayment();
    const downloadReceipt = useDownloadReceipt();

    const [activeTab, setActiveTab] = useState('overview');
    const [approveModal, setApproveModal] = useState(false);
    const [paymentModal, setPaymentModal] = useState({ isOpen: false, emiItem: null });
    const [unpaidModal, setUnpaidModal] = useState({ isOpen: false, payment: null });
    const [forecloseModal, setForecloseModal] = useState({
        isOpen: false,
        paymentMethod: 'cash',
        discount: '0',
        notes: '',
        bankDetails: {
            accountHolderName: '',
            bankName: '',
            accountNumber: '',
            ifscCode: '',
            branch: '',
            upiId: '',
            transactionId: ''
        }
    });



    if (loadingLoan || loadingSchedule || loadingPayments) {
        return <PageLoader />;
    }

    if (!loan) {
        return (
            <div className="text-center p-8">
                <p className="text-gray-500">Loan not found</p>
                <Link to="/loans" className="text-teal-600 hover:text-teal-700 mt-2 inline-block">
                    Back to Loans
                </Link>
            </div>
        );
    }

    const { schedule } = amortizationData || {};
    const { payments } = paymentsData || {};

    // Calculate derived stats
    const paymentsReceivedCount = loan.paymentsReceived || 0;
    const totalEmis = loan.loanDurationMonths;
    const nextDueEMI = schedule && schedule[paymentsReceivedCount];
    const isOverdue = nextDueEMI && new Date(nextDueEMI.dueDate) < new Date();

    const getEmiStatus = (index, dueDate) => {
        if (index < paymentsReceivedCount) return 'paid';
        if (new Date(dueDate) < new Date() && index >= paymentsReceivedCount) return 'overdue';
        if (index === paymentsReceivedCount) return 'due';
        return 'upcoming';
    };

    const getEmiStatusBadge = (status) => {
        switch (status) {
            case 'paid': return <span className="badge badge-success">Paid</span>;
            case 'overdue': return <span className="badge badge-error">Overdue</span>;
            case 'due': return <span className="badge badge-warning">Next Due</span>;
            default: return <span className="text-gray-400 text-sm">Upcoming</span>;
        }
    };

    const handleApprove = () => {
        setApproveModal(true);
    };

    const handleApproveConfirm = async () => {
        const toastId = toast.loading('Approving loan...');
        try {
            await approveLoan.mutateAsync(id);
            toast.success('Loan approved successfully!', { id: toastId });
            setApproveModal(false);
        } catch (error) {
            toast.error(error.message || 'Failed to approve loan', { id: toastId });
        }
    };

    const handleForeclose = () => {
        setForecloseModal({
            isOpen: true,
            paymentMethod: 'cash',
            discount: '0',
            notes: '',
            bankDetails: {
                accountHolderName: '',
                bankName: '',
                accountNumber: '',
                ifscCode: '',
                branch: '',
                upiId: '',
                transactionId: ''
            }
        });
    };

    const handleForecloseConfirm = async () => {
        const toastId = toast.loading('Processing early settlement...');
        const discountAmount = parseFloat(forecloseModal.discount) || 0;
        const finalAmount = Math.max(0, loan.remainingBalance - discountAmount);

        try {
            await forecloseLoan.mutateAsync({
                id,
                data: {
                    settlementAmount: finalAmount,
                    discount: discountAmount,
                    paymentMethod: forecloseModal.paymentMethod,
                    notes: forecloseModal.notes || 'Early settlement / Loan closure',
                    bankDetails: forecloseModal.bankDetails
                }
            });
            toast.success('Loan closed successfully! Downloading certificate...', { id: toastId });
            setForecloseModal({
                isOpen: false,
                paymentMethod: 'cash',
                discount: '0',
                notes: '',
                bankDetails: { accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '', branch: '', upiId: '', transactionId: '' }
            });

            // Auto-download settlement certificate PDF
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/loans/${id}/settlement-certificate`, {
                    headers: {
                        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token || ''}`
                    }
                });
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Settlement-${loan.loanNumber}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    a.remove();
                    toast.success('Settlement certificate downloaded!');
                }
            } catch (pdfError) {
                console.error('PDF download error:', pdfError);
                toast.error('Settlement complete, but PDF download failed. You can download it later from the loan page.');
            }
        } catch (error) {
            toast.error('Settlement failed: ' + error.message, { id: toastId });
        }
    };




    const handleMarkPaid = (emiItem) => {
        setPaymentModal({ isOpen: true, emiItem });
    };

    const handleMarkPaidConfirm = async () => {
        if (!paymentModal.emiItem) return;
        const emiItem = paymentModal.emiItem;
        const toastId = toast.loading('Recording payment...');
        try {
            await recordPayment.mutateAsync({
                loanId: id,
                amountPaid: emiItem.emi,
                paymentMethod: 'cash',
                paymentDate: new Date().toISOString(),
                notes: `EMI Payment for EMI #${emiItem.month}`,
                referenceId: `EMI-${loan.loanNumber}-${emiItem.month}`,
            });
            toast.success('Payment recorded successfully!', { id: toastId });
            setPaymentModal({ isOpen: false, emiItem: null });
        } catch (error) {
            toast.error('Failed to record payment: ' + error.message, { id: toastId });
        }

    };


    const handleMarkUnpaid = () => {
        // Can only revert the most recent payment
        const lastPayment = payments && payments[0]; // Assuming sorted by date desc
        if (!lastPayment) return;
        setUnpaidModal({ isOpen: true, payment: lastPayment });
    };

    const handleUnpaidConfirm = async () => {
        if (!unpaidModal.payment) return;
        const toastId = toast.loading('Deleting payment...');
        try {
            await deletePayment.mutateAsync(unpaidModal.payment._id);
            toast.success('Payment undone successfully!', { id: toastId });
            setUnpaidModal({ isOpen: false, payment: null });
        } catch (error) {
            toast.error('Failed to delete payment: ' + error.message, { id: toastId });
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    return (
        <>
            <motion.div
                initial="hidden"
                animate="visible"

                variants={containerVariants}
                className="space-y-6"
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/loans" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <FiArrowLeft className="w-5 h-5 text-gray-500" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {loan.loanNumber}
                                </h1>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`badge ${getStatusColor(loan.status)} `}>
                                    {formatStatus(loan.status)}
                                </span>
                                <span className="text-sm text-gray-500">•</span>
                                <span className={`badge ${loan.interestType === 'compound' ? 'badge-info' : 'badge-secondary'}`}>
                                    {loan.interestType === 'compound' ? 'Compound Interest' : 'Simple Interest'}
                                </span>
                                <span className="text-sm text-gray-500">•</span>
                                <Link to={`/customers/${loan.customerId?._id}`} className="text-sm text-teal-600 hover:text-teal-700">
                                    {loan.customerId?.firstName} {loan.customerId?.lastName}
                                </Link>
                                <span className="text-sm text-gray-500">•</span>
                                <span className="text-sm text-gray-500">{loan.customerId?.phone}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {loan.status === 'pending_approval' && (
                            <Link
                                to={`/loans/${id}/edit`}
                                className="btn btn-secondary gap-2"
                            >
                                <FiEdit className="w-4 h-4" />
                                Edit
                            </Link>
                        )}
                        {/* Approve button removed - handled by toggle */}
                        {loan.status === 'active' && (
                            <button
                                className="btn btn-ghost text-error border border-error/20 hover:bg-error/10 gap-2"
                                onClick={handleForeclose}
                                disabled={forecloseLoan.isPending}
                            >
                                <FiClock className="w-4 h-4" />
                                {forecloseLoan.isPending ? 'Settle...' : 'Foreclose'}
                            </button>
                        )}
                        {loan.status === 'closed' && (
                            <button
                                className="btn btn-primary gap-2"
                                onClick={() => downloadNOC.mutate(id)}
                                disabled={downloadNOC.isPending}
                            >
                                <FiCheckCircle className="w-4 h-4" />
                                {downloadNOC.isPending ? 'Generating...' : 'Download NOC'}
                            </button>
                        )}
                        <button
                            className="btn btn-secondary gap-2"
                            onClick={() => downloadAgreement.mutate(id)}
                            disabled={downloadAgreement.isPending}
                        >
                            <FiDownload className="w-4 h-4" />
                            {downloadAgreement.isPending ? 'Generating...' : 'Agreement'}
                        </button>
                        <button
                            className="btn btn-secondary gap-2"
                            onClick={() => downloadStatement.mutate(id)}
                            disabled={downloadStatement.isPending}
                        >
                            <FiFileText className="w-4 h-4" />
                            {downloadStatement.isPending ? 'Generating...' : 'Statement'}
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="card p-4 border-l-4 border-l-teal-400">
                        <p className="text-sm text-gray-500">Principal Amount</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(loan.principal)}</p>
                    </div>
                    <div className="card p-4 border-l-4 border-l-teal-500">
                        <p className="text-sm text-gray-500">Remaining Balance</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(loan.remainingBalance)}</p>
                    </div>
                    <div className="card p-4 border-l-4 border-l-purple-500">
                        <p className="text-sm text-gray-500">EMI Progress</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                {paymentsReceivedCount} / {totalEmis}
                            </span>
                            <span className="text-sm text-gray-500">Paid</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 dark:bg-gray-700">
                            <div
                                className="bg-purple-600 h-1.5 rounded-full"
                                style={{ width: `${(paymentsReceivedCount / totalEmis) * 100}% ` }}
                            ></div>
                        </div>
                    </div>
                    <div className={`card p-4 border-l-4 ${isOverdue ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
                        <p className="text-sm text-gray-500">Next Payment</p>
                        {nextDueEMI ? (
                            <>
                                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                    {formatDate(nextDueEMI.dueDate)}
                                </p>
                                <p className={`text-xs font-semibold mt-1 ${isOverdue ? 'text-red-500' : 'text-yellow-600'}`}>
                                    {isOverdue ? 'OVERDUE' : 'Upcoming'}
                                </p>
                            </>
                        ) : (
                            <p className="text-sm font-medium text-green-600 mt-1">All Paid!</p>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-4 sm:space-x-8">
                        {['overview', 'schedule', 'payments'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                                    relative whitespace-nowrap py-3 px-3 sm:px-4 text-sm font-medium capitalize transition-all duration-200
                                    ${activeTab === tab
                                        ? 'text-teal-600 dark:text-teal-400'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }
                                `}
                            >
                                {tab}
                                {/* Active indicator */}
                                {activeTab === tab && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>


                {/* Tab Content */}
                <div className="card p-6 min-h-[400px]">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Loan Details</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="text-gray-500">Interest Rate</div>
                                    <div className="font-medium">{loan.monthlyInterestRate}% / month</div>

                                    <div className="text-gray-500">Duration</div>
                                    <div className="font-medium">{loan.loanDurationMonths} months</div>

                                    <div className="text-gray-500">Start Date</div>
                                    <div className="font-medium">{formatDate(loan.startDate)}</div>

                                    <div className="text-gray-500">Total Payable</div>
                                    <div className="font-medium">{formatCurrency(loan.totalAmountPayable)}</div>

                                    <div className="text-gray-500">Total Interest</div>
                                    <div className="font-medium text-green-600">{formatCurrency(loan.totalInterestAmount)}</div>

                                    <div className="text-gray-500">EMI Amount</div>
                                    <div className="font-medium">{formatCurrency(loan.monthlyEMI)}</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Customer Info</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="text-gray-500">Name</div>
                                    <div className="font-medium">{loan.customerId?.firstName} {loan.customerId?.lastName}</div>

                                    <div className="text-gray-500">Email</div>
                                    <div className="font-medium">{loan.customerId?.email}</div>

                                    <div className="text-gray-500">Phone</div>
                                    <div className="font-medium">{loan.customerId?.phone}</div>

                                    <div className="text-gray-500">Address</div>
                                    <div className="font-medium">
                                        {loan.customerId?.address?.city}, {loan.customerId?.address?.state}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Due Date</th>
                                        <th>Status</th>
                                        <th>EMI</th>
                                        <th>Principal</th>
                                        <th>Interest</th>
                                        <th>Balance</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedule?.map((item, index) => {
                                        const status = getEmiStatus(index, item.dueDate);
                                        const isNextDue = index === paymentsReceivedCount;
                                        const isLastPaid = index === paymentsReceivedCount - 1;

                                        return (
                                            <tr key={item.month} className={status === 'due' ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}>
                                                <td>{item.month}</td>
                                                <td className="font-medium">{formatDate(item.dueDate)}</td>
                                                <td>{getEmiStatusBadge(status)}</td>
                                                <td>{formatCurrency(item.emi)}</td>
                                                <td className="text-gray-500">{formatCurrency(item.principal)}</td>
                                                <td className="text-gray-500">{formatCurrency(item.interest)}</td>
                                                <td className="text-gray-500">{formatCurrency(item.balance)}</td>
                                                <td>
                                                    {(status === 'due' || (status === 'overdue' && isNextDue)) && (
                                                        <button
                                                            onClick={() => handleMarkPaid(item)}
                                                            disabled={recordPayment.isPending || deletePayment.isPending}
                                                            className="btn btn-primary btn-xs"
                                                        >
                                                            {recordPayment.isPending ? 'Processing...' : 'Mark Paid'}
                                                        </button>
                                                    )}
                                                    {status === 'paid' && isLastPaid && (
                                                        <button
                                                            onClick={handleMarkUnpaid}
                                                            disabled={recordPayment.isPending || deletePayment.isPending}
                                                            className="btn btn-ghost btn-xs text-error hover:bg-error/10 ml-2 border border-error/50"
                                                            title="Undo last payment"
                                                        >
                                                            {deletePayment.isPending ? 'Wait...' : 'Mark Unpaid'}
                                                        </button>
                                                    )}
                                                    {status === 'paid' && !isLastPaid && (
                                                        <span className="text-green-600 text-sm flex items-center gap-1">
                                                            <FiCheckCircle /> Paid
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Method</th>
                                        <th>Reference</th>
                                        <th>Notes</th>
                                        <th className="text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments?.map((payment) => (
                                        <tr key={payment._id}>
                                            <td>{formatDate(payment.paymentDate)}</td>
                                            <td className="font-medium text-green-600">{formatCurrency(payment.amountPaid)}</td>
                                            <td className="capitalize">{payment.paymentMethod?.replace('_', ' ')}</td>
                                            <td>{payment.referenceId || '-'}</td>
                                            <td>{payment.notes || '-'}</td>
                                            <td className="text-right">
                                                <button
                                                    onClick={() => downloadReceipt.mutate(payment._id)}
                                                    disabled={downloadReceipt.isPending}
                                                    className="text-teal-600 hover:text-teal-700 p-1 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors inline-flex items-center gap-1"
                                                    title="Download Receipt"
                                                >
                                                    <FiDownload className="w-4 h-4" />
                                                    <span className="text-xs font-medium">Receipt</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {!payments?.length && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-8 text-gray-500">
                                                No payments recorded yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Approve Loan Modal */}
            <ConfirmModal
                isOpen={approveModal}
                onClose={() => setApproveModal(false)}
                onConfirm={handleApproveConfirm}
                title="Approve Loan"
                message="Are you sure you want to approve this loan? This will change the status to Active."
                confirmText="Approve"
                type="info"
            />

            {/* Mark as Paid Modal */}
            <ConfirmModal
                isOpen={paymentModal.isOpen}
                onClose={() => setPaymentModal({ isOpen: false, emiItem: null })}
                onConfirm={handleMarkPaidConfirm}
                title="Record Payment"
                message={paymentModal.emiItem ? `Mark EMI of ${formatCurrency(paymentModal.emiItem.emi)} as PAID?` : ''}
                confirmText="Mark as Paid"
                type="info"
            />

            {/* Mark as Unpaid Modal */}
            <ConfirmModal
                isOpen={unpaidModal.isOpen}
                onClose={() => setUnpaidModal({ isOpen: false, payment: null })}
                onConfirm={handleUnpaidConfirm}
                title="Undo Payment"
                message={unpaidModal.payment ? `Are you sure you want to undo the last payment of ${formatCurrency(unpaidModal.payment.amountPaid)}?` : ''}
                confirmText="Undo Payment"
                type="danger"
            />

            {/* Early Settlement Modal */}
            {forecloseModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Early Settlement / Close Loan
                        </h3>

                        {/* Balance Breakdown */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Remaining Principal</span>
                                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(loan.remainingBalance)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Interest Type</span>
                                <span className="font-medium capitalize text-gray-900 dark:text-white">{loan.interestType || 'Simple'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">EMIs Paid</span>
                                <span className="font-medium text-gray-900 dark:text-white">{loan.paymentsReceived} / {loan.loanDurationMonths}</span>
                            </div>
                            {parseFloat(forecloseModal.discount) > 0 && (
                                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                    <span>Settlement Discount</span>
                                    <span>- {formatCurrency(parseFloat(forecloseModal.discount))}</span>
                                </div>
                            )}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
                                <span className="font-semibold text-gray-900 dark:text-white">Final Settlement</span>
                                <span className="font-bold text-lg text-teal-600 dark:text-teal-400">
                                    {formatCurrency(Math.max(0, loan.remainingBalance - (parseFloat(forecloseModal.discount) || 0)))}
                                </span>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="form-group mb-4">
                            <label className="label">Payment Method</label>
                            <select
                                className="input"
                                value={forecloseModal.paymentMethod}
                                onChange={(e) => setForecloseModal({ ...forecloseModal, paymentMethod: e.target.value })}
                            >
                                <option value="cash">💵 Cash</option>
                                <option value="bank_transfer">🏦 Bank Transfer</option>
                                <option value="upi">📱 UPI</option>
                                <option value="cheque">📄 Cheque</option>
                                <option value="other">📋 Other</option>
                            </select>
                        </div>

                        {/* Bank Details - Only show for bank transfer, UPI, or cheque */}
                        {['bank_transfer', 'upi', 'cheque'].includes(forecloseModal.paymentMethod) && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4 space-y-3">
                                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                                    {forecloseModal.paymentMethod === 'upi' ? '📱 UPI Details' : '🏦 Bank Details'}
                                </h4>

                                {forecloseModal.paymentMethod === 'upi' ? (
                                    <>
                                        <div className="form-group">
                                            <label className="label text-xs">UPI ID</label>
                                            <input
                                                type="text"
                                                className="input"
                                                value={forecloseModal.bankDetails.upiId}
                                                onChange={(e) => setForecloseModal({
                                                    ...forecloseModal,
                                                    bankDetails: { ...forecloseModal.bankDetails, upiId: e.target.value }
                                                })}
                                                placeholder="example@upi"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="label text-xs">Transaction ID</label>
                                            <input
                                                type="text"
                                                className="input"
                                                value={forecloseModal.bankDetails.transactionId}
                                                onChange={(e) => setForecloseModal({
                                                    ...forecloseModal,
                                                    bankDetails: { ...forecloseModal.bankDetails, transactionId: e.target.value }
                                                })}
                                                placeholder="Enter UPI transaction ID"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="form-group">
                                                <label className="label text-xs">Account Holder Name</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={forecloseModal.bankDetails.accountHolderName}
                                                    onChange={(e) => setForecloseModal({
                                                        ...forecloseModal,
                                                        bankDetails: { ...forecloseModal.bankDetails, accountHolderName: e.target.value }
                                                    })}
                                                    placeholder="Account holder name"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="label text-xs">Bank Name</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={forecloseModal.bankDetails.bankName}
                                                    onChange={(e) => setForecloseModal({
                                                        ...forecloseModal,
                                                        bankDetails: { ...forecloseModal.bankDetails, bankName: e.target.value }
                                                    })}
                                                    placeholder="Bank name"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="form-group">
                                                <label className="label text-xs">Account Number</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={forecloseModal.bankDetails.accountNumber}
                                                    onChange={(e) => setForecloseModal({
                                                        ...forecloseModal,
                                                        bankDetails: { ...forecloseModal.bankDetails, accountNumber: e.target.value }
                                                    })}
                                                    placeholder="Account number"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="label text-xs">IFSC Code</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={forecloseModal.bankDetails.ifscCode}
                                                    onChange={(e) => setForecloseModal({
                                                        ...forecloseModal,
                                                        bankDetails: { ...forecloseModal.bankDetails, ifscCode: e.target.value.toUpperCase() }
                                                    })}
                                                    placeholder="IFSC code"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="form-group">
                                                <label className="label text-xs">Branch</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={forecloseModal.bankDetails.branch}
                                                    onChange={(e) => setForecloseModal({
                                                        ...forecloseModal,
                                                        bankDetails: { ...forecloseModal.bankDetails, branch: e.target.value }
                                                    })}
                                                    placeholder="Branch name"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="label text-xs">Transaction/Cheque No.</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={forecloseModal.bankDetails.transactionId}
                                                    onChange={(e) => setForecloseModal({
                                                        ...forecloseModal,
                                                        bankDetails: { ...forecloseModal.bankDetails, transactionId: e.target.value }
                                                    })}
                                                    placeholder={forecloseModal.paymentMethod === 'cheque' ? "Cheque number" : "Transaction ID"}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Settlement Discount */}
                        <div className="form-group mb-4">
                            <label className="label">Settlement Discount (optional)</label>
                            <input
                                type="number"
                                className="input"
                                min="0"
                                max={loan.remainingBalance}
                                step="0.01"
                                value={forecloseModal.discount}
                                onChange={(e) => setForecloseModal({ ...forecloseModal, discount: e.target.value })}
                                placeholder="Enter discount amount"
                            />
                            <p className="text-xs text-gray-500 mt-1">Reduce the final settlement by this amount</p>
                        </div>

                        {/* Notes */}
                        <div className="form-group mb-4">
                            <label className="label">Notes / Remarks</label>
                            <textarea
                                className="input min-h-[80px] resize-none"
                                value={forecloseModal.notes}
                                onChange={(e) => setForecloseModal({ ...forecloseModal, notes: e.target.value })}
                                placeholder="Add any notes about this settlement..."
                            />
                        </div>


                        <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
                            ⚠️ This action will permanently close the loan. It cannot be undone.
                        </p>

                        <div className="flex gap-3 justify-end">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setForecloseModal({ isOpen: false, paymentMethod: 'cash', discount: '0', notes: '' })}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleForecloseConfirm}
                                disabled={forecloseLoan.isPending}
                            >
                                {forecloseLoan.isPending ? 'Processing...' : 'Confirm Settlement'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

        </>

    );
};


export default LoanDetails;
