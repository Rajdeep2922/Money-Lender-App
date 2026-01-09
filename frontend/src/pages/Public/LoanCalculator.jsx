import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiPercent, FiCalendar, FiInfo, FiPieChart, FiArrowLeft, FiHome } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
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
    const [principal, setPrincipal] = useState(100000);
    const [monthlyInterestRate, setMonthlyInterestRate] = useState(2);
    const [loanDurationMonths, setLoanDurationMonths] = useState(12);
    const [interestType, setInterestType] = useState('simple');

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
        const totalInterest = totalPayable - principal;

        return {
            emi,
            totalPayable,
            totalInterest,
            interestPercentage: (totalInterest / principal) * 100,
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
        toast.success('Link copied to clipboard!');
    };

    return (
        <>
            <Helmet>
                <title>Loan Calculator | Estimate Your EMI</title>
                <meta name="description" content="Calculate your loan EMI, total interest, and payment schedule. Free loan calculator with support for simple and compound interest." />
            </Helmet>

            {/* Top Navigation Bar */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                    >
                        <FiArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
                        <FiPieChart className="w-5 h-5" />
                        <span className="font-semibold text-sm">Loan Calculator</span>
                    </div>
                </div>
            </div>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-lg mb-4">
                            <FiPieChart className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Loan Calculator
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Estimate your monthly EMI and total payment
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Input Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="card p-6 space-y-6"
                        >
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <FiDollarSign className="text-teal-500" />
                                Loan Parameters
                            </h2>

                            {/* Principal */}
                            <div className="form-group">
                                <label className="label">Loan Amount (₹)</label>
                                <input
                                    type="number"
                                    value={principal}
                                    onChange={(e) => setPrincipal(Number(e.target.value))}
                                    min="1000"
                                    step="1000"
                                    className="input"
                                    placeholder="100000"
                                />
                                <input
                                    type="range"
                                    value={principal}
                                    onChange={(e) => setPrincipal(Number(e.target.value))}
                                    min="10000"
                                    max="10000000"
                                    step="10000"
                                    className="w-full mt-2 accent-teal-500"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>₹10K</span>
                                    <span>₹1Cr</span>
                                </div>
                            </div>

                            {/* Interest Rate */}
                            <div className="form-group">
                                <label className="label">Monthly Interest Rate (%)</label>
                                <input
                                    type="number"
                                    value={monthlyInterestRate}
                                    onChange={(e) => setMonthlyInterestRate(Number(e.target.value))}
                                    min="0"
                                    max="50"
                                    step="0.1"
                                    className="input"
                                    placeholder="2"
                                />
                                <input
                                    type="range"
                                    value={monthlyInterestRate}
                                    onChange={(e) => setMonthlyInterestRate(Number(e.target.value))}
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    className="w-full mt-2 accent-teal-500"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>0%</span>
                                    <span>10%</span>
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="form-group">
                                <label className="label">Loan Duration (Months)</label>
                                <input
                                    type="number"
                                    value={loanDurationMonths}
                                    onChange={(e) => setLoanDurationMonths(Number(e.target.value))}
                                    min="1"
                                    max="360"
                                    className="input"
                                    placeholder="12"
                                />
                                <input
                                    type="range"
                                    value={loanDurationMonths}
                                    onChange={(e) => setLoanDurationMonths(Number(e.target.value))}
                                    min="1"
                                    max="60"
                                    className="w-full mt-2 accent-teal-500"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>1 month</span>
                                    <span>60 months</span>
                                </div>
                            </div>

                            {/* Interest Type */}
                            <div className="form-group">
                                <label className="label">Interest Type</label>
                                <div className="flex gap-4 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="interestType"
                                            value="simple"
                                            checked={interestType === 'simple'}
                                            onChange={(e) => setInterestType(e.target.value)}
                                            className="w-4 h-4 text-teal-600"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Simple (Flat Rate)
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="interestType"
                                            value="compound"
                                            checked={interestType === 'compound'}
                                            onChange={(e) => setInterestType(e.target.value)}
                                            className="w-4 h-4 text-teal-600"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Compound (Reducing)
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </motion.div>

                        {/* Results Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-6"
                        >
                            {/* EMI Result */}
                            {calculations && (
                                <div className="card p-6 bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                                    <p className="text-teal-100 text-sm mb-1">Monthly EMI</p>
                                    <p className="text-4xl font-bold mb-4">
                                        {formatCurrency(calculations.emi)}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-teal-400/30">
                                        <div>
                                            <p className="text-teal-100 text-sm">Total Interest</p>
                                            <p className="text-xl font-semibold">
                                                {formatCurrency(calculations.totalInterest)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-teal-100 text-sm">Total Payable</p>
                                            <p className="text-xl font-semibold">
                                                {formatCurrency(calculations.totalPayable)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Breakdown */}
                            {calculations && (
                                <div className="card p-6">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <FiPercent className="text-teal-500" />
                                        Breakdown
                                    </h3>

                                    {/* Visual breakdown bar */}
                                    <div className="h-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mb-4">
                                        <div
                                            className="h-full bg-gradient-to-r from-teal-500 to-teal-600"
                                            style={{
                                                width: `${(principal / calculations.totalPayable) * 100}%`,
                                            }}
                                        />
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-teal-500" />
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Principal: {formatCurrency(principal)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Interest: {formatCurrency(calculations.totalInterest)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                        <p className="text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2">
                                            <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            Interest adds {calculations.interestPercentage.toFixed(1)}% to your loan amount
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Disclaimer */}
                            <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
                                    <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>
                                        <strong>Estimate Only:</strong> Actual loan terms may vary based on eligibility and approval. This calculator uses the same formula as our loan creation system.
                                    </span>
                                </p>
                            </div>

                            {/* Share button */}
                            <button
                                onClick={handleShare}
                                className="btn btn-secondary w-full"
                            >
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
