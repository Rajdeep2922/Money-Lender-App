import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiArrowLeft, FiSave, FiPercent, FiEdit3, FiZap, FiChevronDown, FiChevronUp, FiPlus, FiX, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCustomers, useCreateCustomer } from '../../hooks/useCustomers';
import { useCreateLoan } from '../../hooks/useLoans';
import { useLoanPolicy } from '../../hooks/useLender';
import { formatCurrency } from '../../utils/formatters';
import { calculateMonthlyEMI, calculateCompoundEMI } from '../../../../shared/loanCalculations.js';

const loanSchema = z.object({
    customerId: z.string().min(1, 'Customer is required'),
    principal: z.number().min(1000, 'Minimum loan is ₹1,000'),
    monthlyInterestRate: z.number().min(0).max(50, 'Rate must be < 50%').optional(),
    loanDurationMonths: z.number().int().min(1, 'Min 1 month').max(360, 'Max 360 months'),
    startDate: z.string().min(1, 'Start date is required'),
    interestType: z.enum(['simple', 'compound']),
    notes: z.string().optional(),
});

// Reverse calculate interest rate from EMI (Simple Interest)
const calculateSimpleRateFromEMI = (principal, emi, months) => {
    if (!principal || !months) return 0;
    const totalPayable = emi * months;
    const totalInterest = totalPayable - principal;
    if (totalInterest < 0) return 0; // Guard against negative interest
    const rate = (totalInterest / (principal * months)) * 100;
    return Math.round(rate * 100) / 100;
};

// Reverse calculate interest rate from EMI (Compound Interest) using binary search
const calculateCompoundRateFromEMI = (principal, emi, months) => {
    if (!principal || !months || emi * months < principal) return 0;
    let low = 0;
    let high = 50;
    let mid;
    const tolerance = 0.01;

    for (let i = 0; i < 100; i++) {
        mid = (low + high) / 2;
        const calculatedEMI = calculateCompoundEMI(principal, mid, months);

        if (Math.abs(calculatedEMI - emi) < tolerance) {
            return Math.round(mid * 100) / 100;
        }

        if (calculatedEMI < emi) {
            low = mid;
        } else {
            high = mid;
        }
    }
    return Math.round(mid * 100) / 100;
};

export const CreateLoan = () => {
    const navigate = useNavigate();
    const [isManualEMI, setIsManualEMI] = useState(false);
    const [manualEMI, setManualEMI] = useState('');
    const [policyExpanded, setPolicyExpanded] = useState(false);
    const [quickCustomerModal, setQuickCustomerModal] = useState(false);
    const [newCustomerForm, setNewCustomerForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });

    const { data: customersData, refetch: refetchCustomers } = useCustomers({ limit: 100 });
    const createCustomerMutation = useCreateCustomer();
    const createLoan = useCreateLoan();
    const { data: loanPolicy } = useLoanPolicy();

    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(loanSchema),
        defaultValues: {
            principal: 100000,
            monthlyInterestRate: 5,
            loanDurationMonths: 12,
            startDate: new Date().toISOString().split('T')[0],
            interestType: 'simple',
            gracePeriodDays: undefined,
            lateFeeType: undefined,
            lateFeeValue: undefined,
            foreclosurePolicy: undefined,
        },
    });

    const principal = watch('principal');
    const monthlyInterestRate = watch('monthlyInterestRate');
    const loanDurationMonths = watch('loanDurationMonths');
    const interestType = watch('interestType');

    // Edge Case Guard: Minimum manual EMI cannot be less than principal / months
    const minManualEMI = principal && loanDurationMonths ? Math.ceil(principal / loanDurationMonths) : 0;
    const isEmiTooLow = isManualEMI && manualEMI && parseFloat(manualEMI) < minManualEMI;

    // Calculate derived values based on mode
    const calculations = useMemo(() => {
        if (!principal || !loanDurationMonths) return null;

        if (isManualEMI && manualEMI) {
            const emi = parseFloat(manualEMI);
            if (isNaN(emi) || emi <= 0) return null;

            // Calculate interest rate from EMI
            const rate = interestType === 'compound'
                ? calculateCompoundRateFromEMI(principal, emi, loanDurationMonths)
                : calculateSimpleRateFromEMI(principal, emi, loanDurationMonths);

            const totalPayable = emi * loanDurationMonths;
            const totalInterest = Math.max(0, totalPayable - principal);

            return { emi, totalPayable, totalInterest, calculatedRate: rate };
        } else if (monthlyInterestRate) {
            const emi = interestType === 'compound'
                ? calculateCompoundEMI(principal, monthlyInterestRate, loanDurationMonths)
                : calculateMonthlyEMI(principal, monthlyInterestRate, loanDurationMonths);
            const totalPayable = emi * loanDurationMonths;
            const totalInterest = Math.max(0, totalPayable - principal);
            return { emi, totalPayable, totalInterest, calculatedRate: null };
        }
        return null;
    }, [principal, monthlyInterestRate, loanDurationMonths, interestType, isManualEMI, manualEMI]);

    // Update the interest rate field when manual EMI changes
    useEffect(() => {
        if (isManualEMI && calculations?.calculatedRate !== null && calculations?.calculatedRate !== undefined) {
            setValue('monthlyInterestRate', calculations.calculatedRate);
        }
    }, [calculations?.calculatedRate, isManualEMI, setValue]);

    const handleQuickCustomerSubmit = async (e) => {
        e.preventDefault();
        if (!newCustomerForm.firstName || !newCustomerForm.lastName || !newCustomerForm.email || !newCustomerForm.phone) {
            toast.error('Please fill all required customer fields');
            return;
        }

        const toastId = toast.loading('Adding customer...');
        try {
            const response = await createCustomerMutation.mutateAsync(newCustomerForm);
            const created = response.data?.customer || response.customer;
            await refetchCustomers();
            if (created?._id) {
                setValue('customerId', created._id);
            }
            toast.success('Customer added and selected!', { id: toastId });
            setQuickCustomerModal(false);
            setNewCustomerForm({ firstName: '', lastName: '', email: '', phone: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Failed to create customer', { id: toastId });
        }
    };

    const onSubmit = async (data) => {
        if (isEmiTooLow) {
            toast.error(`Manual EMI cannot be less than ₹${minManualEMI.toLocaleString()} (below principal fraction).`);
            return;
        }

        const toastId = toast.loading('Creating loan...');
        try {
            const submitData = isManualEMI && manualEMI
                ? { ...data, manualEMI: parseFloat(manualEMI) }
                : data;

            if (data.gracePeriodDays !== undefined && data.gracePeriodDays !== '') {
                submitData.gracePeriodDays = Number(data.gracePeriodDays);
            }
            if (data.lateFeeType && data.lateFeeType !== '') {
                submitData.lateFeeType = data.lateFeeType;
            }
            if (data.lateFeeValue !== undefined && data.lateFeeValue !== '') {
                submitData.lateFeeValue = Number(data.lateFeeValue);
            }
            if (data.foreclosurePolicy && data.foreclosurePolicy !== '') {
                submitData.foreclosurePolicy = data.foreclosurePolicy;
            }

            await createLoan.mutateAsync(submitData);
            toast.success('Loan created successfully', { id: toastId });
            navigate('/loans');
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create loan';
            toast.error(errorMessage, { id: toastId });
        }
    };

    const customers = customersData?.customers || [];

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
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Create Loan</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Issue a new loan agreement to a borrower</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Loan Details Card */}
                <div className="card p-6 sm:p-7 space-y-6 bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl shadow-sm">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-hairline-light dark:border-hairline-dark pb-3">
                        Loan Parameters
                    </h2>

                    {/* Customer Select + Inline Quick Add */}
                    <div className="form-group">
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="label mb-0 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Select Borrower *
                            </label>
                            <button
                                type="button"
                                onClick={() => setQuickCustomerModal(true)}
                                className="text-xs font-semibold text-primary dark:text-primary-bright hover:underline flex items-center gap-1"
                            >
                                <FiPlus className="w-3.5 h-3.5" /> Quick Add Customer
                            </button>
                        </div>
                        <select
                            {...register('customerId')}
                            className={`input rounded-xl h-11 text-sm border-hairline-light dark:border-hairline-dark ${errors.customerId ? 'input-error' : ''}`}
                        >
                            <option value="">Choose a customer...</option>
                            {customers.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.firstName} {c.lastName} · {c.phone || c.email}
                                </option>
                            ))}
                        </select>
                        {errors.customerId && <p className="error-text text-xs mt-1">{errors.customerId.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Principal Amount */}
                        <div className="form-group">
                            <label className="label text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Principal Amount (₹) *
                            </label>
                            <input
                                type="number"
                                {...register('principal', { valueAsNumber: true })}
                                className={`input rounded-xl h-11 text-sm font-semibold tabular-nums ${errors.principal ? 'input-error' : ''}`}
                                placeholder="100000"
                            />
                            {errors.principal && <p className="error-text text-xs mt-1">{errors.principal.message}</p>}
                        </div>

                        {/* Interest Rate / Manual EMI */}
                        <div className="form-group">
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="label mb-0 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    {isManualEMI ? 'Fixed Monthly EMI (₹) *' : 'Monthly Interest Rate (%) *'}
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsManualEMI(!isManualEMI);
                                        if (!isManualEMI && calculations?.emi) {
                                            setManualEMI(calculations.emi.toString());
                                        }
                                    }}
                                    className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-full font-medium transition-all ${
                                        isManualEMI
                                            ? 'bg-primary text-white shadow-sm font-semibold'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                                    }`}
                                >
                                    {isManualEMI ? <FiEdit3 className="w-3 h-3" /> : <FiZap className="w-3 h-3" />}
                                    {isManualEMI ? 'Manual EMI Mode' : 'Auto EMI Mode'}
                                </button>
                            </div>

                            {!isManualEMI ? (
                                <>
                                    <input
                                        type="number"
                                        step="0.1"
                                        {...register('monthlyInterestRate', { valueAsNumber: true })}
                                        className={`input rounded-xl h-11 text-sm tabular-nums ${errors.monthlyInterestRate ? 'input-error' : ''}`}
                                    />
                                    {errors.monthlyInterestRate && <p className="error-text text-xs mt-1">{errors.monthlyInterestRate.message}</p>}
                                </>
                            ) : (
                                <div className="space-y-1.5">
                                    <input
                                        type="number"
                                        value={manualEMI}
                                        onChange={(e) => setManualEMI(e.target.value)}
                                        placeholder={`Min ₹${minManualEMI.toLocaleString()}`}
                                        className={`input rounded-xl h-11 text-sm font-semibold tabular-nums ${isEmiTooLow ? 'border-accent-danger' : ''}`}
                                    />
                                    {isEmiTooLow && (
                                        <div className="flex items-center gap-1.5 text-xs text-accent-danger mt-1">
                                            <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span>Cannot be lower than ₹{minManualEMI.toLocaleString()}/mo (below principal share).</span>
                                        </div>
                                    )}
                                    {calculations?.calculatedRate !== null && !isEmiTooLow && (
                                        <p className="text-xs text-primary dark:text-primary-bright font-medium">
                                            Implied Monthly Rate: <strong>{calculations.calculatedRate}%</strong>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Duration in Months */}
                        <div className="form-group">
                            <label className="label text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Duration (Months) *
                            </label>
                            <input
                                type="number"
                                {...register('loanDurationMonths', { valueAsNumber: true })}
                                className={`input rounded-xl h-11 text-sm tabular-nums ${errors.loanDurationMonths ? 'input-error' : ''}`}
                            />
                            {errors.loanDurationMonths && <p className="error-text text-xs mt-1">{errors.loanDurationMonths.message}</p>}
                        </div>

                        {/* Start Date */}
                        <div className="form-group">
                            <label className="label text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Loan Start Date *
                            </label>
                            <input
                                type="date"
                                {...register('startDate')}
                                className={`input rounded-xl h-11 text-sm ${errors.startDate ? 'input-error' : ''}`}
                            />
                            {errors.startDate && <p className="error-text text-xs mt-1">{errors.startDate.message}</p>}
                        </div>
                    </div>

                    {/* Interest Calculation Method */}
                    <div className="form-group pt-2 border-t border-hairline-light dark:border-hairline-dark">
                        <label className="label text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2.5">
                            Interest Method *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                                interestType === 'simple'
                                    ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary'
                                    : 'border-hairline-light dark:border-hairline-dark bg-white dark:bg-surface-elevated hover:bg-gray-50'
                            }`}>
                                <input
                                    type="radio"
                                    value="simple"
                                    {...register('interestType')}
                                    className="w-4 h-4 text-primary focus:ring-primary"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Simple Interest</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Flat Rate · Constant interest each month</p>
                                </div>
                            </label>

                            <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                                interestType === 'compound'
                                    ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary'
                                    : 'border-hairline-light dark:border-hairline-dark bg-white dark:bg-surface-elevated hover:bg-gray-50'
                            }`}>
                                <input
                                    type="radio"
                                    value="compound"
                                    {...register('interestType')}
                                    className="w-4 h-4 text-primary focus:ring-primary"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Compound Interest</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Reducing Balance · Interest drops with balance</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label className="label text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Notes / Special Terms
                        </label>
                        <textarea
                            {...register('notes')}
                            rows={2}
                            className="input rounded-xl text-sm"
                            placeholder="Loan purpose, guarantor details, or special covenants..."
                        />
                    </div>
                </div>

                {/* Live Calculation Summary */}
                {calculations && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card p-5 sm:p-6 bg-gray-50 dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-hairline-light dark:border-hairline-dark">
                            <div className="flex items-center gap-2">
                                <FiPercent className="w-4 h-4 text-primary" />
                                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Financial Summary</h3>
                            </div>
                            <span className="text-xs font-mono font-medium text-gray-500">
                                {loanDurationMonths} installments
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Monthly EMI</p>
                                <p className="text-xl font-bold text-primary dark:text-primary-bright tabular-nums">
                                    {formatCurrency(calculations.emi)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Interest</p>
                                <p className="text-xl font-bold text-accent-warning tabular-nums">
                                    {formatCurrency(calculations.totalInterest)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Repayment</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">
                                    {formatCurrency(calculations.totalPayable)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Effective Markup</p>
                                <p className="text-xl font-bold text-gray-700 dark:text-gray-300 tabular-nums">
                                    {principal > 0 ? ((calculations.totalInterest / principal) * 100).toFixed(1) : 0}%
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Advanced Policy Overrides (Collapsible) */}
                <div className="card overflow-hidden bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl">
                    <button
                        type="button"
                        onClick={() => setPolicyExpanded(v => !v)}
                        className="w-full flex items-center justify-between px-6 py-4 bg-gray-50/70 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Policy Overrides</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">(Optional — overrides default lender settings)</span>
                        </div>
                        {policyExpanded
                            ? <FiChevronUp className="w-4 h-4 text-gray-400" />
                            : <FiChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    <AnimatePresence>
                        {policyExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="p-6 space-y-4 border-t border-hairline-light dark:border-hairline-dark">
                                    <div className="form-group">
                                        <label className="label text-xs font-semibold text-gray-500">Grace Period Days</label>
                                        <select {...register('gracePeriodDays')} className="input rounded-xl text-sm">
                                            <option value="">Use lender default ({loanPolicy?.defaultGracePeriodDays ?? 0} days)</option>
                                            {[0, 3, 5, 7, 15, 30].map(d => (
                                                <option key={d} value={d}>{d === 0 ? '0 Days (Strict Due Date)' : `${d} Days`}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label className="label text-xs font-semibold text-gray-500">Late Fee Type</label>
                                            <select {...register('lateFeeType')} className="input rounded-xl text-sm">
                                                <option value="">Use default ({loanPolicy?.defaultLateFeeType ?? 'none'})</option>
                                                <option value="none">No Late Fee</option>
                                                <option value="fixed">Fixed Fee (₹)</option>
                                                <option value="percentage">Percentage of EMI (%)</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="label text-xs font-semibold text-gray-500">Late Fee Value</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder={`Default: ${loanPolicy?.defaultLateFeeValue ?? 0}`}
                                                {...register('lateFeeValue')}
                                                className="input rounded-xl text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="label text-xs font-semibold text-gray-500">Foreclosure Policy</label>
                                        <select {...register('foreclosurePolicy')} className="input rounded-xl text-sm">
                                            <option value="">Use default ({loanPolicy?.defaultForeclosurePolicy ?? 'WITHOUT_DISCOUNT'})</option>
                                            <option value="NOT_ALLOWED">Not Allowed</option>
                                            <option value="WITHOUT_DISCOUNT">Allowed — Full Principal</option>
                                            <option value="MANUAL_DISCOUNT">Allowed — Discretionary Discount</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="btn btn-secondary h-11 px-5 rounded-xl text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || isEmiTooLow}
                        className="btn btn-primary h-11 px-6 rounded-xl text-sm font-semibold gap-2 shadow-sm disabled:opacity-50"
                    >
                        <FiSave className="w-4 h-4" />
                        {isSubmitting ? 'Creating Agreement...' : 'Issue Loan'}
                    </button>
                </div>
            </form>

            {/* Quick Add Customer Modal */}
            <AnimatePresence>
                {quickCustomerModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
                        >
                            <button
                                type="button"
                                onClick={() => setQuickCustomerModal(false)}
                                className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <FiX className="w-5 h-5" />
                            </button>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                Quick Add Borrower
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                                Add a new customer record and automatically select them for this loan.
                            </p>

                            <form onSubmit={handleQuickCustomerSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="label text-xs">First Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newCustomerForm.firstName}
                                            onChange={(e) => setNewCustomerForm({ ...newCustomerForm, firstName: e.target.value })}
                                            className="input rounded-xl text-sm"
                                            placeholder="Rahul"
                                        />
                                    </div>
                                    <div>
                                        <label className="label text-xs">Last Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newCustomerForm.lastName}
                                            onChange={(e) => setNewCustomerForm({ ...newCustomerForm, lastName: e.target.value })}
                                            className="input rounded-xl text-sm"
                                            placeholder="Sharma"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="label text-xs">Email Address *</label>
                                    <input
                                        type="email"
                                        required
                                        value={newCustomerForm.email}
                                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                                        className="input rounded-xl text-sm"
                                        placeholder="rahul@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="label text-xs">Phone Number *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={newCustomerForm.phone}
                                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                                        className="input rounded-xl text-sm"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setQuickCustomerModal(false)}
                                        className="btn btn-secondary btn-sm rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createCustomerMutation.isPending}
                                        className="btn btn-primary btn-sm rounded-xl font-semibold"
                                    >
                                        {createCustomerMutation.isPending ? 'Saving...' : 'Add & Select'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CreateLoan;
