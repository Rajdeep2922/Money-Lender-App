/**
 * Loan Interest Calculation System
 * Supports: Flat Rate Method (Simple Interest)
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
 * Generate Amortization Schedule (Flat Rate)
 * Interest is constant every month based on original principal.
 * @param {number} principal - Loan amount
 * @param {number} monthlyRate - Monthly interest rate in percentage
 * @param {number} tenure - Loan duration in months
 * @param {number} emi - Monthly EMI
 * @param {Date} startDate - Loan start date
 * @returns {Array} Array of payment schedule objects
 */
const generateAmortizationSchedule = (principal, monthlyRate, tenure, emi, startDate = new Date()) => {
    const monthlyRateDecimal = monthlyRate / 100;
    const monthlyInterest = Math.round(principal * monthlyRateDecimal * 100) / 100;
    let remainingBalance = principal;
    const schedule = [];

    for (let month = 1; month <= tenure; month++) {
        // In Flat Rate, interest component is fixed (Interest on Principal)
        // Principal component = EMI - Fixed Interest
        const interestPayment = monthlyInterest;
        let principalPayment = Math.round((emi - interestPayment) * 100) / 100;

        // Adjust for last month rounding
        if (month === tenure) {
            principalPayment = remainingBalance;
        }

        remainingBalance = Math.round((remainingBalance - principalPayment) * 100) / 100;

        // Calculate due date
        const dueDate = new Date(startDate);
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

module.exports = {
    calculateMonthlyEMI,
    generateAmortizationSchedule,
    calculateTotalInterest,
    calculateRemainingBalance,
    calculateInterestForPeriod,
    calculatePrepaymentAmount,
};
