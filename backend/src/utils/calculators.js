/**
 * Loan Interest Calculation System
 * 
 * This file re-exports all calculations from the shared module.
 * The shared module is the SINGLE SOURCE OF TRUTH for all loan calculations.
 * 
 * DO NOT add new calculation logic here - add it to shared/loanCalculations.js
 */

const {
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
} = require('../../../shared/loanCalculations.js');

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

