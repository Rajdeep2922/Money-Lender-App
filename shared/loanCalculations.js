/**
 * Unified Loan Calculation System
 * 
 * IMPORTANT: This is the SINGLE SOURCE OF TRUTH for all loan calculations.
 * Used by: Loan creation, Customer portal, Public calculator
 * 
 * DO NOT duplicate this logic elsewhere. Any changes here affect all contexts.
 * 
 * Supports:
 * - Flat Rate Method (Simple Interest)
 * - Reducing Balance Method (Compound Interest)
 */

/**
 * Calculate Monthly EMI using Flat Rate Method (Simple Interest)
 * Formula: EMI = (P + (P * r * n)) / n
 * @param {number} principal - Loan amount
 * @param {number} monthlyRate - Monthly interest rate in percentage
 * @param {number} tenure - Loan duration in months
 * @returns {number} Monthly EMI (rounded to 2 decimal places)
 */
const calculateMonthlyEMI = (principal, monthlyRate, tenure) => {
    const monthlyRateDecimal = monthlyRate / 100;
    const totalInterest = principal * monthlyRateDecimal * tenure;
    const totalAmount = principal + totalInterest;
    return Math.round((totalAmount / tenure) * 100) / 100;
};

/**
 * Calculate Monthly EMI using Compound Interest (Reducing Balance Method)
 * Formula: EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 * @param {number} principal - Loan amount
 * @param {number} monthlyRate - Monthly interest rate in percentage
 * @param {number} tenure - Loan duration in months
 * @returns {number} Monthly EMI (rounded to 2 decimal places)
 */
const calculateCompoundEMI = (principal, monthlyRate, tenure) => {
    const r = monthlyRate / 100;
    if (r === 0) return Math.round((principal / tenure) * 100) / 100;
    const factor = Math.pow(1 + r, tenure);
    const emi = (principal * r * factor) / (factor - 1);
    return Math.round(emi * 100) / 100;
};

/**
 * Generate Amortization Schedule (Flat Rate / Simple Interest)
 * Interest is constant every month based on original principal.
 * @param {number} principal - Loan amount
 * @param {number} monthlyRate - Monthly interest rate in percentage
 * @param {number} tenure - Loan duration in months
 * @param {number} emi - Monthly EMI
 * @param {Date|string} startDate - Loan start date
 * @returns {Array} Array of payment schedule objects
 */
const generateAmortizationSchedule = (principal, monthlyRate, tenure, emi, startDate = new Date()) => {
    const monthlyRateDecimal = monthlyRate / 100;
    const monthlyInterest = Math.round(principal * monthlyRateDecimal * 100) / 100;
    let remainingBalance = principal;
    const schedule = [];
    const start = new Date(startDate);

    for (let month = 1; month <= tenure; month++) {
        const interestPayment = monthlyInterest;
        let principalPayment = Math.round((emi - interestPayment) * 100) / 100;

        // Adjust for last month rounding
        if (month === tenure) {
            principalPayment = remainingBalance;
        }

        remainingBalance = Math.round((remainingBalance - principalPayment) * 100) / 100;

        // Calculate due date
        const dueDate = new Date(start);
        dueDate.setMonth(dueDate.getMonth() + month);

        schedule.push({
            month,
            emi,
            principal: principalPayment,
            interest: interestPayment,
            balance: Math.max(0, remainingBalance),
            dueDate,
        });

        if (remainingBalance <= 0 && month !== tenure) break;
    }

    return schedule;
};

/**
 * Generate Amortization Schedule for Compound Interest (Reducing Balance)
 * @param {number} principal - Loan amount
 * @param {number} monthlyRate - Monthly interest rate in percentage
 * @param {number} tenure - Loan duration in months
 * @param {number} emi - Monthly EMI
 * @param {Date|string} startDate - Loan start date
 * @returns {Array} Array of payment schedule objects
 */
const generateCompoundAmortizationSchedule = (principal, monthlyRate, tenure, emi, startDate = new Date()) => {
    const r = monthlyRate / 100;
    let balance = principal;
    const schedule = [];
    const start = new Date(startDate);

    for (let month = 1; month <= tenure; month++) {
        const interestPayment = Math.round(balance * r * 100) / 100;
        let principalPayment = Math.round((emi - interestPayment) * 100) / 100;

        // Adjust for last month rounding
        if (month === tenure) {
            principalPayment = balance;
        }

        balance = Math.round((balance - principalPayment) * 100) / 100;

        const dueDate = new Date(start);
        dueDate.setMonth(dueDate.getMonth() + month);

        schedule.push({
            month,
            emi,
            principal: principalPayment,
            interest: interestPayment,
            balance: Math.max(0, balance),
            dueDate,
        });

        if (balance <= 0 && month !== tenure) break;
    }

    return schedule;
};

/**
 * Calculate Total Interest
 * @param {number} emi - Monthly EMI
 * @param {number} tenure - Loan duration in months
 * @param {number} principal - Original loan amount
 * @returns {number} Total interest amount
 */
const calculateTotalInterest = (emi, tenure, principal) => {
    return Math.round((emi * tenure - principal) * 100) / 100;
};

/**
 * Calculate Total Amount Payable
 * @param {number} emi - Monthly EMI
 * @param {number} tenure - Loan duration in months
 * @returns {number} Total amount payable
 */
const calculateTotalPayable = (emi, tenure) => {
    return Math.round(emi * tenure * 100) / 100;
};

/**
 * Calculate Remaining Balance after N payments
 * @param {Array} schedule - Amortization schedule
 * @param {number} paymentsReceived - Number of payments made
 * @returns {number} Remaining balance
 */
const calculateRemainingBalance = (schedule, paymentsReceived) => {
    if (paymentsReceived <= 0) return schedule[0]?.balance + schedule[0]?.principal || 0;
    if (paymentsReceived >= schedule.length) return 0;
    return schedule[paymentsReceived - 1]?.balance || 0;
};

/**
 * Calculate Interest for Specific Period
 * @param {number} balance - Outstanding balance
 * @param {number} monthlyRate - Monthly interest rate in percentage
 * @param {number} days - Number of days
 * @returns {number} Interest amount for the period
 */
const calculateInterestForPeriod = (balance, monthlyRate, days) => {
    const monthlyRateDecimal = monthlyRate / 100;
    const dailyRate = monthlyRateDecimal / 30;
    return Math.round(balance * dailyRate * days * 100) / 100;
};

/**
 * Calculate Prepayment/Closure Amount
 * @param {number} balance - Outstanding principal balance
 * @param {number} monthlyRate - Monthly interest rate in percentage
 * @param {number} daysInMonth - Days since last payment
 * @returns {number} Total amount needed to close the loan
 */
const calculatePrepaymentAmount = (balance, monthlyRate, daysInMonth = 30) => {
    const interestDue = calculateInterestForPeriod(balance, monthlyRate, daysInMonth);
    return Math.round((balance + interestDue) * 100) / 100;
};

/**
 * Calculate full loan estimate - unified function for all contexts
 * @param {Object} params - Loan parameters
 * @param {number} params.principal - Loan amount
 * @param {number} params.monthlyInterestRate - Monthly interest rate in percentage
 * @param {number} params.loanDurationMonths - Loan duration in months
 * @param {string} params.interestType - 'simple' or 'compound'
 * @param {Date|string} [params.startDate] - Loan start date
 * @param {number} [params.manualEMI] - Optional manual EMI override
 * @returns {Object} Full loan calculation results
 */
const calculateLoanEstimate = ({
    principal,
    monthlyInterestRate,
    loanDurationMonths,
    interestType = 'simple',
    startDate = new Date(),
    manualEMI = null
}) => {
    // Calculate EMI (use manual if provided, otherwise calculate)
    let monthlyEMI;
    if (manualEMI && manualEMI > 0) {
        monthlyEMI = manualEMI;
    } else {
        monthlyEMI = interestType === 'compound'
            ? calculateCompoundEMI(principal, monthlyInterestRate, loanDurationMonths)
            : calculateMonthlyEMI(principal, monthlyInterestRate, loanDurationMonths);
    }

    // Generate amortization schedule
    const amortizationSchedule = interestType === 'compound'
        ? generateCompoundAmortizationSchedule(principal, monthlyInterestRate, loanDurationMonths, monthlyEMI, startDate)
        : generateAmortizationSchedule(principal, monthlyInterestRate, loanDurationMonths, monthlyEMI, startDate);

    // Calculate totals
    const totalAmountPayable = calculateTotalPayable(monthlyEMI, loanDurationMonths);
    const totalInterestAmount = calculateTotalInterest(monthlyEMI, loanDurationMonths, principal);

    // Calculate end date
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + loanDurationMonths);

    return {
        monthlyEMI,
        totalAmountPayable,
        totalInterestAmount,
        amortizationSchedule,
        endDate,
        principal,
        monthlyInterestRate,
        loanDurationMonths,
        interestType
    };
};

// Export for both CommonJS (Node.js) and ES Modules (Browser/Vite)
// Check if we're in a CommonJS environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateMonthlyEMI,
        calculateCompoundEMI,
        generateAmortizationSchedule,
        generateCompoundAmortizationSchedule,
        calculateTotalInterest,
        calculateTotalPayable,
        calculateRemainingBalance,
        calculateInterestForPeriod,
        calculatePrepaymentAmount,
        calculateLoanEstimate,
    };
}

// Named exports for ES Modules
export {
    calculateMonthlyEMI,
    calculateCompoundEMI,
    generateAmortizationSchedule,
    generateCompoundAmortizationSchedule,
    calculateTotalInterest,
    calculateTotalPayable,
    calculateRemainingBalance,
    calculateInterestForPeriod,
    calculatePrepaymentAmount,
    calculateLoanEstimate,
};
