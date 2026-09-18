import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiInfo, FiShare2 } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import useTheme from '../../hooks/useTheme';
// Import from shared calculation module - SINGLE SOURCE OF TRUTH
import { calculateMonthlyEMI, calculateCompoundEMI } from '../../../../shared/loanCalculations.js';

// Format currency for display
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

const LoanCalculator = () => {
    useTheme();
    const [searchParams] = useSearchParams();

    const [principal, setPrincipal] = useState(() => {
        const p = Number(searchParams.get('p'));
        return p > 0 ? p : 100000;
    });
    const [monthlyInterestRate, setMonthlyInterestRate] = useState(() => {
        const r = searchParams.get('r');
        return r !== null && !isNaN(Number(r)) ? Number(r) : 2;
    });
    const [loanDurationMonths, setLoanDurationMonths] = useState(() => {
        const d = Number(searchParams.get('d'));
        return d > 0 ? d : 12;
    });
    const [interestType, setInterestType] = useState(() => {
        return searchParams.get('t') === 'compound' ? 'compound' : 'simple';
    });

    // Calculate using the SAME functions as loan creation
    const calculations = useMemo(() => {
        if (!principal || !loanDurationMonths || principal < 1 || loanDurationMonths < 1) {
            return null;
        }

        const rate = monthlyInterestRate || 0;
        const emi = interestType === 'compound'
            ? calculateCompoundEMI(principal, rate, loanDurationMonths)
            : calculateMonthlyEMI(principal, rate, loanDurationMonths);

        const totalPayable = emi * loanDurationMonths;
        const totalInterest = Math.max(0, totalPayable - principal);

        return {
            emi,
            totalPayable,
            totalInterest,
            interestPercentage: principal > 0 ? (totalInterest / principal) * 100 : 0,
        };
    }, [principal, monthlyInterestRate, loanDurationMonths, interestType]);

    const handleShare = () => {
        const params = new URLSearchParams({
            p: String(principal),
            r: String(monthlyInterestRate),
            d: String(loanDurationMonths),
            t: interestType,
        });
        const url = `${window.location.origin}/calculator?${params.toString()}`;
        navigator.clipboard.writeText(url);
        toast.success('Calculation link copied to clipboard');
    };

    return (
        <>
            <Helmet>
                <title>Loan Calculator | Estimate Your Repayment</title>
                <meta
                    name="description"
                    content="Calculate your monthly EMI, total interest, and complete repayment schedule with standardized simple and compound financial formulas."
                />
            </Helmet>

            <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 transition-colors duration-200 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    {/* Header with Back Navigation and Theme Toggle */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <Link
                                to="/"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
                            >
                                <FiArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                                <span>Back to Home</span>
                            </Link>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-semibold tracking-wider text-primary uppercase">
                                Financial Tools
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                                Loan Calculator
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl">
                                Estimate repayments and understand the total cost of a loan.
                            </p>
                        </div>
                    </div>

                    {/* 2-Column Responsive Workspace */}
                    <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                        {/* 1. Input Workspace */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="lg:col-span-7 bg-white dark:bg-surface-elevated border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6"
                        >
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                    Loan Details
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Adjust amount, duration, and interest parameters to simulate terms.
                                </p>
                            </div>

                            {/* Loan Amount */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label
                                        htmlFor="principal-input"
                                        className="text-xs font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Loan amount
                                    </label>
                                    <span className="text-xs font-mono font-medium text-gray-700 dark:text-gray-300">
                                        {formatCurrency(principal || 0)}
                                    </span>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 select-none">
                                        ₹
                                    </span>
                                    <input
                                        id="principal-input"
                                        type="number"
                                        value={principal}
                                        onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                                        min="1000"
                                        step="1000"
                                        className="w-full pl-8 pr-4 py-2.5 text-sm font-semibold rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.10] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all tabular-nums"
                                        placeholder="100000"
                                    />
                                </div>
                                <input
                                    type="range"
                                    value={principal}
                                    onChange={(e) => setPrincipal(Number(e.target.value))}
                                    min="10000"
                                    max="10000000"
                                    step="10000"
                                    aria-label="Loan Amount Slider"
                                    className="w-full h-1.5 bg-gray-200 dark:bg-white/[0.12] rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between text-[11px] font-mono text-gray-500 dark:text-gray-400">
                                    <span>₹10K</span>
                                    <span>₹50L</span>
                                    <span>₹1Cr</span>
                                </div>
                            </div>

                            {/* Monthly Interest Rate */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label
                                        htmlFor="rate-input"
                                        className="text-xs font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Monthly interest rate
                                    </label>
                                    <span className="text-xs font-mono font-medium text-gray-700 dark:text-gray-300">
                                        {monthlyInterestRate}% / month
                                    </span>
                                </div>
                                <div className="relative">
                                    <input
                                        id="rate-input"
                                        type="number"
                                        value={monthlyInterestRate}
                                        onChange={(e) => setMonthlyInterestRate(Math.max(0, Number(e.target.value)))}
                                        min="0"
                                        max="50"
                                        step="0.1"
                                        className="w-full pl-3.5 pr-20 py-2.5 text-sm font-semibold rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.10] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all tabular-nums"
                                        placeholder="2"
                                    />
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 pointer-events-none">
                                        % / month
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    value={monthlyInterestRate}
                                    onChange={(e) => setMonthlyInterestRate(Number(e.target.value))}
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    aria-label="Monthly Interest Rate Slider"
                                    className="w-full h-1.5 bg-gray-200 dark:bg-white/[0.12] rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between text-[11px] font-mono text-gray-500 dark:text-gray-400">
                                    <span>0%</span>
                                    <span>5%</span>
                                    <span>10%</span>
                                </div>
                            </div>

                            {/* Loan Duration */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label
                                        htmlFor="duration-input"
                                        className="text-xs font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Loan duration
                                    </label>
                                    <span className="text-xs font-mono font-medium text-gray-700 dark:text-gray-300">
                                        {loanDurationMonths} {loanDurationMonths === 1 ? 'month' : 'months'}
                                    </span>
                                </div>
                                <div className="relative">
                                    <input
                                        id="duration-input"
                                        type="number"
                                        value={loanDurationMonths}
                                        onChange={(e) => setLoanDurationMonths(Math.max(1, Number(e.target.value)))}
                                        min="1"
                                        max="360"
                                        className="w-full pl-3.5 pr-20 py-2.5 text-sm font-semibold rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.10] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all tabular-nums"
                                        placeholder="12"
                                    />
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 pointer-events-none">
                                        months
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    value={loanDurationMonths}
                                    onChange={(e) => setLoanDurationMonths(Number(e.target.value))}
                                    min="1"
                                    max="60"
                                    step="1"
                                    aria-label="Loan Duration Slider"
                                    className="w-full h-1.5 bg-gray-200 dark:bg-white/[0.12] rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between text-[11px] font-mono text-gray-500 dark:text-gray-400">
                                    <span>1 month</span>
                                    <span>36 months</span>
                                    <span>60 months</span>
                                </div>
                            </div>

                            {/* Interest Type Segmented Control */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Interest type
                                </label>
                                <div
                                    className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-white/[0.04] rounded-xl border border-black/[0.06] dark:border-white/[0.08]"
                                    role="radiogroup"
                                    aria-label="Interest calculation method"
                                >
                                    <button
                                        type="button"
                                        role="radio"
                                        aria-checked={interestType === 'simple'}
                                        onClick={() => setInterestType('simple')}
                                        className={`py-2.5 px-3.5 rounded-lg text-left transition-all ${
                                            interestType === 'simple'
                                                ? 'bg-primary text-white shadow-xs'
                                                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <p className="text-xs font-semibold leading-none">Simple</p>
                                        <p
                                            className={`text-[11px] mt-1 ${
                                                interestType === 'simple'
                                                    ? 'text-white/80'
                                                    : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                        >
                                            Flat rate
                                        </p>
                                    </button>
                                    <button
                                        type="button"
                                        role="radio"
                                        aria-checked={interestType === 'compound'}
                                        onClick={() => setInterestType('compound')}
                                        className={`py-2.5 px-3.5 rounded-lg text-left transition-all ${
                                            interestType === 'compound'
                                                ? 'bg-primary text-white shadow-xs'
                                                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <p className="text-xs font-semibold leading-none">Compound</p>
                                        <p
                                            className={`text-[11px] mt-1 ${
                                                interestType === 'compound'
                                                    ? 'text-white/80'
                                                    : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                        >
                                            Reducing balance
                                        </p>
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* 2. Results & Financial Summary */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: 0.05 }}
                            className="lg:col-span-5 space-y-4"
                        >
                            {calculations ? (
                                <div className="bg-white dark:bg-surface-elevated border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
                                    {/* Primary EMI */}
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                            Monthly EMI
                                        </p>
                                        <p className="text-4xl sm:text-5xl font-semibold tabular-nums tracking-tight text-gray-900 dark:text-white mt-1.5">
                                            {formatCurrency(calculations.emi)}
                                        </p>
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t border-black/[0.06] dark:border-white/[0.08]" />

                                    {/* Supporting Financial Metrics */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Total payable
                                            </p>
                                            <p className="text-xl font-semibold tabular-nums text-gray-900 dark:text-white mt-1">
                                                {formatCurrency(calculations.totalPayable)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Total interest
                                            </p>
                                            <p className="text-xl font-semibold tabular-nums text-gray-900 dark:text-white mt-1">
                                                {formatCurrency(calculations.totalInterest)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Principal vs Interest Visualization */}
                                    <div className="space-y-3 pt-1">
                                        <div className="flex justify-between items-center text-xs font-medium text-gray-700 dark:text-gray-300">
                                            <span>Repayment breakdown</span>
                                            <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                                                {calculations.totalPayable > 0
                                                    ? `${((principal / calculations.totalPayable) * 100).toFixed(0)}% principal`
                                                    : '100%'}
                                            </span>
                                        </div>

                                        <div
                                            className="h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-white/[0.08] flex"
                                            role="progressbar"
                                            aria-label="Principal vs Interest breakdown"
                                        >
                                            <div
                                                className="h-full bg-primary transition-all duration-300"
                                                style={{
                                                    width: `${calculations.totalPayable > 0 ? Math.min(100, Math.max(0, (principal / calculations.totalPayable) * 100)) : 100}%`,
                                                }}
                                                title="Principal"
                                            />
                                            <div
                                                className="h-full bg-emerald-500 transition-all duration-300"
                                                style={{
                                                    width: `${calculations.totalPayable > 0 ? Math.min(100, Math.max(0, (calculations.totalInterest / calculations.totalPayable) * 100)) : 0}%`,
                                                }}
                                                title="Interest"
                                            />
                                        </div>

                                        <div className="flex justify-between text-xs font-mono pt-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    Principal:{' '}
                                                    <strong className="text-gray-900 dark:text-white font-medium">
                                                        {formatCurrency(principal)}
                                                    </strong>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    Interest:{' '}
                                                    <strong className="text-gray-900 dark:text-white font-medium">
                                                        {formatCurrency(calculations.totalInterest)}
                                                    </strong>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Interest Context */}
                                    <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300 py-2.5 px-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
                                        <FiInfo className="w-3.5 h-3.5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                                        <span>
                                            Interest adds{' '}
                                            <strong className="text-gray-900 dark:text-white font-medium">
                                                {calculations.interestPercentage.toFixed(1)}%
                                            </strong>{' '}
                                            to the original loan amount.
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-surface-elevated border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-center">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        Enter valid loan details
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        to see your repayment estimate.
                                    </p>
                                </div>
                            )}

                            {/* Share Action */}
                            <button
                                type="button"
                                onClick={handleShare}
                                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-surface-elevated border border-black/[0.08] dark:border-white/[0.10] hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:-translate-y-0.5 active:scale-[0.98] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                            >
                                <FiShare2 className="w-3.5 h-3.5" />
                                <span>Share calculation</span>
                            </button>

                            {/* Estimate Disclaimer - Clean, unboxed footer */}
                            <div className="pt-2 px-1 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                <div className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                                    <FiInfo className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                    <span>Estimate only</span>
                                </div>
                                <p className="leading-relaxed pl-5 text-xs text-gray-500 dark:text-gray-400">
                                    Actual loan terms may vary based on eligibility and approval. This calculator uses the same formula as the loan creation system.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoanCalculator;
