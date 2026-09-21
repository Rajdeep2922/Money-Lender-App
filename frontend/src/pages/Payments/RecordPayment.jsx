import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FiPlus, FiSearch, FiArrowLeft, FiSave, FiCheckCircle, FiDownload, FiArrowRight, FiAlertTriangle, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useLoans } from '../../hooks/useLoans';
import { useRecordPayment, useDownloadReceipt } from '../../hooks/usePayments';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { InputClear } from '../../components/common/InputClear';
import { formatCurrency } from '../../utils/formatters';

export const RecordPayment = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedLoanId = searchParams.get('loanId');

    const [selectedLoan, setSelectedLoan] = useState(null);
    const [loanSearch, setLoanSearch] = useState('');
    const [recordedPaymentId, setRecordedPaymentId] = useState(null);

    // Fetch active loans by default
    const { data: loansData, isLoading } = useLoans({ limit: 200, status: 'active' });
    const recordPayment = useRecordPayment();
    const downloadReceipt = useDownloadReceipt();

    const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            paymentMethod: 'bank_transfer',
            paymentDate: new Date().toISOString().split('T')[0],
            amountPaid: '',
        },
    });

    const paymentMethod = watch('paymentMethod');
    const amountPaid = watch('amountPaid');

    const loans = useMemo(() => {
        return loansData?.loans || [];
    }, [loansData]);

    // Pre-select loan if passed via query parameter
    useEffect(() => {
        if (preselectedLoanId && loans.length > 0 && !selectedLoan) {
            const match = loans.find(l => l._id === preselectedLoanId);
            if (match) {
                setSelectedLoan(match);
                setValue('amountPaid', match.monthlyEMI);
            }
        }
    }, [preselectedLoanId, loans, selectedLoan, setValue]);

    // Filter loans by borrower name or loan number
    const filteredLoans = useMemo(() => {
        if (!loanSearch.trim()) return loans;
        const q = loanSearch.toLowerCase();
        return loans.filter(l =>
            l.loanNumber?.toLowerCase().includes(q) ||
            l.customerId?.firstName?.toLowerCase().includes(q) ||
            l.customerId?.lastName?.toLowerCase().includes(q) ||
            l.customerId?.phone?.includes(q)
        );
    }, [loans, loanSearch]);

    // Overpayment check
    const isOverpaying = useMemo(() => {
        if (!selectedLoan || !amountPaid) return false;
        const num = parseFloat(amountPaid);
        return !isNaN(num) && num > selectedLoan.remainingBalance;
    }, [selectedLoan, amountPaid]);

    const overpaymentDiff = useMemo(() => {
        if (!isOverpaying) return 0;
        return parseFloat(amountPaid) - selectedLoan.remainingBalance;
    }, [isOverpaying, amountPaid, selectedLoan]);

    const handleSelectLoan = (loan) => {
        setSelectedLoan(loan);
        setValue('amountPaid', loan.monthlyEMI);
    };

    const handleCapToBalance = () => {
        if (selectedLoan) {
            setValue('amountPaid', selectedLoan.remainingBalance);
        }
    };

    const onSubmit = async (data) => {
        if (!selectedLoan) {
            toast.error('Please select an active loan first');
            return;
        }
        if (recordPayment.isPending) return;

        const toastId = toast.loading('Recording payment...');
        try {
            const response = await recordPayment.mutateAsync({
                loanId: selectedLoan._id,
                amountPaid: parseFloat(data.amountPaid),
                paymentMethod: data.paymentMethod,
                paymentDate: data.paymentDate,
                referenceId: data.referenceId,
                notes: data.notes,
                bankDetails: {
                    accountHolderName: data.accountHolderName || '',
                    bankName: data.bankName || '',
                    accountNumber: data.accountNumber || '',
                    ifscCode: data.ifscCode || '',
                    branch: data.branch || '',
                    upiId: data.upiId || '',
                    transactionId: data.transactionId || '',
                }
            });
            toast.success('Payment recorded successfully!', { id: toastId });
            setRecordedPaymentId(response.data.payment._id);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to record payment';
            toast.error(errorMessage, { id: toastId });
        }
    };

    if (isLoading) return <PageLoader />;

    if (recordedPaymentId) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto py-12 text-center"
            >
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-emerald-200 dark:border-emerald-800">
                    <FiCheckCircle className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Confirmed!</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                    The payment has been successfully added to the loan balance and repayment ledger.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => downloadReceipt.mutate(recordedPaymentId)}
                        disabled={downloadReceipt.isPending}
                        className="btn btn-primary w-full py-3.5 rounded-xl text-base font-semibold gap-2 shadow-sm"
                    >
                        <FiDownload className="w-5 h-5" />
                        {downloadReceipt.isPending ? 'Generating...' : 'Download Receipt PDF'}
                    </button>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            onClick={() => {
                                setRecordedPaymentId(null);
                                setSelectedLoan(null);
                                reset();
                            }}
                            className="btn btn-secondary w-full py-3 rounded-xl gap-2 text-sm"
                        >
                            <FiPlus className="w-4 h-4" />
                            Record Another
                        </button>
                        <Link
                            to="/payments"
                            className="btn btn-secondary w-full py-3 rounded-xl gap-2 text-sm"
                        >
                            View Ledger
                            <FiArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto pb-12 space-y-6"
        >
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl border border-hairline-light dark:border-hairline-dark bg-white dark:bg-surface-elevated hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <FiArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Record Payment</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Apply an EMI collection against an active loan balance</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Loan Selector Card */}
                <div className="card p-6 bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            1. Select Loan
                        </h2>
                        {selectedLoan && (
                            <button
                                type="button"
                                onClick={() => setSelectedLoan(null)}
                                className="text-xs font-semibold text-primary dark:text-primary-bright hover:underline"
                            >
                                Change Loan
                            </button>
                        )}
                    </div>

                    {!selectedLoan ? (
                        <>
                            {/* Search filter inside loan selector */}
                            <InputClear
                                value={loanSearch}
                                onChange={(e) => setLoanSearch(e.target.value)}
                                placeholder="Filter by loan #, customer name, or phone..."
                                className="w-full rounded-xl h-10 text-xs bg-gray-50 dark:bg-[#141722] text-[#0c0d12] dark:text-white"
                            />

                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                {filteredLoans.map((loan) => (
                                    <button
                                        key={loan._id}
                                        type="button"
                                        onClick={() => handleSelectLoan(loan)}
                                        className="w-full p-3 text-left rounded-xl border border-hairline-light dark:border-hairline-dark hover:border-primary dark:hover:border-primary-bright hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-all flex items-center justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs font-bold text-primary dark:text-primary-bright">
                                                    {loan.loanNumber}
                                                </span>
                                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {loan.customerId?.firstName} {loan.customerId?.lastName}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                EMI: <span className="font-medium text-gray-700 dark:text-gray-300 tabular-nums">{formatCurrency(loan.monthlyEMI)}</span> · Balance: <span className="font-bold text-gray-900 dark:text-white tabular-nums">{formatCurrency(loan.remainingBalance)}</span>
                                            </p>
                                        </div>
                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary dark:text-primary-bright">
                                            Select
                                        </span>
                                    </button>
                                ))}

                                {filteredLoans.length === 0 && (
                                    <div className="py-8 text-center text-gray-500 text-xs">
                                        No active loans match "{loanSearch}".
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-mono font-bold text-primary dark:text-primary-bright">
                                    {selectedLoan.loanNumber}
                                </span>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    {selectedLoan.customerId?.firstName} {selectedLoan.customerId?.lastName}
                                </h3>
                                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300 mt-1">
                                    <span>Regular EMI: <strong>{formatCurrency(selectedLoan.monthlyEMI)}</strong></span>
                                    <span>Total Balance: <strong className="text-primary dark:text-primary-bright">{formatCurrency(selectedLoan.remainingBalance)}</strong></span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                    Active
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment Form */}
                {selectedLoan && (
                    <form onSubmit={handleSubmit(onSubmit)} className="card p-6 sm:p-7 space-y-5 bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl shadow-sm">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-hairline-light dark:border-hairline-dark pb-3">
                            2. Transaction Details
                        </h2>

                        {/* Overpayment Alert */}
                        {isOverpaying && (
                            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
                                <FiAlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 text-xs text-amber-800 dark:text-amber-300">
                                    <p className="font-semibold text-sm">Amount exceeds remaining balance</p>
                                    <p className="mt-0.5">
                                        The entered amount is ₹{overpaymentDiff.toLocaleString()} greater than the loan's total remaining balance of ₹{selectedLoan.remainingBalance.toLocaleString()}.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleCapToBalance}
                                        className="mt-2 inline-flex items-center gap-1 font-bold underline hover:text-amber-900 dark:hover:text-amber-100"
                                    >
                                        <FiCheck className="w-3.5 h-3.5" /> Set amount to exact balance (₹{selectedLoan.remainingBalance.toLocaleString()})
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="label text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Amount Received (₹) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    {...register('amountPaid', { required: true, min: 1 })}
                                    className={`input rounded-xl h-11 text-base font-bold tabular-nums ${isOverpaying ? 'border-amber-400 focus:ring-amber-400' : ''}`}
                                    placeholder="e.g. 5000"
                                />
                            </div>

                            <div className="form-group">
                                <label className="label text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Payment Method *
                                </label>
                                <select {...register('paymentMethod')} className="input rounded-xl h-11 text-sm capitalize">
                                    <option value="bank_transfer">Bank Transfer (NEFT/IMPS)</option>
                                    <option value="upi">UPI / GPay / PhonePe</option>
                                    <option value="cash">Cash In Hand</option>
                                    <option value="cheque">Cheque</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="label text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Payment Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    {...register('paymentDate', { required: true })}
                                    className="input rounded-xl h-11 text-sm"
                                />
                            </div>

                            <div className="form-group">
                                <label className="label text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Reference / UTR / Cheque #
                                </label>
                                <input
                                    type="text"
                                    {...register('referenceId')}
                                    placeholder="e.g. UTR12345678"
                                    className="input rounded-xl h-11 text-sm font-mono"
                                />
                            </div>
                        </div>

                        {/* Optional Bank Details for transfers */}
                        {['bank_transfer', 'upi'].includes(paymentMethod) && (
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-surface-deep/40 border border-hairline-light dark:border-hairline-dark space-y-3">
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Bank Verification Info (Optional)
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Bank Name (e.g. HDFC)"
                                        {...register('bankName')}
                                        className="input rounded-xl text-xs h-9"
                                    />
                                    <input
                                        type="text"
                                        placeholder="UPI ID / Sender Account"
                                        {...register('upiId')}
                                        className="input rounded-xl text-xs h-9"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="label text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Notes
                            </label>
                            <textarea
                                {...register('notes')}
                                rows={2}
                                className="input rounded-xl text-sm"
                                placeholder="Payment remarks or borrower confirmation..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setSelectedLoan(null)}
                                className="btn btn-secondary h-11 px-5 rounded-xl text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn btn-primary h-11 px-6 rounded-xl text-sm font-semibold gap-2 shadow-sm"
                            >
                                <FiSave className="w-4 h-4" />
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
