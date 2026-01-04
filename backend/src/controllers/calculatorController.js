/**
 * Public Loan Calculator Controller
 * 
 * IMPORTANT: This uses the SAME calculation functions as loan creation.
 * The calculateLoanEstimate function from shared/loanCalculations.js is the
 * single source of truth for all loan calculations.
 */

const {
    calculateLoanEstimate,
} = require('../utils/calculators');

/**
 * @desc    Calculate loan estimate (public - no auth required)
 * @route   POST /api/calculator/estimate
 * @access  Public
 * 
 * This endpoint uses the EXACT SAME calculation logic as the loan creation form.
 * If a lender creates a loan with identical parameters, the numbers MUST match.
 */
const estimateLoan = async (req, res, next) => {
    try {
        const {
            principal,
            monthlyInterestRate,
            loanDurationMonths,
            interestType = 'simple',
            startDate,
        } = req.body;

        // Validate inputs
        if (!principal || principal < 1) {
            return res.status(400).json({
                success: false,
                message: 'Principal amount is required and must be at least 1',
            });
        }

        if (monthlyInterestRate === undefined || monthlyInterestRate < 0 || monthlyInterestRate > 100) {
            return res.status(400).json({
                success: false,
                message: 'Monthly interest rate must be between 0 and 100',
            });
        }

        if (!loanDurationMonths || loanDurationMonths < 1 || loanDurationMonths > 360) {
            return res.status(400).json({
                success: false,
                message: 'Loan duration must be between 1 and 360 months',
            });
        }

        if (!['simple', 'compound'].includes(interestType)) {
            return res.status(400).json({
                success: false,
                message: 'Interest type must be "simple" or "compound"',
            });
        }

        // Use the unified calculation function
        // This is the SAME function used when creating actual loans
        const estimate = calculateLoanEstimate({
            principal,
            monthlyInterestRate,
            loanDurationMonths,
            interestType,
            startDate: startDate ? new Date(startDate) : new Date(),
        });

        res.json({
            success: true,
            message: 'Loan estimate calculated successfully',
            disclaimer: 'This is an estimate only. Actual loan terms may vary based on approval.',
            data: {
                inputs: {
                    principal,
                    monthlyInterestRate,
                    loanDurationMonths,
                    interestType,
                },
                estimate: {
                    monthlyEMI: estimate.monthlyEMI,
                    totalAmountPayable: estimate.totalAmountPayable,
                    totalInterestAmount: estimate.totalInterestAmount,
                    endDate: estimate.endDate,
                },
                // Include a sample of the schedule (first 3 and last 3 months)
                sampleSchedule: {
                    firstMonths: estimate.amortizationSchedule.slice(0, 3),
                    lastMonths: estimate.amortizationSchedule.slice(-3),
                    totalMonths: estimate.amortizationSchedule.length,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get full amortization schedule for estimate
 * @route   POST /api/calculator/schedule
 * @access  Public
 */
const getFullSchedule = async (req, res, next) => {
    try {
        const {
            principal,
            monthlyInterestRate,
            loanDurationMonths,
            interestType = 'simple',
            startDate,
        } = req.body;

        // Validate inputs (same as estimate)
        if (!principal || principal < 1) {
            return res.status(400).json({
                success: false,
                message: 'Principal amount is required and must be at least 1',
            });
        }

        if (monthlyInterestRate === undefined || monthlyInterestRate < 0 || monthlyInterestRate > 100) {
            return res.status(400).json({
                success: false,
                message: 'Monthly interest rate must be between 0 and 100',
            });
        }

        if (!loanDurationMonths || loanDurationMonths < 1 || loanDurationMonths > 360) {
            return res.status(400).json({
                success: false,
                message: 'Loan duration must be between 1 and 360 months',
            });
        }

        // Use the unified calculation function
        const estimate = calculateLoanEstimate({
            principal,
            monthlyInterestRate,
            loanDurationMonths,
            interestType,
            startDate: startDate ? new Date(startDate) : new Date(),
        });

        res.json({
            success: true,
            disclaimer: 'This is an estimate only. Actual loan terms may vary.',
            data: {
                monthlyEMI: estimate.monthlyEMI,
                totalAmountPayable: estimate.totalAmountPayable,
                totalInterestAmount: estimate.totalInterestAmount,
                schedule: estimate.amortizationSchedule,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    estimateLoan,
    getFullSchedule,
};
