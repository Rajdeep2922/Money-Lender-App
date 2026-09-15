import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Save, Clock, ChevronDown, ChevronUp,
    History, Tag, AlertCircle, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLegalPolicy, usePolicyHistory, usePublishPolicy } from '../../hooks/useLegal';
import { PageLoader } from '../../components/common/LoadingSpinner';

const POLICY_LABELS = {
    terms: 'Terms & Conditions',
    loanAgreement: 'Loan Agreement Policy',
    interest: 'Interest Policy',
    emiPayment: 'EMI & Payment Policy',
    foreclosure: 'Foreclosure Policy',
    defaultOverdue: 'Default & Overdue Policy',
    privacy: 'Privacy Policy',
    contact: 'Contact Information',
};

const DEFAULT_CONTENT = {
    terms: `TERMS & CONDITIONS

1. ACCEPTANCE OF TERMS
By accepting a loan from this lender, the borrower agrees to abide by all terms and conditions stated herein.

2. BORROWER OBLIGATIONS
The borrower agrees to repay the loan amount together with applicable interest as per the agreed repayment schedule. Any change to the repayment terms must be mutually agreed upon in writing.

3. LOAN PURPOSE
The loan is provided for personal/business use as declared by the borrower. The lender reserves the right to verify the stated purpose.

4. AMENDMENTS
No amendment to these terms shall be valid unless made in writing and signed by both parties.

5. GOVERNING LAW
This agreement and all terms herein shall be governed by and construed in accordance with the laws of India.

6. JURISDICTION
Any disputes arising from this agreement shall be subject to the jurisdiction of courts in [City], [State].`,

    loanAgreement: `LOAN AGREEMENT POLICY

1. AGREEMENT VALIDITY
The Loan Agreement becomes legally binding from the date of signing by both the lender and borrower.

2. DOCUMENT INTEGRITY
The agreement is issued with a unique version number and generation timestamp. Any tampering with the document renders it void.

3. DIGITAL RECORDS
A digital copy of this agreement is maintained in the lender's system and is available to the borrower upon request.

4. PRECEDENCE
In case of any conflict between verbal communication and the written agreement, the written agreement shall take precedence.`,

    interest: `INTEREST POLICY

1. RATE OF INTEREST
Interest is charged at the rate specified in the loan agreement, expressed as a monthly percentage on the outstanding principal.

2. CALCULATION METHOD
Interest is calculated on a simple/flat basis unless otherwise specified in the individual loan agreement.

3. ACCRUAL
Interest accrues from the date of loan disbursement.

4. TRANSPARENCY
The total interest payable over the loan tenure is disclosed to the borrower prior to agreement signing.`,

    emiPayment: `EMI & PAYMENT POLICY

1. EMI SCHEDULE
Equated Monthly Instalments (EMIs) are due on the date specified in the amortization schedule attached to the loan agreement.

2. ACCEPTED PAYMENT METHODS
Payments are accepted via: Cash, UPI, Bank Transfer (NEFT/IMPS), and Cheque. The lender reserves the right to update accepted payment methods with prior notice.

3. RECEIPT ISSUANCE
A payment receipt will be issued for every EMI payment received.

4. PREPAYMENT
Borrowers may make prepayments at any time. Any prepayment will first be applied to outstanding interest and then to the principal.

5. PART PAYMENT
Partial payments are accepted at the lender's discretion. Contact the lender for approval before making partial payments.`,

    foreclosure: `FORECLOSURE POLICY

1. ELIGIBILITY
Foreclosure (early loan closure) is subject to the foreclosure policy specified in the individual loan agreement. Not all loans may be eligible for foreclosure.

2. FORECLOSURE TYPES
- WITHOUT DISCOUNT: The borrower pays the full outstanding balance.
- MANUAL DISCOUNT: The lender may, at their sole discretion, offer a discount on the outstanding balance.

3. DISCOUNT POLICY
Any foreclosure discount is entirely at the lender's discretion. The borrower has no legal right to demand a discount. Discounts may be offered for reasons such as: medical emergency, loyal customer relationship, or festival offers.

4. FORECLOSURE PROCESS
The borrower must notify the lender in writing of their intention to foreclose. The final settlement amount will be communicated within 3 working days.

5. SETTLEMENT CERTIFICATE
Upon successful foreclosure, a Settlement Certificate and No Objection Certificate (NOC) will be issued.`,

    defaultOverdue: `DEFAULT & OVERDUE POLICY

1. GRACE PERIOD
A grace period (as specified in the individual loan agreement) is provided after each EMI due date before late charges apply.

2. LATE FEE
After the grace period expires, a late fee (as configured in the individual loan agreement) will be applied.

3. OVERDUE STATUS
An EMI not paid within the grace period will be marked as OVERDUE.

4. DEFAULT STATUS
An EMI remaining unpaid for more than 30 days after the grace period expires will escalate the loan to DEFAULT status.

5. LEGAL ACTION
The lender reserves the right to initiate legal proceedings for loan recovery in case of persistent default.

6. CREDIT REPORTING
The lender may report persistent defaults to relevant credit agencies.`,

    privacy: `PRIVACY POLICY

1. DATA COLLECTION
We collect personal information including name, address, phone number, email, identity documents (Aadhaar, PAN), and financial details solely for loan processing purposes.

2. DATA USAGE
Your information is used only for: loan processing, identity verification, account management, and regulatory compliance.

3. DATA SHARING
Your personal data is NOT sold to third parties. Data may be shared with regulatory authorities if legally required.

4. DATA SECURITY
All personal data is stored securely with appropriate technical and organizational measures to prevent unauthorized access.

5. DATA RETENTION
Your data is retained for the duration of the loan and for a minimum of 7 years after loan closure as required by law.

6. YOUR RIGHTS
You have the right to access, correct, or request deletion of your personal data, subject to legal requirements.`,

    contact: `CONTACT INFORMATION

For any queries, grievances, or support related to your loan:

Business Name: [Your Business Name]
Owner/Contact Person: [Owner Name]
Phone: [Phone Number]
Email: [Email Address]
Address: [Full Business Address]

Office Hours: Monday to Saturday, 10:00 AM to 6:00 PM

For grievances, please write to us at the above email address. We will respond within 5 working days.`,
};

const LegalPolicyEditor = () => {
    const { type } = useParams();
    const navigate = useNavigate();

    const { data: policy, isLoading } = useLegalPolicy(type);
    const { data: history, isLoading: loadingHistory } = usePolicyHistory(type);
    const publishPolicy = usePublishPolicy();

    const [content, setContent] = useState('');
    const [isDirty, setIsDirty] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const policyLabel = POLICY_LABELS[type] || 'Policy';

    useEffect(() => {
        if (policy?.content) {
            setContent(policy.content);
        } else if (!isLoading) {
            // Set default content for new policies
            setContent(DEFAULT_CONTENT[type] || '');
        }
    }, [policy, isLoading, type]);

    const handleChange = (e) => {
        setContent(e.target.value);
        setIsDirty(true);
    };

    const handleSave = async () => {
        if (!content.trim()) {
            toast.error('Policy content cannot be empty');
            return;
        }
        const toastId = toast.loading('Publishing new version...');
        try {
            await publishPolicy.mutateAsync({ type, content });
            toast.success(`Published successfully!`, { id: toastId });
            setIsDirty(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to publish', { id: toastId });
        }
    };

    if (isLoading) return <PageLoader />;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate('/settings')}
                    className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex-1">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">{policyLabel}</h2>
                    <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Tag className="w-3 h-3" />
                            Current: <strong className="font-mono text-primary dark:text-primary-bright font-semibold">{policy?.version || 'None'}</strong>
                        </span>
                        {policy?.createdAt && (
                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="w-3 h-3" />
                                {new Date(policy.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'short', year: 'numeric'
                                })}
                            </span>
                        )}
                        {isDirty && (
                            <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                                <AlertCircle className="w-3 h-3" />
                                Unsaved changes
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={publishPolicy.isPending || !isDirty}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all duration-150 ${
                        isDirty && !publishPolicy.isPending
                            ? 'bg-primary hover:bg-primary/90 text-white shadow-sm active:scale-[0.98]'
                            : 'bg-black/[0.04] dark:bg-white/[0.06] text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
                >
                    <Save className="w-3.5 h-3.5" />
                    {publishPolicy.isPending ? 'Publishing...' : 'Publish'}
                </button>
            </div>

            {/* Notice */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-primary/[0.04] dark:bg-primary/[0.08] border border-primary/20 text-xs text-gray-700 dark:text-gray-300">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary dark:text-primary-bright" />
                <span>
                    Publishing creates a new version. Existing loan agreements are <strong>not affected</strong> — they retain a permanent snapshot of the policies accepted at signing.
                </span>
            </div>

            {/* Editor */}
            <textarea
                value={content}
                onChange={handleChange}
                rows={24}
                className="w-full px-4 py-3 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-black/40 text-gray-900 dark:text-gray-100 text-xs font-mono leading-relaxed focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y shadow-2xs transition-all"
                placeholder="Enter policy content here..."
                spellCheck={false}
            />

            {/* Version History */}
            <div className="border border-black/[0.06] dark:border-white/[0.08] rounded-2xl overflow-hidden bg-white dark:bg-surface-elevated shadow-xs">
                <button
                    onClick={() => setShowHistory(v => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/70 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors"
                >
                    <span className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        <History className="w-4 h-4" />
                        Version History
                        {history?.length > 0 && (
                            <span className="text-[10px] font-mono bg-black/[0.06] dark:bg-white/[0.08] text-gray-600 dark:text-gray-300 rounded-full px-2 py-0.5">
                                {history.length}
                            </span>
                        )}
                    </span>
                    {showHistory ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                <AnimatePresence>
                    {showHistory && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            {loadingHistory ? (
                                <div className="p-4 text-center text-xs text-gray-400">Loading history...</div>
                            ) : !history?.length ? (
                                <div className="p-4 text-center text-xs text-gray-400">No version history yet.</div>
                            ) : (
                                <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                                    {history.map((entry, idx) => (
                                        <div key={entry._id} className="flex items-start gap-3 px-4 py-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-mono font-bold ${
                                                idx === 0
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                    : 'bg-black/[0.04] dark:bg-white/[0.06] text-gray-500 dark:text-gray-400'
                                            }`}>
                                                {entry.version.replace('v', '')}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold font-mono text-gray-800 dark:text-gray-200">
                                                        {entry.version}
                                                    </span>
                                                    {idx === 0 && (
                                                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full px-2 py-0.5 font-semibold">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-gray-400 mt-0.5">
                                                    {new Date(entry.createdAt).toLocaleString('en-IN')} · by {entry.updatedBy}
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 font-mono">
                                                    {entry.content.substring(0, 120)}…
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LegalPolicyEditor;
