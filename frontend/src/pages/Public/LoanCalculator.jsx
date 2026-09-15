import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiPercent, FiCalendar, FiInfo, FiPieChart, FiArrowLeft, FiShare2, FiCheck } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { calculateMonthlyEMI, calculateCompoundEMI } from '../../../../shared/loanCalculations.js';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

export const LoanCalculator = () => {
    const [principal, setPrincipal] = useState(100000);
    const [monthlyInterestRate, setMonthlyInterestRate] = useState(2);
    const [loanDurationMonths, setLoanDurationMonths] = useState(12);
    const [interestType, setInterestType] = useState('simple');

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
            p: principal,
            r: monthlyInterestRate,
            d: loanDurationMonths,
            t: interestType,
        });
        const url = `${window.location.origin}/calculator?${params.toString()}`;
        navigator.clipboard.writeText(url);
        toast.success('Calculation link copied to clipboard!');
    };

    return (
        <>
            <Helmet>
                <title>Loan Calculator | Estimate Your EMI</title>
                <meta name="description" content="Calculate your loan EMI, total interest, and payment schedule. Free loan calculator with support for simple and compound interest." />
            </Helmet>

            {/* Top Navigation Bar */}
            <div className="bg-white/80 dark:bg-surface-elevated/80 backdrop-blur-md border-b border-black/[0.06] dark:border-white/[0.08] sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-bright transition-colors"
                    >
                        <FiArrowLeft className="w-3.5 h-3.5" />
                        Back to Home
                    </Link>
                    <div className="flex items-center gap-2 text-primary dark:text-primary-bright">
                        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FiPieChart className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-xs tracking-tight text-gray-900 dark:text-white">Loan Calculator</span>
                    </div>
                </div>
            </div>

            <div className="min-h-screen bg-slate-50 dark:bg-black py-8 sm:py-12 px-4 transition-colors">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-2"
                    >
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary dark:text-primary-bright mb-2 shadow-2xs">
                            <FiPieChart className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            EMI Loan Calculator
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                            Simulate monthly instalments, total interest burden, and amortization distribution in real time.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
                        {/* Input Parameters Surface */}
                        <motion.div
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 }}
                            className="bg-white dark:bg-surface-elevated border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs"
                        >
                            <div className="flex items-center gap-2 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                                <FiDollarSign className="text-primary dark:text-primary-bright w-4 h-4" />
                                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Loan Parameters</h2>
                            </div>

                            {/* Principal */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Loan Amount</label>
                                    <span className="text-xs font-mono font-semibold text-gray-900 dark:text-white tabular-nums">
                                        {formatCurrency(principal)}
                                    </span>
                                </div>
                                <input
                                    type="number"
                                    value={principal}
                                    onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                                    min="1000"
                                    step="1000"
                                    className="w-full px-3.5 py-2 border border-black/[0.08] dark:border-white/[0.1] rounded-xl bg-white dark:bg-black/40 text-gray-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="100000"
                                />
                                <input
                                    type="range"
                                    value={principal}
                                    onChange={(e) => setPrincipal(Number(e.target.value))}
                                    min="10000"
                                    max="10000000"
                                    step="10000"
                                    className="w-full mt-2 accent-primary cursor-pointer"
                                />
                                <div className="flex justify-between text-[11px] text-gray-400 dark:text-gray-500 font-mono">
                                    <span>₹10K</span>
                                    <span>₹1Cr</span>
                                </div>
                            </div>

                            {/* Monthly Interest Rate */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Monthly Interest Rate</label>
                                    <span className="text-xs font-mono font-semibold text-gray-900 dark:text-white tabular-nums">
                                        {monthlyInterestRate}% / mo ({(monthlyInterestRate * 12).toFixed(1)}% p.a.)
                                    </span>
                                </div>
                                <input
                                    type="number"
                                    value={monthlyInterestRate}
                                    onChange={(e) => setMonthlyInterestRate(Math.max(0, Number(e.target.value)))}
                                    min="0"
                                    max="50"
                                    step="0.1"
                                    className="w-full px-3.5 py-2 border border-black/[0.08] dark:border-white/[0.1] rounded-xl bg-white dark:bg-black/40 text-gray-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="2"
                                />
                                <input
                                    type="range"
                                    value={monthlyInterestRate}
                                    onChange={(e) => setMonthlyInterestRate(Number(e.target.value))}
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    className="w-full mt-2 accent-primary cursor-pointer"
                                />
                                <div className="flex justify-between text-[11px] text-gray-400 dark:text-gray-500 font-mono">
                                    <span>0%</span>
                                    <span>10% / mo</span>
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Loan Tenure</label>
                                    <span className="text-xs font-mono font-semibold text-gray-900 dark:text-white tabular-nums">
                                        {loanDurationMonths} month{loanDurationMonths !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <input
                                    type="number"
                                    value={loanDurationMonths}
                                    onChange={(e) => setLoanDurationMonths(Math.max(1, Number(e.target.value)))}
                                    min="1"
                                    max="360"
                                    className="w-full px-3.5 py-2 border border-black/[0.08] dark:border-white/[0.1] rounded-xl bg-white dark:bg-black/40 text-gray-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="12"
                                />
                                <input
                                    type="range"
                                    value={loanDurationMonths}
                                    onChange={(e) => setLoanDurationMonths(Number(e.target.value))}
                                    min="1"
                                    max="60"
                                    className="w-full mt-2 accent-primary cursor-pointer"
                                />
                                <div className="flex justify-between text-[11px] text-gray-400 dark:text-gray-500 font-mono">
                                    <span>1 mo</span>
                                    <span>60 mos</span>
                                </div>
                            </div>

                            {/* Interest Type Pill Selector */}
                            <div className="space-y-1.5 pt-1">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Interest Calculation Model</label>
                                <div className="grid grid-cols-2 p-1 rounded-xl bg-gray-100 dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setInterestType('simple')}
                                        className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                                            interestType === 'simple'
                                                ? 'bg-white dark:bg-surface-elevated text-gray-900 dark:text-white shadow-xs'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Simple (Flat Rate)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setInterestType('compound')}
                                        className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                                            interestType === 'compound'
                                                ? 'bg-white dark:bg-surface-elevated text-gray-900 dark:text-white shadow-xs'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Compound (Reducing)
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Results Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-4"
                        >
                            {/* EMI Hero Result Card */}
                            {calculations && (
                                <div className="bg-primary text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
                                    <p className="text-white/70 text-xs uppercase tracking-wider font-semibold">Monthly EMI Payment</p>
                                    <p className="text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums mt-2">
                                        {formatCurrency(calculations.emi)}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 pt-5 mt-5 border-t border-white/15">
                                        <div>
                                            <p className="text-white/70 text-[11px] uppercase tracking-wider">Total Interest</p>
                                            <p className="text-lg font-semibold tabular-nums mt-1">
                                                {formatCurrency(calculations.totalInterest)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-white/70 text-[11px] uppercase tracking-wider">Total Repayment</p>
                                            <p className="text-lg font-semibold tabular-nums mt-1">
                                                {formatCurrency(calculations.totalPayable)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Breakdown Distribution */}
                            {calculations && (
                                <div className="bg-white dark:bg-surface-elevated border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xs">
                                    <h3 className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <FiPercent className="text-primary dark:text-primary-bright w-3.5 h-3.5" />
                                        Principal vs Interest Distribution
                                    </h3>

                                    {/* Visual breakdown bar */}
                                    <div className="h-3 rounded-full overflow-hidden bg-gray-200 dark:bg-white/[0.1] flex">
                                        <div
                                            className="h-full bg-primary transition-all duration-300"
                                            style={{
                                                width: `${calculations.totalPayable > 0 ? (principal / calculations.totalPayable) * 100 : 100}%`,
                                            }}
                                            title="Principal"
                                        />
                                        <div
                                            className="h-full bg-emerald-500 transition-all duration-300"
                                            style={{
                                                width: `${calculations.totalPayable > 0 ? (calculations.totalInterest / calculations.totalPayable) * 100 : 0}%`,
                                            }}
                                            title="Interest"
                                        />
                                    </div>

                                    <div className="flex justify-between text-xs font-mono">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Principal: <strong className="text-gray-900 dark:text-white">{formatCurrency(principal)}</strong>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Interest: <strong className="text-gray-900 dark:text-white">{formatCurrency(calculations.totalInterest)}</strong>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-amber-500/[0.06] rounded-xl border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                                        <FiInfo className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                                        <span>Interest contributes <strong>{calculations.interestPercentage.toFixed(1)}%</strong> on top of the principal amount.</span>
                                    </div>
                                </div>
                            )}

                            {/* Disclaimer */}
                            <div className="bg-white dark:bg-surface-elevated border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-4 text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2.5 shadow-xs">
                                <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                                <span className="leading-relaxed">
                                    <strong className="text-gray-900 dark:text-white font-medium">Estimate Only:</strong> Calculations strictly use the standardized arithmetic engine matching the loan creation system. Actual tenure or discounts may vary by agreement.
                                </span>
                            </div>

                            {/* Share button */}
                            <button
                                onClick={handleShare}
                                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-surface-elevated border border-black/[0.08] dark:border-white/[0.1] hover:bg-gray-50 dark:hover:bg-white/[0.04] active:scale-[0.98] transition-all shadow-2xs"
                            >
                                <FiShare2 className="w-3.5 h-3.5" />
                                Share This Calculation
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoanCalculator;
