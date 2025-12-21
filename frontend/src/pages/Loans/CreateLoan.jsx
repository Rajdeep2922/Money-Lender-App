import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiArrowLeft, FiSave, FiPercent } from 'react-icons/fi';
import { useCustomers } from '../../hooks/useCustomers';
import { useCreateLoan } from '../../hooks/useLoans';
import { formatCurrency } from '../../utils/formatters';

const loanSchema = z.object({
    customerId: z.string().min(1, 'Customer is required'),
    principal: z.number().min(1000, 'Minimum loan is ₹1,000'),
    monthlyInterestRate: z.number().min(0.1, 'Rate must be > 0').max(50, 'Rate must be < 50%'),
    loanDurationMonths: z.number().int().min(1, 'Min 1 month').max(360, 'Max 360 months'),
    startDate: z.string().min(1, 'Start date is required'),
    notes: z.string().optional(),
});

// Calculate EMI using reducing balance method
const calculateEMI = (principal, rate, months) => {
    const r = rate / 100;
    if (r === 0) return principal / months;
    const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    return Math.round(emi * 100) / 100;
};

export const CreateLoan = () => {
    const navigate = useNavigate();

    const { data: customersData } = useCustomers({ limit: 100 });
    const createLoan = useCreateLoan();

    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(loanSchema),
        defaultValues: {
            principal: 100000,
            monthlyInterestRate: 5,
            loanDurationMonths: 12,
            startDate: new Date().toISOString().split('T')[0],
        },
    });

    const principal = watch('principal');
    const monthlyInterestRate = watch('monthlyInterestRate');
    const loanDurationMonths = watch('loanDurationMonths');

    const calculations = useMemo(() => {
        if (!principal || !monthlyInterestRate || !loanDurationMonths) return null;
        const emi = calculateEMI(principal, monthlyInterestRate, loanDurationMonths);
        const totalPayable = emi * loanDurationMonths;
        const totalInterest = totalPayable - principal;
        return { emi, totalPayable, totalInterest };
    }, [principal, monthlyInterestRate, loanDurationMonths]);

    const onSubmit = async (data) => {
        try {
            await createLoan.mutateAsync(data);
            navigate('/loans');
        } catch (error) {
            console.error('Error creating loan:', error);
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
                            <label className="label">Monthly Interest Rate (%) *</label>
                            <input
                                type="number"
                                step="0.1"
                                {...register('monthlyInterestRate', { valueAsNumber: true })}
                                className={`input ${errors.monthlyInterestRate ? 'input-error' : ''}`}
                            />
                            {errors.monthlyInterestRate && <p className="error-text">{errors.monthlyInterestRate.message}</p>}
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
                </div>

                {/* Live Calculation Preview */}
                {calculations && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card p-6 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 border-teal-200 dark:border-teal-800"
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
