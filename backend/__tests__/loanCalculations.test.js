/**
 * Unit tests for loanCalculations.js
 *
 * Run with: npx jest __tests__/loanCalculations.test.js --verbose
 */

const {
    computeLoanStage,
    computeForeclosureSettlement,
    computeLateFee,
    computeOutstandingBalance,
    computeCollectionRate,
    computeRecoveryRate,
    selectPolicyContent,
} = require('../src/utils/loanCalculations');

const { LOAN_STATUS, FORECLOSURE_POLICY, LATE_FEE_TYPE, LOAN_STAGE } = require('../src/config/constants');

// Helper: build a minimal active loan object
function makeLoan({
    status = LOAN_STATUS.ACTIVE,
    paymentsReceived = 0,
    gracePeriodDays = 0,
    remainingBalance = 10000,
    dueDateOffset = 5, // positive = future, negative = past
} = {}) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueDateOffset);
    return {
        status,
        paymentsReceived,
        gracePeriodDays,
        remainingBalance,
        amortizationSchedule: [
            { month: 1, emi: 1000, principal: 800, interest: 200, balance: 9200, dueDate },
        ],
    };
}

// ─────────────────────────────────────────────
// 1. computeLoanStage
// ─────────────────────────────────────────────
describe('computeLoanStage', () => {
    test('returns UPCOMING when due date is in the future', () => {
        const loan = makeLoan({ dueDateOffset: 5 });
        expect(computeLoanStage(loan)).toBe(LOAN_STAGE.UPCOMING);
    });

    test('returns DUE_TODAY when due date is today', () => {
        const loan = makeLoan({ dueDateOffset: 0 });
        expect(computeLoanStage(loan)).toBe(LOAN_STAGE.DUE_TODAY);
    });

    test('returns GRACE when within grace period', () => {
        const loan = makeLoan({ dueDateOffset: -3, gracePeriodDays: 5 });
        expect(computeLoanStage(loan)).toBe(LOAN_STAGE.GRACE);
    });

    test('returns OVERDUE when past grace period but within 30 extra days', () => {
        const loan = makeLoan({ dueDateOffset: -10, gracePeriodDays: 5 });
        expect(computeLoanStage(loan)).toBe(LOAN_STAGE.OVERDUE);
    });

    test('returns DEFAULT when very long overdue (grace + 30 days exceeded)', () => {
        const loan = makeLoan({ dueDateOffset: -65, gracePeriodDays: 0 });
        expect(computeLoanStage(loan)).toBe(LOAN_STAGE.DEFAULT);
    });

    test('returns loan status for non-active loans', () => {
        const loan = makeLoan({ status: LOAN_STATUS.COMPLETED });
        expect(computeLoanStage(loan)).toBe(LOAN_STATUS.COMPLETED);
    });

    test('returns UPCOMING when no schedule entry remains (all paid)', () => {
        const loan = makeLoan({ paymentsReceived: 1 }); // only 1 entry, all consumed
        expect(computeLoanStage(loan)).toBe(LOAN_STAGE.UPCOMING);
    });
});

// ─────────────────────────────────────────────
// 2. computeForeclosureSettlement
// ─────────────────────────────────────────────
describe('computeForeclosureSettlement', () => {
    test('NOT_ALLOWED returns error', () => {
        const result = computeForeclosureSettlement(5000, FORECLOSURE_POLICY.NOT_ALLOWED, 0);
        expect(result.error).toBeTruthy();
        expect(result.settlementAmount).toBe(0);
    });

    test('WITHOUT_DISCOUNT returns full balance, no discount', () => {
        const result = computeForeclosureSettlement(4200, FORECLOSURE_POLICY.WITHOUT_DISCOUNT, 0);
        expect(result.error).toBeNull();
        expect(result.settlementAmount).toBe(4200);
        expect(result.discountApplied).toBe(0);
    });

    test('MANUAL_DISCOUNT applies discount correctly', () => {
        const result = computeForeclosureSettlement(4200, FORECLOSURE_POLICY.MANUAL_DISCOUNT, 300);
        expect(result.error).toBeNull();
        expect(result.discountApplied).toBe(300);
        expect(result.settlementAmount).toBe(3900);
    });

    test('MANUAL_DISCOUNT rejects discount exceeding balance', () => {
        const result = computeForeclosureSettlement(4200, FORECLOSURE_POLICY.MANUAL_DISCOUNT, 5000);
        expect(result.error).toBeTruthy();
    });

    test('MANUAL_DISCOUNT with zero discount returns full balance', () => {
        const result = computeForeclosureSettlement(4200, FORECLOSURE_POLICY.MANUAL_DISCOUNT, 0);
        expect(result.settlementAmount).toBe(4200);
        expect(result.discountApplied).toBe(0);
    });
});

// ─────────────────────────────────────────────
// 3. computeLateFee
// ─────────────────────────────────────────────
describe('computeLateFee', () => {
    test('returns 0 when lateFeeType is NONE', () => {
        const result = computeLateFee(1000, LATE_FEE_TYPE.NONE, 0, 10, 0);
        expect(result.fee).toBe(0);
        expect(result.applicable).toBe(false);
    });

    test('returns 0 within grace period (even if FIXED type)', () => {
        const result = computeLateFee(1000, LATE_FEE_TYPE.FIXED, 100, 3, 5);
        expect(result.fee).toBe(0);
        expect(result.applicable).toBe(false);
    });

    test('returns fixed fee after grace period', () => {
        const result = computeLateFee(1000, LATE_FEE_TYPE.FIXED, 150, 10, 5);
        expect(result.fee).toBe(150);
        expect(result.applicable).toBe(true);
    });

    test('returns percentage-based fee after grace period', () => {
        // 2% of 1000 EMI = 20
        const result = computeLateFee(1000, LATE_FEE_TYPE.PERCENTAGE, 2, 10, 5);
        expect(result.fee).toBe(20);
        expect(result.applicable).toBe(true);
    });

    test('returns 0 when daysLate equals grace period exactly', () => {
        const result = computeLateFee(1000, LATE_FEE_TYPE.FIXED, 100, 5, 5);
        expect(result.fee).toBe(0);
        expect(result.applicable).toBe(false);
    });
});

// ─────────────────────────────────────────────
// 4. computeOutstandingBalance
// ─────────────────────────────────────────────
describe('computeOutstandingBalance', () => {
    test('returns remainingBalance for a fresh loan', () => {
        expect(computeOutstandingBalance({ remainingBalance: 12000 })).toBe(12000);
    });

    test('returns 0 for a fully paid loan', () => {
        expect(computeOutstandingBalance({ remainingBalance: 0 })).toBe(0);
    });

    test('handles undefined remainingBalance gracefully', () => {
        expect(computeOutstandingBalance({})).toBe(0);
    });

    test('clamps negative balance to 0', () => {
        expect(computeOutstandingBalance({ remainingBalance: -100 })).toBe(0);
    });
});

// ─────────────────────────────────────────────
// 5. computeCollectionRate & computeRecoveryRate
// ─────────────────────────────────────────────
describe('computeCollectionRate', () => {
    test('returns 0 when nothing collected', () => {
        expect(computeCollectionRate(0, 10000)).toBe(0);
    });

    test('returns 50 when half collected', () => {
        expect(computeCollectionRate(5000, 10000)).toBe(50);
    });

    test('returns 100 when fully collected', () => {
        expect(computeCollectionRate(10000, 10000)).toBe(100);
    });

    test('returns 0 when totalPayable is 0 (edge case)', () => {
        expect(computeCollectionRate(0, 0)).toBe(0);
    });

    test('caps at 100 even if overpaid', () => {
        expect(computeCollectionRate(12000, 10000)).toBe(100);
    });
});

describe('computeRecoveryRate', () => {
    test('returns 0 when no defaulted principal', () => {
        expect(computeRecoveryRate(0, 0)).toBe(0);
    });

    test('returns correct percentage', () => {
        expect(computeRecoveryRate(2500, 5000)).toBe(50);
    });
});

// ─────────────────────────────────────────────
// 6. selectPolicyContent
// ─────────────────────────────────────────────
describe('selectPolicyContent', () => {
    const policiesMap = {
        terms: { version: 'v1.2', content: 'Terms content here' },
        privacy: { version: 'v1.0', content: 'Privacy content here' },
    };

    test('returns version and content for existing type', () => {
        const result = selectPolicyContent(policiesMap, 'terms');
        expect(result).toEqual({ version: 'v1.2', content: 'Terms content here' });
    });

    test('returns null for missing policy type', () => {
        const result = selectPolicyContent(policiesMap, 'foreclosure');
        expect(result).toBeNull();
    });

    test('returns null for empty map', () => {
        const result = selectPolicyContent({}, 'terms');
        expect(result).toBeNull();
    });
});