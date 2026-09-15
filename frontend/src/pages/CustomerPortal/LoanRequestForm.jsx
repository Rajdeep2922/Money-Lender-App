import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loanRequestAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { X, ShieldCheck } from 'lucide-react';

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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="border-b border-hairline-light dark:border-hairline-dark px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Request a Loan</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                            Submit financing application to <span className="font-medium text-gray-900 dark:text-white">{lender.businessName}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-surface-border text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-surface-border transition-colors flex items-center justify-center cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Lender info strip */}
                <div className="px-6 py-2.5 bg-gray-50/80 dark:bg-canvas-dark/40 border-b border-hairline-light dark:border-hairline-dark flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light flex items-center justify-center font-bold text-xs">
                        {lender.businessName?.charAt(0)}
                    </div>
                    <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 font-mono tabular-nums">
                        <span>⭐ {(lender.rating ?? 4.0).toFixed(1)} rating</span>
                        <span>·</span>
                        <span>{lender.interestRate ?? 12}% p.a.</span>
                        {lender.address?.city && (
                            <>
                                <span>·</span>
                                <span className="font-sans">{lender.address.city}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
                    {/* Amount */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                            Requested Amount (₹) <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            {...register('amount', {
                                required: 'Amount is required',
                                min: { value: 1, message: 'Amount must be positive' },
                            })}
                            className="w-full bg-white dark:bg-canvas-dark/50 border border-hairline-light dark:border-hairline-dark rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white text-sm font-mono placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary transition-colors shadow-xs"
                            placeholder="e.g. 50000"
                        />
                        {errors.amount && (
                            <p className="text-rose-500 text-xs mt-1 font-medium">{errors.amount.message}</p>
                        )}
                    </div>

                    {/* Purpose */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                            Loan Purpose <span className="text-rose-500">*</span>
                        </label>
                        <select
                            {...register('purpose', { required: 'Purpose is required' })}
                            className="w-full bg-white dark:bg-canvas-dark/50 border border-hairline-light dark:border-hairline-dark rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary transition-colors shadow-xs cursor-pointer"
                        >
                            <option value="">Select a purpose…</option>
                            {PURPOSES.map((p) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                        {errors.purpose && (
                            <p className="text-rose-500 text-xs mt-1 font-medium">{errors.purpose.message}</p>
                        )}
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                            Personal Note <span className="text-gray-400 font-normal normal-case">(optional)</span>
                        </label>
                        <textarea
                            {...register('message')}
                            rows={3}
                            maxLength={1000}
                            className="w-full bg-white dark:bg-canvas-dark/50 border border-hairline-light dark:border-hairline-dark rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary transition-colors resize-none shadow-xs"
                            placeholder="Briefly state your financing timeline or requirements…"
                        />
                    </div>

                    {/* Security Note */}
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs bg-gray-50/70 dark:bg-canvas-dark/40 border border-hairline-light dark:border-hairline-dark rounded-lg p-2.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Your contact details are encrypted and only revealed to the lender upon request acceptance.</span>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-surface-border dark:hover:bg-surface-border-hover text-gray-700 dark:text-gray-300 text-xs font-semibold py-2.5 rounded-full transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="flex-1 bg-primary hover:bg-primary-hover text-white text-xs font-semibold py-2.5 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
                        >
                            {mutation.isPending ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Submitting…
                                </>
                            ) : (
                                'Submit Application'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoanRequestForm;
