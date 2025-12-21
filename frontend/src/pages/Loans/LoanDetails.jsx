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
    FiFileText
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
import { formatCurrency, formatDate, formatStatus, getStatusColor } from '../../utils/formatters';

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
        if (window.confirm('Are you sure you want to approve this loan?')) {
            approveLoan.mutate(id);
        }
    };

    const handleForeclose = async () => {
        const fee = window.prompt('Enter foreclosure fee (if any)', '0');
        if (fee === null) return; // Cancelled

        const confirmed = window.confirm(
            `This will fully settle the loan with a remaining balance of ${formatCurrency(loan.remainingBalance)} ${parseFloat(fee) > 0 ? `plus a fee of ${formatCurrency(parseFloat(fee))}` : ''}. This action is permanent. Do you want to proceed?`
        );

        if (confirmed) {
            try {
                await forecloseLoan.mutateAsync({
                    id,
                    data: {
                        foreclosureFee: parseFloat(fee) || 0,
                        paymentMethod: 'bank_transfer',
                        notes: `Early settlement foreclosure${parseFloat(fee) > 0 ? ` with fee of ${fee}` : ''}`
                    }
                });
            } catch (error) {
                alert('Foreclosure failed: ' + error.message);
            }
        }
    };

    const handleMarkPaid = async (emiItem) => {
        if (!window.confirm(`Mark EMI for ${formatCurrency(emiItem.emi)} as PAID ? `)) {
            return;
        }

        try {
            await recordPayment.mutateAsync({
                loanId: id,
                amountPaid: emiItem.emi,
                paymentMethod: 'cash',
                paymentDate: new Date().toISOString(),
                notes: `EMI Payment for ${formatDate(emiItem.date)}`,
                referenceId: `EMI - ${loan.loanNumber} -${emiItem.index + 1} `,
            });
        } catch (error) {
            console.error('Error marking as paid:', error);
        }
    };

    const handleMarkUnpaid = async () => {
        // Can only revert the most recent payment
        const lastPayment = payments && payments[0]; // Assuming sorted by date desc

        if (!lastPayment) return;

        if (!window.confirm(`Are you sure you want to undo the last payment of ${formatCurrency(lastPayment.amountPaid)}?`)) {
            return;
        }

        try {
            await deletePayment.mutateAsync(lastPayment._id);
        } catch (error) {
            alert('Failed to delete payment: ' + error.message);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link to="/loans" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <FiArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {loan.loanNumber}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`badge ${getStatusColor(loan.status)} `}>
                                {formatStatus(loan.status)}
                            </span>
                            <span className="text-sm text-gray-500">•</span>
                            <Link to={`/ customers / ${loan.customerId?._id} `} className="text-sm text-teal-600 hover:text-teal-700">
                                {loan.customerId?.firstName} {loan.customerId?.lastName}
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {loan.status === 'pending_approval' && (
                        <button
                            className="btn btn-primary gap-2"
                            onClick={handleApprove}
                            disabled={approveLoan.isPending}
                        >
                            <FiCheckCircle className="w-4 h-4" />
                            {approveLoan.isPending ? 'Approving...' : 'Approve Loan'}
                        </button>
                    )}
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
                <div className="card p-4 border-l-4 border-l-blue-500">
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
                <nav className="-mb-px flex space-x-8">
                    {['overview', 'schedule', 'payments'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${activeTab === tab
                                ? 'border-teal-500 text-teal-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace - nowrap py - 4 px - 1 border - b - 2 font - medium text - sm capitalize`}
                        >
                            {tab}
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
    );
};

export default LoanDetails;
