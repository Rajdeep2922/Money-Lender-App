import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Save, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLoanPolicy, useUpdateLoanPolicy } from '../../hooks/useLender';
import { PageLoader } from '../../components/common/LoadingSpinner';

const GRACE_OPTIONS = [
    { value: 0, label: '0 Days (No Grace Period)' },
    { value: 3, label: '3 Days' },
    { value: 5, label: '5 Days' },
    { value: 7, label: '7 Days' },
    { value: 15, label: '15 Days' },
    { value: 30, label: '30 Days' },
];

const FORECLOSURE_OPTIONS = [
    { value: 'NOT_ALLOWED',      label: 'Not Allowed' },
    { value: 'WITHOUT_DISCOUNT', label: 'Allowed – No Discount (full balance)' },
    { value: 'MANUAL_DISCOUNT',  label: 'Allowed – Manual Discount at lender discretion' },
];

const PAYMENT_METHODS = [
    { value: 'CASH',          label: 'Cash' },
    { value: 'UPI',           label: 'UPI' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'CHEQUE',        label: 'Cheque' },
    { value: 'IMPS',          label: 'IMPS' },
    { value: 'NEFT',          label: 'NEFT' },
];

const LoanPolicySettings = () => {
    const { data: loanPolicy, isLoading } = useLoanPolicy();
    const updateLoanPolicy = useUpdateLoanPolicy();

    const { register, handleSubmit, watch, reset, setValue } = useForm({
        defaultValues: {
            defaultInterestRate: 12,
            defaultGracePeriodDays: 0,
            defaultLateFeeType: 'none',
            defaultLateFeeValue: 0,
            defaultForeclosurePolicy: 'WITHOUT_DISCOUNT',
            defaultMaxTenureMonths: 360,
            defaultPaymentMethods: ['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'IMPS', 'NEFT'],
            interestCalculationType: 'SIMPLE',
        },
    });

    const lateFeeType = watch('defaultLateFeeType');

    useEffect(() => {
        if (loanPolicy) {
            reset({
                defaultInterestRate: loanPolicy.defaultInterestRate ?? 12,
                defaultGracePeriodDays: loanPolicy.defaultGracePeriodDays ?? 0,
                defaultLateFeeType: loanPolicy.defaultLateFeeType ?? 'none',
                defaultLateFeeValue: loanPolicy.defaultLateFeeValue ?? 0,
                defaultForeclosurePolicy: loanPolicy.defaultForeclosurePolicy ?? 'WITHOUT_DISCOUNT',
                defaultMaxTenureMonths: loanPolicy.defaultMaxTenureMonths ?? 360,
                defaultPaymentMethods: loanPolicy.defaultPaymentMethods ?? ['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'IMPS', 'NEFT'],
                interestCalculationType: loanPolicy.interestCalculationType ?? 'SIMPLE',
            });
        }
    }, [loanPolicy, reset]);

    const handlePaymentMethodToggle = (method, checked, currentMethods) => {
        const arr = Array.isArray(currentMethods) ? [...currentMethods] : [];
        if (checked) {
            if (!arr.includes(method)) arr.push(method);
        } else {
            const idx = arr.indexOf(method);
            if (idx > -1) arr.splice(idx, 1);
        }
        setValue('defaultPaymentMethods', arr, { shouldDirty: true });
    };

    const selectedMethods = watch('defaultPaymentMethods') || [];

    const onSubmit = async (data) => {
        const toastId = toast.loading('Saving loan policy...');
        try {
            await updateLoanPolicy.mutateAsync({
                ...data,
                defaultInterestRate: Number(data.defaultInterestRate),
                defaultGracePeriodDays: Number(data.defaultGracePeriodDays),
                defaultLateFeeValue: Number(data.defaultLateFeeValue),
                defaultMaxTenureMonths: Number(data.defaultMaxTenureMonths),
            });
            toast.success('Loan policy saved!', { id: toastId });
        } catch (err) {
            toast.error('Failed to save policy', { id: toastId });
        }
    };

    if (isLoading) return <PageLoader />;

    const inputClass = "w-full px-3.5 py-2.5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl bg-white dark:bg-black/30 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
    const labelClass = "block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
                    Loan Policy Defaults
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                    These are the default settings applied to every new loan. They can be overridden per individual loan at creation time.
                </p>
            </div>

            {/* Interest & Tenure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Default Interest Rate (%/month)</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        {...register('defaultInterestRate')}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className={labelClass}>Default Max Loan Tenure (months)</label>
                    <input
                        type="number"
                        min="1"
                        max="360"
                        {...register('defaultMaxTenureMonths')}
                        className={inputClass}
                    />
                </div>
            </div>

            {/* Grace Period */}
            <div>
                <label className={labelClass}>Default Grace Period</label>
                <select {...register('defaultGracePeriodDays')} className={inputClass}>
                    {GRACE_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">No overdue penalty will apply during the grace period.</p>
            </div>

            {/* Late Fee */}
            <div className="space-y-3">
                <label className={labelClass}>Default Late Fee Type</label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { value: 'none', label: 'No Penalty' },
                        { value: 'fixed', label: 'Fixed (₹)' },
                        { value: 'percentage', label: 'Percentage (%)' },
                    ].map(opt => (
                        <label key={opt.value} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                            lateFeeType === opt.value
                                ? 'border-primary/50 bg-primary/[0.04] dark:bg-primary/[0.08]'
                                : 'border-black/[0.08] dark:border-white/[0.08] hover:border-black/[0.15] dark:hover:border-white/[0.15]'
                        }`}>
                            <input
                                type="radio"
                                value={opt.value}
                                {...register('defaultLateFeeType')}
                                className="accent-primary"
                            />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{opt.label}</span>
                        </label>
                    ))}
                </div>
                {lateFeeType !== 'none' && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <label className={labelClass}>
                            {lateFeeType === 'fixed' ? 'Late Fee Amount (₹)' : 'Late Fee Percentage (%)'}
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            {...register('defaultLateFeeValue')}
                            className={inputClass}
                        />
                    </motion.div>
                )}
            </div>

            {/* Foreclosure Policy */}
            <div>
                <label className={labelClass}>Default Foreclosure Policy</label>
                <div className="space-y-2">
                    {FORECLOSURE_OPTIONS.map(opt => (
                        <label key={opt.value} className="flex items-center gap-3 p-3 rounded-xl border border-black/[0.08] dark:border-white/[0.08] cursor-pointer hover:border-black/[0.15] dark:hover:border-white/[0.15] transition-colors">
                            <input
                                type="radio"
                                value={opt.value}
                                {...register('defaultForeclosurePolicy')}
                                className="accent-primary"
                            />
                            <span className="text-xs text-gray-700 dark:text-gray-300">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Payment Methods */}
            <div>
                <label className={labelClass}>Default Accepted Payment Methods</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PAYMENT_METHODS.map(method => (
                        <label key={method.value} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                            selectedMethods.includes(method.value)
                                ? 'border-primary/50 bg-primary/[0.04] dark:bg-primary/[0.08]'
                                : 'border-black/[0.08] dark:border-white/[0.08]'
                        }`}>
                            <input
                                type="checkbox"
                                checked={selectedMethods.includes(method.value)}
                                onChange={e => handlePaymentMethodToggle(method.value, e.target.checked, selectedMethods)}
                                className="accent-primary"
                            />
                            <span className="text-xs text-gray-700 dark:text-gray-300">{method.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Interest Calculation Type */}
            <div>
                <label className={labelClass}>Interest Calculation Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                        { value: 'SIMPLE', label: 'Simple Interest', available: true },
                        { value: 'FLAT', label: 'Flat Rate', available: false },
                        { value: 'REDUCING_BALANCE', label: 'Reducing Balance', available: false },
                    ].map(opt => (
                        <label key={opt.value} className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                            !opt.available
                                ? 'border-black/[0.04] dark:border-white/[0.04] bg-gray-50 dark:bg-white/[0.02] opacity-60 cursor-not-allowed'
                                : 'border-black/[0.08] dark:border-white/[0.08] cursor-pointer hover:border-primary/40'
                        }`}>
                            <input
                                type="radio"
                                value={opt.value}
                                disabled={!opt.available}
                                {...register('interestCalculationType')}
                                className="accent-primary"
                            />
                            <div>
                                <span className="text-xs text-gray-700 dark:text-gray-300">{opt.label}</span>
                                {!opt.available && (
                                    <span className="block text-[10px] text-gray-400 dark:text-gray-500">Coming soon</span>
                                )}
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                <span>These are <strong>default settings</strong>. Individual loans can override any of these values at the time of creation.</span>
            </div>

            <button
                type="submit"
                disabled={updateLoanPolicy.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-sm active:scale-[0.98] transition-all disabled:opacity-50"
            >
                <Save className="w-3.5 h-3.5" />
                {updateLoanPolicy.isPending ? 'Saving...' : 'Save Loan Policy'}
            </button>
        </form>
    );
};

export default LoanPolicySettings;
