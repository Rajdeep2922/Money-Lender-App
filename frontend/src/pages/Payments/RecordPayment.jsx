import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FiPlus, FiSearch, FiArrowLeft, FiSave, FiCheckCircle, FiDownload, FiArrowRight } from 'react-icons/fi';
import { useLoans } from '../../hooks/useLoans';
import { useRecordPayment, useDownloadReceipt } from '../../hooks/usePayments';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const RecordPayment = () => {
    const navigate = useNavigate();
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [recordedPaymentId, setRecordedPaymentId] = useState(null);
    const { data: loansData, isLoading } = useLoans({ status: 'active' });
    const recordPayment = useRecordPayment();
    const downloadReceipt = useDownloadReceipt();

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            paymentMethod: 'bank_transfer',
            paymentDate: new Date().toISOString().split('T')[0],
        },
    });

    const onSubmit = async (data) => {
        if (!selectedLoan) return;
        try {
            const response = await recordPayment.mutateAsync({
                loanId: selectedLoan._id,
                amountPaid: parseFloat(data.amountPaid),
                paymentMethod: data.paymentMethod,
                paymentDate: data.paymentDate,
                referenceId: data.referenceId,
                notes: data.notes,
            });
            setRecordedPaymentId(response.payment._id);
        } catch (error) {
            console.error('Error recording payment:', error);
        }
    };

    if (isLoading) return <PageLoader />;

    const loans = loansData?.loans || [];

    if (recordedPaymentId) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto py-12 text-center"
            >
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <FiCheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Payment Recorded!</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    The payment has been successfully added to the loan records.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => downloadReceipt.mutate(recordedPaymentId)}
                        disabled={downloadReceipt.isPending}
                        className="btn btn-primary w-full py-4 text-lg gap-2"
                    >
                        <FiDownload className="w-5 h-5" />
                        {downloadReceipt.isPending ? 'Downloading...' : 'Download Receipt PDF'}
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => {
                                setRecordedPaymentId(null);
                                setSelectedLoan(null);
                                reset();
                            }}
                            className="btn btn-secondary w-full py-3 gap-2"
                        >
                            <FiPlus className="w-4 h-4" />
                            Record Another
                        </button>
                        <Link
                            to="/payments"
                            className="btn btn-secondary w-full py-3 gap-2"
                        >
                            View List
                            <FiArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto pb-12"
        >
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Record Payment</h1>
                    <p className="text-gray-500 dark:text-gray-400">Record an EMI payment</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Select Loan */}
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Loan</h2>
                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                        {loans.map((loan) => (
                            <button
                                key={loan._id}
                                type="button"
                                onClick={() => {
                                    setSelectedLoan(loan);
                                    reset({ amountPaid: loan.monthlyEMI, paymentMethod: 'bank_transfer', paymentDate: new Date().toISOString().split('T')[0] });
                                }}
                                className={`w-full p-4 text-left rounded-lg border transition-all ${selectedLoan?._id === loan._id
                                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 shadow-sm'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-teal-300'
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{loan.loanNumber}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {loan.customerId?.firstName} {loan.customerId?.lastName}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">EMI: {formatCurrency(loan.monthlyEMI)}</p>
                                        <p className="text-xs text-gray-400">Balance: {formatCurrency(loan.remainingBalance)}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                        {loans.length === 0 && (
                            <p className="text-center text-gray-500 py-4">
                                No active loans. <Link to="/loans/new" className="text-teal-600">Create a loan first</Link>
                            </p>
                        )}
                    </div>
                </div>

                {/* Payment Form */}
                {selectedLoan && (
                    <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4 shadow-lg border-teal-100 dark:border-teal-900/30">
                        <div className="flex items-center justify-between border-b pb-4 mb-2 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Details</h2>
                            <div className="text-right">
                                <span className="text-xs text-gray-500 uppercase">Selected Loan</span>
                                <p className="text-sm font-bold text-teal-600">{selectedLoan.loanNumber}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="label">Amount (₹) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('amountPaid', { required: 'Amount is required', min: { value: 0.01, message: 'Minimum amount is 0.01' } })}
                                    className={`input text-lg font-bold text-teal-600 ${errors.amountPaid ? 'input-error' : ''}`}
                                />
                                {errors.amountPaid && <p className="error-text">{errors.amountPaid.message}</p>}
                            </div>

                            <div className="form-group">
                                <label className="label">Payment Method *</label>
                                <select {...register('paymentMethod')} className="input">
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="cash">Cash</option>
                                    <option value="upi">UPI</option>
                                    <option value="cheque">Cheque</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="label">Payment Date *</label>
                                <input type="date" {...register('paymentDate')} className="input" />
                            </div>

                            <div className="form-group">
                                <label className="label">Reference ID</label>
                                <input {...register('referenceId')} className="input" placeholder="e.g. TXN-123456" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="label">Notes</label>
                            <textarea {...register('notes')} rows={2} className="input" placeholder="Optional payment notes..." />
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button type="button" onClick={() => setSelectedLoan(null)} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting} className="btn btn-primary px-8">
                                <FiSave className="w-4 h-4 mr-2" />
                                {isSubmitting ? 'Recording...' : 'Record Payment'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </motion.div>
    );
};

export default RecordPayment;
