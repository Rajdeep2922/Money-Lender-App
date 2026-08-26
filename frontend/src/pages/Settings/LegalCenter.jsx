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
        color: 'from-blue-500 to-indigo-600',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
    },
    {
        type: 'loanAgreement',
        label: 'Loan Agreement Policy',
        description: 'Structure and enforceability of the loan agreement document.',
        icon: BadgeCheck,
        color: 'from-teal-500 to-cyan-600',
        bg: 'bg-teal-50 dark:bg-teal-900/20',
        border: 'border-teal-200 dark:border-teal-800',
    },
    {
        type: 'interest',
        label: 'Interest Policy',
        description: 'How interest is calculated, applied, and communicated.',
        icon: Percent,
        color: 'from-violet-500 to-purple-600',
        bg: 'bg-violet-50 dark:bg-violet-900/20',
        border: 'border-violet-200 dark:border-violet-800',
    },
    {
        type: 'emiPayment',
        label: 'EMI & Payment Policy',
        description: 'Payment schedules, accepted methods, and receipt issuance.',
        icon: CreditCard,
        color: 'from-emerald-500 to-green-600',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-200 dark:border-emerald-800',
    },
    {
        type: 'foreclosure',
        label: 'Foreclosure Policy',
        description: 'Early loan closure rules, discounts, and procedures.',
        icon: Scissors,
        color: 'from-orange-500 to-amber-600',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-200 dark:border-orange-800',
    },
    {
        type: 'defaultOverdue',
        label: 'Default & Overdue Policy',
        description: 'Grace periods, late fees, and escalation procedures.',
        icon: AlertTriangle,
        color: 'from-red-500 to-rose-600',
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
    },
    {
        type: 'privacy',
        label: 'Privacy Policy',
        description: 'Data collection, usage, storage, and borrower privacy rights.',
        icon: Lock,
        color: 'from-slate-500 to-gray-600',
        bg: 'bg-slate-50 dark:bg-slate-900/20',
        border: 'border-slate-200 dark:border-slate-700',
    },
    {
        type: 'contact',
        label: 'Contact Information',
        description: 'Grievance redressal, support contacts, and registered address.',
        icon: Phone,
        color: 'from-pink-500 to-fuchsia-600',
        bg: 'bg-pink-50 dark:bg-pink-900/20',
        border: 'border-pink-200 dark:border-pink-800',
    },
];

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }),
};

const LegalCenter = () => {
    const navigate = useNavigate();
    const { data: policies, isLoading } = useLegalPolicies();

    if (isLoading) return <PageLoader />;

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-teal-600" />
                        Legal Center
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage all versioned legal policies. Every edit creates a new version — old agreements are never affected.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            className={`
                                w-full text-left p-4 rounded-xl border ${policy.bg} ${policy.border}
                                hover:shadow-md transition-all duration-200 group
                            `}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${policy.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                            {policy.label}
                                        </span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                                            currentPolicy
                                                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                        }`}>
                                            {version}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                                        {policy.description}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        <span>Updated {updatedAt}</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 flex-shrink-0 mt-1 transition-colors" />
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default LegalCenter;
