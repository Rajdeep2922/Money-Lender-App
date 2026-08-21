/**
 * loanCalculations.js
 *
 * Pure utility functions for all business-critical loan calculations.
 * No database access — these functions only operate on plain values.
 * All are unit-tested in __tests__/loanCalculations.test.js
 */

const { LOAN_STAGE, LOAN_STATUS, FORECLOSURE_POLICY, LATE_FEE_TYPE } = require('../config/constants');

/**
 * Compute the current loan stage dynamically from dates.
 * Never stored in the database — calculated on every request.
 *
 * @param {Object} loan  - Loan document (plain object or Mongoose doc)
 * @param {Date}   now   - Current date (injected for testability)
 * @returns {string}     - One of LOAN_STAGE values
 */
function computeLoanStage(loan, now = new Date()) {
    // Non-active loans report their actual status as the stage
    if (loan.status !== LOAN_STATUS.ACTIVE) {
        return loan.status;
    }

    const schedule = loan.amortizationSchedule || [];
    const nextEntry = schedule[loan.paymentsReceived];

    if (!nextEntry) {
        // All payments made but status not yet updated
        return LOAN_STAGE.UPCOMING;
    }

    const dueDate = new Date(nextEntry.dueDate);
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueMidnight = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

    const diffMs = nowMidnight - dueMidnight;
    const daysLate = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const gracePeriod = loan.gracePeriodDays || 0;
    const defaultThreshold = 30; // Days past grace before "Default" label

    if (daysLate < 0) return LOAN_STAGE.UPCOMING;
    if (daysLate === 0) return LOAN_STAGE.DUE_TODAY;
    if (daysLate <= gracePeriod) return LOAN_STAGE.GRACE;
    if (daysLate <= gracePeriod + defaultThreshold) return LOAN_STAGE.OVERDUE;
    return LOAN_STAGE.DEFAULT;
}

/**
 * Compute the foreclosure settlement amount.
 *
 * @param {number} remainingBalance    - Current outstanding balance on the loan
 * @param {string} policy              - FORECLOSURE_POLICY enum value
 * @param {number} [discount=0]        - Discount to apply (only for MANUAL_DISCOUNT)
 * @returns {{ settlementAmount: number, discountApplied: number, error: string|null }}
 */
function computeForeclosureSettlement(remainingBalance, policy, discount = 0) {
    if (policy === FORECLOSURE_POLICY.NOT_ALLOWED) {
        return { settlementAmount: 0, discountApplied: 0, error: 'Foreclosure is not allowed for this loan.' };
    }

    if (policy === FORECLOSURE_POLICY.WITHOUT_DISCOUNT) {
        return { settlementAmount: remainingBalance, discountApplied: 0, error: null };
    }

    if (policy === FORECLOSURE_POLICY.MANUAL_DISCOUNT) {
        const safeDiscount = Math.max(0, Number(discount) || 0);
        if (safeDiscount > remainingBalance) {
            return { settlementAmount: 0, discountApplied: 0, error: 'Discount cannot exceed outstanding balance.' };
        }
        const settlementAmount = remainingBalance - safeDiscount;
        return { settlementAmount, discountApplied: safeDiscount, error: null };
    }

    return { settlementAmount: remainingBalance, discountApplied: 0, error: null };
}

/**
 * Compute late fee for an overdue EMI.
 *
 * @param {number} emiAmount       - Monthly EMI amount
 * @param {string} lateFeeType     - LATE_FEE_TYPE enum value
 * @param {number} lateFeeValue    - Value: flat rupees (FIXED) or percent (PERCENTAGE)
 * @param {number} daysLate        - How many days past the due date
 * @param {number} gracePeriodDays - Grace period; no fee applies within this window
 * @returns {{ fee: number, applicable: boolean }}
 */
function computeLateFee(emiAmount, lateFeeType, lateFeeValue, daysLate, gracePeriodDays = 0) {
    if (lateFeeType === LATE_FEE_TYPE.NONE) {
        return { fee: 0, applicable: false };
    }
    if (daysLate <= gracePeriodDays) {
        return { fee: 0, applicable: false };
    }

    if (lateFeeType === LATE_FEE_TYPE.FIXED) {
        return { fee: Number(lateFeeValue) || 0, applicable: true };
    }

    if (lateFeeType === LATE_FEE_TYPE.PERCENTAGE) {
        const rate = (Number(lateFeeValue) || 0) / 100;
        const fee = Math.round(emiAmount * rate * 100) / 100;
        return { fee, applicable: true };
    }

    return { fee: 0, applicable: false };
}

/**
 * Compute total outstanding balance from loan fields.
 *
 * @param {Object} loan - Loan document
 * @returns {number}    - Outstanding balance
 */
function computeOutstandingBalance(loan) {
    return Math.max(0, loan.remainingBalance || 0);
}

/**
 * Compute collection rate as a percentage.
 *
 * @param {number} totalReceived - Total payments received
 * @param {number} totalPayable  - Total amount payable on the loan
 * @returns {number}             - 0–100 percentage
 */
function computeCollectionRate(totalReceived, totalPayable) {
    if (!totalPayable || totalPayable === 0) return 0;
    return Math.min(100, Math.round((totalReceived / totalPayable) * 10000) / 100);
}

/**
 * Compute recovery rate for defaulted loans.
 *
 * @param {number} recoveredAmount     - Amount actually recovered from defaulted loans
 * @param {number} defaultedPrincipal  - Total principal of defaulted loans
 * @returns {number}                   - 0–100 percentage
 */
function computeRecoveryRate(recoveredAmount, defaultedPrincipal) {
    if (!defaultedPrincipal || defaultedPrincipal === 0) return 0;
    return Math.min(100, Math.round((recoveredAmount / defaultedPrincipal) * 10000) / 100);
}

/**
 * Select the active policy version reference from a map of policies.
 * Returns { version, content } for the given type, or null if missing.
 *
 * @param {Object} policiesMap  - Map of policyType -> LegalPolicy document
 * @param {string} type         - LEGAL_POLICY_TYPE value
 * @returns {{ version: string, content: string }|null}
 */
function selectPolicyContent(policiesMap, type) {
    const policy = policiesMap[type];
    if (!policy) return null;
    return { version: policy.version, content: policy.content };
}

module.exports = {
    computeLoanStage,
    computeForeclosureSettlement,
    computeLateFee,
    computeOutstandingBalance,
    computeCollectionRate,
    computeRecoveryRate,
    selectPolicyContent,
};
