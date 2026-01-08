import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiArrowLeft, FiSave, FiPercent } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCustomers } from '../../hooks/useCustomers';
import { useLoan, useUpdateLoan } from '../../hooks/useLoans';
import { formatCurrency } from '../../utils/formatters';
import { PageLoader } from '../../components/common/LoadingSpinner';
// Import from shared calculation module - SINGLE SOURCE OF TRUTH
import { calculateMonthlyEMI, calculateCompoundEMI } from '../../../../shared/loanCalculations.js';

const loanSchema = z.object({
    customerId: z.string().min(1, 'Customer is required'),
    principal: z.number().min(1000, 'Minimum loan is ₹1,000'),
    monthlyInterestRate: z.number().min(0.1, 'Rate must be > 0').max(50, 'Rate must be < 50%'),
    loanDurationMonths: z.number().int().min(1, 'Min 1 month').max(360, 'Max 360 months'),
    startDate: z.string().min(1, 'Start date is required'),
    interestType: z.enum(['simple', 'compound']),
    notes: z.string().optional(),
});



const EditLoan = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: loan, isLoading: loadingLoan } = useLoan(id);
    const { data: customersData } = useCustomers({ limit: 100 });
    const updateLoan = useUpdateLoan();

    const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(loanSchema),
        defaultValues: {
            principal: 0,
            monthlyInterestRate: 0,
            loanDurationMonths: 12,
            startDate: new Date().toISOString().split('T')[0],
            interestType: 'simple',
        },
    });

    // Populate form when loan data is available
    useEffect(() => {
        if (loan) {
            reset({
                customerId: loan.customerId?._id || loan.customerId,
                principal: loan.principal,
                monthlyInterestRate: loan.monthlyInterestRate,
                loanDurationMonths: loan.loanDurationMonths,
                startDate: new Date(loan.startDate).toISOString().split('T')[0],
                interestType: loan.interestType || 'simple',
                notes: loan.notes || '',
            });
        }
    }, [loan, reset]);

    const principal = watch('principal');
    const monthlyInterestRate = watch('monthlyInterestRate');
    const loanDurationMonths = watch('loanDurationMonths');
    const interestType = watch('interestType');

    const calculations = useMemo(() => {
        if (!principal || !monthlyInterestRate || !loanDurationMonths) return null;
        const emi = interestType === 'compound'
            ? calculateCompoundEMI(principal, monthlyInterestRate, loanDurationMonths)
            : calculateMonthlyEMI(principal, monthlyInterestRate, loanDurationMonths);
        const totalPayable = emi * loanDurationMonths;
        const totalInterest = totalPayable - principal;
        return { emi, totalPayable, totalInterest };
    }, [principal, monthlyInterestRate, loanDurationMonths, interestType]);

    const onSubmit = async (data) => {
        const toastId = toast.loading('Updating loan...');
        try {
            await updateLoan.mutateAsync({ id, data });
            toast.success('Loan updated successfully', { id: toastId });
            navigate(`/loans/${id}`);
        } catch (error) {
            console.error('Error updating loan:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update loan';
            toast.error(errorMessage, { id: toastId });
        }
    };

    if (loadingLoan) return <PageLoader />;

    if (!loan) {
        return <div className="text-center p-8">Loan not found</div>;
    }

    if (loan.status !== 'pending_approval') {
        return (
            <div className="text-center p-8">
                <p className="text-red-500 mb-4">Cannot edit loan. Only Pending loans can be edited.</p>
                <button onClick={() => navigate(-1)} className="btn btn-secondary">Go Back</button>
            </div>
        );
    }

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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Loan</h1>
                    <p className="text-gray-500 dark:text-gray-400">Modify loan details (Pending Approval)</p>
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
                            <h3 className="font-semibold text-gray-900 dark:text-white">Updated Loan Summary</h3>
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
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default EditLoan;
