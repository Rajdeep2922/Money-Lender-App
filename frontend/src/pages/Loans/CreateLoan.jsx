import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiArrowLeft, FiSave, FiPercent, FiEdit3, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCustomers } from '../../hooks/useCustomers';
import { useCreateLoan } from '../../hooks/useLoans';
import { formatCurrency } from '../../utils/formatters';

const loanSchema = z.object({
    customerId: z.string().min(1, 'Customer is required'),
    principal: z.number().min(1000, 'Minimum loan is ₹1,000'),
    monthlyInterestRate: z.number().min(0).max(50, 'Rate must be < 50%').optional(),
    loanDurationMonths: z.number().int().min(1, 'Min 1 month').max(360, 'Max 360 months'),
    startDate: z.string().min(1, 'Start date is required'),
    interestType: z.enum(['simple', 'compound']),
    notes: z.string().optional(),
});

// Calculate EMI using Flat Rate method (Simple Interest)
const calculateSimpleEMI = (principal, rate, months) => {
    const monthlyInterest = principal * (rate / 100) * months;
    const totalAmount = principal + monthlyInterest;
    return Math.round((totalAmount / months) * 100) / 100;
};

// Calculate EMI using Reducing Balance method (Compound Interest)
const calculateCompoundEMI = (principal, rate, months) => {
    const r = rate / 100;
    if (r === 0) return Math.round((principal / months) * 100) / 100;
    const factor = Math.pow(1 + r, months);
    const emi = (principal * r * factor) / (factor - 1);
    return Math.round(emi * 100) / 100;
};

// Reverse calculate interest rate from EMI (Simple Interest)
// Formula: EMI = (P + P*r*n) / n => r = (EMI*n - P) / (P*n)
const calculateSimpleRateFromEMI = (principal, emi, months) => {
    const totalPayable = emi * months;
    const totalInterest = totalPayable - principal;
    const rate = (totalInterest / (principal * months)) * 100;
    return Math.round(rate * 100) / 100;
};

// Reverse calculate interest rate from EMI (Compound Interest) using binary search
const calculateCompoundRateFromEMI = (principal, emi, months) => {
    let low = 0;
    let high = 50; // Max 50% monthly rate
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

    const { data: customersData } = useCustomers({ limit: 100 });
    const createLoan = useCreateLoan();

    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(loanSchema),
        defaultValues: {
            principal: 100000,
            monthlyInterestRate: 5,
            loanDurationMonths: 12,
            startDate: new Date().toISOString().split('T')[0],
            interestType: 'simple',
        },
    });

    const principal = watch('principal');
    const monthlyInterestRate = watch('monthlyInterestRate');
    const loanDurationMonths = watch('loanDurationMonths');
    const interestType = watch('interestType');

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
            const totalInterest = totalPayable - principal;

            return { emi, totalPayable, totalInterest, calculatedRate: rate };
        } else if (monthlyInterestRate) {
            const emi = interestType === 'compound'
                ? calculateCompoundEMI(principal, monthlyInterestRate, loanDurationMonths)
                : calculateSimpleEMI(principal, monthlyInterestRate, loanDurationMonths);
            const totalPayable = emi * loanDurationMonths;
            const totalInterest = totalPayable - principal;
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

    const onSubmit = async (data) => {
        const toastId = toast.loading('Creating loan...');
        try {
            // If manual EMI mode, include the manual EMI value
            const submitData = isManualEMI && manualEMI
                ? { ...data, manualEMI: parseFloat(manualEMI) }
                : data;

            console.log('Submitting loan data:', submitData);
            console.log('Manual EMI mode:', isManualEMI);
            console.log('Manual EMI value:', manualEMI);

            await createLoan.mutateAsync(submitData);
            toast.success('Loan created successfully', { id: toastId });
            navigate('/loans');
        } catch (error) {
            console.error('Error creating loan:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create loan';
            toast.error(errorMessage, { id: toastId });
        }
    };

    const customers = customersData?.customers || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
        >
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Loan</h1>
                    <p className="text-gray-500 dark:text-gray-400">Issue a new loan to a customer</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Loan Details */}
                <div className="card p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Loan Details</h2>

                    <div className="form-group">
                        <label className="label">Select Customer *</label>
                        <select {...register('customerId')} className={`input ${errors.customerId ? 'input-error' : ''}`}>
                            <option value="">Choose a customer...</option>
                            {customers.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.firstName} {c.lastName} - {c.email}
                                </option>
                            ))}
                        </select>
                        {errors.customerId && <p className="error-text">{errors.customerId.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="label">Principal Amount (₹) *</label>
                            <input
                                type="number"
                                {...register('principal', { valueAsNumber: true })}
                                className={`input ${errors.principal ? 'input-error' : ''}`}
                            />
                            {errors.principal && <p className="error-text">{errors.principal.message}</p>}
                        </div>

                        <div className="form-group">
                            <div className="flex items-center justify-between mb-2">
                                <label className="label mb-0">Monthly Interest Rate (%) *</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsManualEMI(!isManualEMI);
                                        if (!isManualEMI && calculations?.emi) {
                                            setManualEMI(calculations.emi.toString());
                                        }
                                    }}
                                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors ${isManualEMI
                                        ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                        }`}
                                >
                                    {isManualEMI ? <FiEdit3 className="w-3 h-3" /> : <FiZap className="w-3 h-3" />}
                                    {isManualEMI ? 'Manual EMI' : 'Auto EMI'}
                                </button>
                            </div>
                            {!isManualEMI ? (
                                <>
                                    <input
                                        type="number"
                                        step="0.1"
                                        {...register('monthlyInterestRate', { valueAsNumber: true })}
                                        className={`input ${errors.monthlyInterestRate ? 'input-error' : ''}`}
                                    />
                                    {errors.monthlyInterestRate && <p className="error-text">{errors.monthlyInterestRate.message}</p>}
                                </>
                            ) : (
                                <div className="space-y-2">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={manualEMI}
                                            onChange={(e) => setManualEMI(e.target.value)}
                                            placeholder="Enter monthly EMI amount"
                                            className="input pr-16"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">EMI</span>
                                    </div>
                                    {calculations?.calculatedRate !== null && calculations?.calculatedRate !== undefined && (
                                        <p className="text-sm text-teal-600 dark:text-teal-400">
                                            Calculated Rate: <strong>{calculations.calculatedRate}%</strong> per month
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="label">Duration (Months) *</label>
                            <input
                                type="number"
                                {...register('loanDurationMonths', { valueAsNumber: true })}
                                className={`input ${errors.loanDurationMonths ? 'input-error' : ''}`}
                            />
                            {errors.loanDurationMonths && <p className="error-text">{errors.loanDurationMonths.message}</p>}
                        </div>

                        <div className="form-group">
                            <label className="label">Start Date *</label>
                            <input
                                type="date"
                                {...register('startDate')}
                                className={`input ${errors.startDate ? 'input-error' : ''}`}
                            />
                            {errors.startDate && <p className="error-text">{errors.startDate.message}</p>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Notes</label>
                        <textarea {...register('notes')} rows={2} className="input" placeholder="Purpose of loan, special conditions..." />
                    </div>

                    {/* Interest Type Toggle */}
                    <div className="form-group">
                        <label className="label">Interest Calculation Method *</label>
                        <div className="flex gap-4 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    value="simple"
                                    {...register('interestType')}
                                    className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Simple Interest</span>
                                <span className="text-xs text-gray-500">(Flat Rate)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    value="compound"
                                    {...register('interestType')}
                                    className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Compound Interest</span>
                                <span className="text-xs text-gray-500">(Reducing Balance)</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Live Calculation Preview */}
                {calculations && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card p-6 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-teal-800/20 border-teal-200 dark:border-teal-800"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <FiPercent className="w-5 h-5 text-teal-600" />
                            <h3 className="font-semibold text-gray-900 dark:text-white">Loan Summary</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Monthly EMI</p>
                                <p className="text-xl font-bold text-teal-600">{formatCurrency(calculations.emi)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Interest</p>
                                <p className="text-xl font-bold text-orange-600">{formatCurrency(calculations.totalInterest)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Payable</p>
                                <p className="text-xl font-bold text-purple-600">{formatCurrency(calculations.totalPayable)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Interest %</p>
                                <p className="text-xl font-bold text-gray-700 dark:text-gray-300">
                                    {((calculations.totalInterest / principal) * 100).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                        <FiSave className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Creating...' : 'Create Loan'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default CreateLoan;
