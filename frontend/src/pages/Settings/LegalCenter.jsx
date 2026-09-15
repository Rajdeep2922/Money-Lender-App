import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ScrollText, Shield, Percent, CreditCard, Scissors,
    AlertTriangle, Lock, Phone, ChevronRight, Clock, BadgeCheck
} from 'lucide-react';
import { useLegalPolicies } from '../../hooks/useLegal';
import { PageLoader } from '../../components/common/LoadingSpinner';

const POLICY_TYPES = [
    {
        type: 'terms',
        label: 'Terms & Conditions',
        description: 'General borrower obligations, rights, and agreement framework.',
        icon: ScrollText,
    },
    {
        type: 'loanAgreement',
        label: 'Loan Agreement Policy',
        description: 'Structure and enforceability of the loan agreement document.',
        icon: BadgeCheck,
    },
    {
        type: 'interest',
        label: 'Interest Policy',
        description: 'How interest is calculated, applied, and communicated.',
        icon: Percent,
    },
    {
        type: 'emiPayment',
        label: 'EMI & Payment Policy',
        description: 'Payment schedules, accepted methods, and receipt issuance.',
        icon: CreditCard,
    },
    {
        type: 'foreclosure',
        label: 'Foreclosure Policy',
        description: 'Early loan closure rules, discounts, and procedures.',
        icon: Scissors,
    },
    {
        type: 'defaultOverdue',
        label: 'Default & Overdue Policy',
        description: 'Grace periods, late fees, and escalation procedures.',
        icon: AlertTriangle,
    },
    {
        type: 'privacy',
        label: 'Privacy Policy',
        description: 'Data collection, usage, storage, and borrower privacy rights.',
        icon: Lock,
    },
    {
        type: 'contact',
        label: 'Contact Information',
        description: 'Grievance redressal, support contacts, and registered address.',
        icon: Phone,
    },
];

const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.25 } }),
};

const LegalCenter = () => {
    const navigate = useNavigate();
    const { data: policies, isLoading } = useLegalPolicies();

    if (isLoading) return <PageLoader />;

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary dark:text-primary-bright" />
                        Legal Center
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Manage all versioned legal policies. Every edit creates a new immutable version — signed loan agreements remain permanently protected.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {POLICY_TYPES.map((policy, i) => {
                    const Icon = policy.icon;
                    const currentPolicy = policies?.[policy.type];
                    const version = currentPolicy?.version || 'Not set';
                    const updatedAt = currentPolicy?.createdAt
                        ? new Date(currentPolicy.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                        })
                        : '—';

                    return (
                        <motion.button
                            key={policy.type}
                            custom={i}
                            initial="hidden"
                            animate="visible"
                            variants={fadeUp}
                            onClick={() => navigate(`/settings/legal/${policy.type}`)}
                            className="w-full text-left p-4 rounded-2xl bg-white dark:bg-surface-elevated border border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.14] dark:hover:border-white/[0.16] hover:-translate-y-0.5 active:scale-[0.99] transition-all group shadow-xs"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center flex-shrink-0 text-gray-700 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary-bright group-hover:bg-primary/10 transition-colors">
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-semibold text-gray-900 dark:text-white text-xs truncate group-hover:text-primary dark:group-hover:text-primary-bright transition-colors">
                                            {policy.label}
                                        </span>
                                        <span className={`text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full whitespace-nowrap ${
                                            currentPolicy
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                : 'bg-black/[0.04] dark:bg-white/[0.06] text-gray-500 dark:text-gray-400'
                                        }`}>
                                            {version}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 leading-relaxed">
                                        {policy.description}
                                    </p>
                                    <div className="flex items-center gap-1 mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        <span>Updated {updatedAt}</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary dark:group-hover:text-primary-bright flex-shrink-0 mt-1 transition-colors" />
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default LegalCenter;
