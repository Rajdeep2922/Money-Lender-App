import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loanRequestAPI } from '../../services/api';
import toast from 'react-hot-toast';

const PURPOSES = [
    'Personal',
    'Business',
    'Education',
    'Medical',
    'Home Renovation',
    'Vehicle',
    'Debt Consolidation',
    'Other',
];

/**
 * LoanRequestForm — Modal form to submit a loan request to a specific lender
 */
const LoanRequestForm = ({ lender, onClose }) => {
    const queryClient = useQueryClient();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const mutation = useMutation({
        mutationFn: (data) =>
            loanRequestAPI.create({
                lenderId: lender._id,
                amount: Number(data.amount),
                purpose: data.purpose,
                message: data.message,
            }),
        onSuccess: () => {
            toast.success(`Loan request sent! You'll be notified once the lender responds.`);

            queryClient.invalidateQueries({ queryKey: ['my-loan-requests'] });
            onClose();
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to send loan request');
        },
    });

    const onSubmit = (data) => mutation.mutate(data);

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border-b border-slate-700 px-6 py-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Request a Loan</h2>
                        <p className="text-slate-400 text-sm mt-0.5">
                            from <span className="text-violet-300 font-medium">{lender.businessName}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex items-center justify-center text-lg"
                    >
                        ×
                    </button>
                </div>

                {/* Lender info strip */}
                <div className="px-6 py-3 bg-slate-800/40 border-b border-slate-700/50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm">
                        {lender.businessName?.charAt(0)}
                    </div>
                    <div className="flex gap-4 text-xs text-slate-400">
                        <span>⭐ {(lender.rating ?? 4.0).toFixed(1)} rating</span>
                        <span>💰 {lender.interestRate ?? 12}% p.a.</span>
                        {lender.address?.city && <span>📍 {lender.address.city}</span>}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Loan Amount (₹) <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            {...register('amount', {
                                required: 'Amount is required',
                                min: { value: 1, message: 'Amount must be positive' },
                            })}
                            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                            placeholder="e.g. 50000"
                        />
                        {errors.amount && (
                            <p className="text-red-400 text-xs mt-1">{errors.amount.message}</p>
                        )}
                    </div>

                    {/* Purpose */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Loan Purpose <span className="text-red-400">*</span>
                        </label>
                        <select
                            {...register('purpose', { required: 'Purpose is required' })}
                            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
                        >
                            <option value="">Select a purpose…</option>
                            {PURPOSES.map((p) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                        {errors.purpose && (
                            <p className="text-red-400 text-xs mt-1">{errors.purpose.message}</p>
                        )}
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Additional Message{' '}
                            <span className="text-slate-500 font-normal">(optional)</span>
                        </label>
                        <textarea
                            {...register('message')}
                            rows={3}
                            maxLength={1000}
                            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                            placeholder="Briefly describe your situation or requirements…"
                        />
                    </div>

                    {/* Note */}
                    <p className="text-slate-500 text-xs">
                        🔒 Your detailed information will only be shared with the lender after they accept your request.
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {mutation.isPending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Sending…
                                </>
                            ) : (
                                'Send Request'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoanRequestForm;
