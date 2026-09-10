import React, { useState, useEffect } from 'react';
import {
    FiX,
    FiAlertTriangle,
    FiCheckCircle,
    FiArrowLeft,
    FiDownload,
    FiFileText,
    FiLock,
    FiInfo,
    FiRefreshCw
} from 'react-icons/fi';
import {
    buildDefaultsFromLoan,
    formatForeclosureLabel,
    deriveClientWarnings,
} from './agreementBuilderUtils';
import {
    usePreviewCustomAgreement,
    useApproveCustomAgreement,
    useDownloadAgreement,
} from '../../../hooks/useLoans';

const CustomizedAgreementBuilder = ({
    isOpen,
    onClose,
    loan,
    onApproved,
}) => {
    const [formData, setFormData] = useState({});
    const [step, setStep] = useState('form'); // 'form' | 'preview'
    const [previewData, setPreviewData] = useState(null);
    const [clientErrors, setClientErrors] = useState([]);
    const [serverError, setServerError] = useState('');

    const previewMutation = usePreviewCustomAgreement();
    const approveMutation = useApproveCustomAgreement();
    const downloadMutation = useDownloadAgreement();

    // Check existing agreement snapshot (immutability safeguard)
    const hasExistingAgreement = Boolean(
        loan?.agreementSnapshot?.agreementVersion || loan?.agreementGeneratedAt
    );

    useEffect(() => {
        if (loan && isOpen) {
            setFormData(buildDefaultsFromLoan(loan));
            setStep('form');
            setPreviewData(null);
            setClientErrors([]);
            setServerError('');
        }
    }, [loan, isOpen]);

    if (!isOpen) return null;

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const validateForm = () => {
        const errors = [];
        if (!formData.borrowerName?.trim()) errors.push('Borrower name is required');
        if (!formData.borrowerPhone?.trim()) errors.push('Borrower phone is required');
        if (!formData.loanAmount || Number(formData.loanAmount) <= 0) errors.push('Valid loan amount is required');
        if (!formData.repaymentAmount || Number(formData.repaymentAmount) <= 0) errors.push('Valid repayment amount is required');
        if (!formData.tenureValue || Number(formData.tenureValue) <= 0) errors.push('Valid tenure is required');
        if (!formData.startDate) errors.push('Start date is required');
        if (!formData.firstPaymentDate) errors.push('First payment date is required');
        if (formData.additionalAgreedTerms && formData.additionalAgreedTerms.length > 5000) {
            errors.push('Additional agreed terms must not exceed 5000 characters');
        }
        setClientErrors(errors);
        return errors.length === 0;
    };

    const handlePreviewClick = async (e) => {
        e?.preventDefault();
        setServerError('');
        if (!validateForm()) return;

        try {
            const response = await previewMutation.mutateAsync({
                id: loan._id,
                data: formData,
            });
            if (response.data?.data) {
                setPreviewData(response.data.data);
                setStep('preview');
            }
        } catch (err) {
            setServerError(err.response?.data?.message || err.message || 'Failed to generate preview');
        }
    };

    const handleApproveClick = async () => {
        setServerError('');
        try {
            const payload = previewData?.sanitizedData || formData;
            await approveMutation.mutateAsync({
                id: loan._id,
                data: payload,
            });

            // Automatically download the freshly approved customized agreement
            await downloadMutation.mutateAsync(loan._id);

            if (onApproved) onApproved();
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Approval failed';
            setServerError(msg);
        }
    };

    const clientWarnings = deriveClientWarnings(formData);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col max-h-[92vh] overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-xl">
                            <FiFileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                {step === 'form' ? 'Customized Agreement Builder' : 'Review & Approve Agreement'}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Loan #{loan?.loanNumber} • {step === 'form' ? 'Step 1: Configure Terms' : 'Step 2: Legal Verification'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Immutability Guard Warning */}
                {hasExistingAgreement && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800 flex items-start gap-3 text-red-800 dark:text-red-300 text-xs">
                        <FiLock className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-bold">Agreement Already Generated (Immutable)</p>
                            <p className="mt-0.5">
                                An agreement has already been generated for this loan. Agreements cannot be re-generated or replaced.
                            </p>
                        </div>
                    </div>
                )}

                {/* Server Error Alert */}
                {serverError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800 flex items-start gap-3 text-red-800 dark:text-red-300 text-xs">
                        <FiAlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold">{serverError}</p>
                        </div>
                    </div>
                )}

                {/* Client Validation Errors */}
                {clientErrors.length > 0 && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs space-y-1">
                        <p className="font-bold">Please correct the following before previewing:</p>
                        <ul className="list-disc pl-5">
                            {clientErrors.map((err, idx) => (
                                <li key={idx}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Modal Content */}
                <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
                    {step === 'form' ? (
                        <form onSubmit={handlePreviewClick} className="space-y-6">
                            {/* Section 1: Borrower Information */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-3">
                                    1. Borrower Information
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            Borrower Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.borrowerName || ''}
                                            onChange={(e) => handleInputChange('borrowerName', e.target.value)}
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            required
                                            disabled={hasExistingAgreement}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            Borrower Phone *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.borrowerPhone || ''}
                                            onChange={(e) => handleInputChange('borrowerPhone', e.target.value)}
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            required
                                            disabled={hasExistingAgreement}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Loan & Interest Terms */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-3">
                                    2. Loan & Interest Configuration
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            Principal Amount (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.loanAmount || ''}
                                            onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            required
                                            min="1"
                                            disabled={hasExistingAgreement}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            Interest Type *
                                        </label>
                                        <select
                                            value={formData.interestType || 'percentage'}
                                            onChange={(e) => handleInputChange('interestType', e.target.value)}
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            disabled={hasExistingAgreement}
                                        >
                                            <option value="percentage">Percentage Rate (%)</option>
                                            <option value="fixed_amount">Fixed Amount (₹)</option>
                                            <option value="simple">Simple Interest</option>
                                            <option value="other">Other / Custom</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            {formData.interestType === 'fixed_amount' ? 'Interest Amount (₹)' : 'Interest Rate (%)'}
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.interestType === 'fixed_amount' ? (formData.interestAmount || '') : (formData.interestRate || '')}
                                            onChange={(e) => handleInputChange(
                                                formData.interestType === 'fixed_amount' ? 'interestAmount' : 'interestRate',
                                                e.target.value
                                            )}
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            disabled={hasExistingAgreement}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Repayment Schedule */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-3">
                                    3. Repayment & Schedule
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            Tenure Value *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.tenureValue || ''}
                                            onChange={(e) => handleInputChange('tenureValue', e.target.value)}
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            required
                                            min="1"
                                            disabled={hasExistingAgreement}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            Tenure Unit
                                        </label>
                                        <select
                                            value={formData.tenureUnit || 'months'}
                                            onChange={(e) => handleInputChange('tenureUnit', e.target.value)}
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            disabled={hasExistingAgreement}
                                        >
                                            <option value="months">Months</option>
                                            <option value="weeks">Weeks</option>
                                            <option value="years">Years</option>
                                            <option value="days">Days</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            Repayment Amount (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.repaymentAmount || ''}
                                            onChange={(e) => handleInputChange('repaymentAmount', e.target.value)}
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            required
                                            min="1"
                                            disabled={hasExistingAgreement}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            Frequency *
                                        </label>
                                        <select
                                            value={formData.repaymentFrequency || 'monthly'}
                                            onChange={(e) => handleInputChange('repaymentFrequency', e.target.value)}
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            disabled={hasExistingAgreement}
                                        >
                                            <option value="monthly">Monthly</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="other">Other / Custom</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            Start Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.startDate || ''}
                                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            required
                                            disabled={hasExistingAgreement}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            First Payment Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.firstPaymentDate || ''}
                                            onChange={(e) => handleInputChange('firstPaymentDate', e.target.value)}
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            required
                                            disabled={hasExistingAgreement}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Foreclosure & Late Policies */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-3">
                                    4. Foreclosure & Late Payment
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            Foreclosure Policy *
                                        </label>
                                        <select
                                            value={formData.foreclosurePolicy || 'WITHOUT_DISCOUNT'}
                                            onChange={(e) => handleInputChange('foreclosurePolicy', e.target.value)}
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            disabled={hasExistingAgreement}
                                        >
                                            <option value="WITHOUT_DISCOUNT">Allowed – No Discount</option>
                                            <option value="MANUAL_DISCOUNT">Manual Discount Allowed</option>
                                            <option value="NOT_ALLOWED">Not Allowed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            Grace Period (Days)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.gracePeriodDays ?? 0}
                                            onChange={(e) => handleInputChange('gracePeriodDays', Number(e.target.value))}
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            disabled={hasExistingAgreement}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            Late Fee Type
                                        </label>
                                        <select
                                            value={formData.lateFeeType || 'none'}
                                            onChange={(e) => handleInputChange('lateFeeType', e.target.value)}
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            disabled={hasExistingAgreement}
                                        >
                                            <option value="none">None</option>
                                            <option value="fixed">Fixed Amount (₹)</option>
                                            <option value="percentage">Percentage (%)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 5: Additional Agreed Terms */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                                        5. Additional Agreed Terms (Optional)
                                    </h4>
                                    <span className="text-[11px] text-gray-400">
                                        {(formData.additionalAgreedTerms || '').length} / 5000 characters
                                    </span>
                                </div>
                                <textarea
                                    rows="4"
                                    maxLength="5000"
                                    value={formData.additionalAgreedTerms || ''}
                                    onChange={(e) => handleInputChange('additionalAgreedTerms', e.target.value)}
                                    placeholder="Enter any custom clauses or agreed covenants between lender and borrower (e.g. collateral details, specific payment modes, guarantor details)..."
                                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                    disabled={hasExistingAgreement}
                                />
                            </div>

                            {/* Real-time Calculation Warnings */}
                            {clientWarnings.length > 0 && (
                                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                                    <FiAlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                                    <div>
                                        <p className="font-semibold">Calculation Notice:</p>
                                        {clientWarnings.map((w, idx) => (
                                            <p key={idx} className="mt-0.5">{w}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </form>
                    ) : (
                        /* STEP 2: PREVIEW MODE */
                        <div className="space-y-5">
                            {previewData?.warnings?.length > 0 && (
                                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-xs">
                                    <div className="flex items-center gap-2 font-bold mb-1">
                                        <FiAlertTriangle className="w-4 h-4 text-amber-600" />
                                        Discrepancy Warnings Detected
                                    </div>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {previewData.warnings.map((w, idx) => (
                                            <li key={idx}>{w}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Formatted Agreement Document Preview */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 p-5 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-200 max-h-[50vh] overflow-y-auto">
                                {previewData?.previewText}
                            </div>

                            {/* Legal Confirmation Alert */}
                            <div className="p-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-xl text-teal-900 dark:text-teal-200 text-xs flex items-start gap-3">
                                <FiInfo className="w-4 h-4 mt-0.5 shrink-0 text-teal-600 dark:text-teal-400" />
                                <div>
                                    <p className="font-bold">Write-Once Immutability Safeguard</p>
                                    <p className="mt-0.5 text-teal-800 dark:text-teal-300">
                                        Approving this Customized Agreement creates an immutable legal snapshot in the system alongside the current active Legal Center policies. This snapshot cannot be modified or replaced once approved.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-between p-4 px-6 bg-gray-50 dark:bg-gray-800/70 border-t border-gray-100 dark:border-gray-700">
                    {step === 'form' ? (
                        <>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handlePreviewClick}
                                disabled={hasExistingAgreement || previewMutation.isPending}
                                className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                            >
                                {previewMutation.isPending ? (
                                    <>
                                        <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        Generating Preview...
                                    </>
                                ) : (
                                    <>
                                        <FiFileText className="w-3.5 h-3.5" />
                                        Generate Preview & Terms
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => setStep('form')}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <FiArrowLeft className="w-3.5 h-3.5" />
                                Edit Terms
                            </button>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handlePreviewClick}
                                    disabled={previewMutation.isPending}
                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <FiRefreshCw className={`w-3.5 h-3.5 ${previewMutation.isPending ? 'animate-spin' : ''}`} />
                                    Regenerate
                                </button>
                                <button
                                    type="button"
                                    onClick={handleApproveClick}
                                    disabled={hasExistingAgreement || approveMutation.isPending || downloadMutation.isPending}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-md transition-colors disabled:opacity-50"
                                >
                                    {approveMutation.isPending || downloadMutation.isPending ? (
                                        <>
                                            <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            Approving & Generating PDF...
                                        </>
                                    ) : (
                                        <>
                                            <FiCheckCircle className="w-3.5 h-3.5" />
                                            Approve & Create Agreement
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomizedAgreementBuilder;
