/**
 * Regression tests: EMI Schedule First-Due-Date Bug Fix
 *
 * Verifies that:
 *   1. With no firstPaymentDate, EMI #1 = startDate + 1 month (not startDate).
 *   2. An explicit firstPaymentDate is respected exactly.
 *   3. All subsequent EMIs are sequential from the correct base date.
 *   4. Existing overdue/grace/default status logic is unaffected.
 *   5. Principal/interest/balance calculations are unaffected.
 *
 * The shared/loanCalculations.js file has a bare `export {}` line for ESM
 * compatibility that Jest cannot parse. We strip it at require-time via
 * a jest.mock moduleNameMapper approach (same pattern used in customAgreement.test.js
 * which mocks calculators as {}). Instead here we load the CJS module.exports
 * branch by registering a transform that strips the bare export line.
 */

// ─── Pull schedule functions directly from the shared CJS module ──────────
// Jest can't parse the bare `export { ... }` line, so we strip it first.
const fs = require('fs');
const path = require('path');

const sharedSrc = fs.readFileSync(
    path.resolve(__dirname, '../../shared/loanCalculations.js'),
    'utf-8'
).replace(/^export\s+\{[^}]*\};?\s*(\r?\n|$)/m, '');

const sharedModule = { exports: {} };
// eslint-disable-next-line no-new-func
new Function('module', 'exports', 'require', sharedSrc)(sharedModule, sharedModule.exports, require);

const {
    generateAmortizationSchedule,
    generateCompoundAmortizationSchedule,
} = sharedModule.exports;

// ─── Pull computeLoanStage from the backend's loanCalculations utility ────
const {
    computeLoanStage,
} = require('../src/utils/loanCalculations');

const { LOAN_STATUS, LOAN_STAGE } = require('../src/config/constants');

// ─────────────────────────────────────────────────────────────────────────────
// 1. Flat-rate (simple interest) schedule
// ─────────────────────────────────────────────────────────────────────────────
describe('generateAmortizationSchedule — first-due-date fix', () => {
    const principal = 100000;
    const rate = 1;       // 1% monthly
    const tenure = 12;
    const emi = 8884.88;
    const startDate = new Date('2026-09-08');

    test('EMI #1 is 1 month after startDate when no firstPaymentDate is given', () => {
        const schedule = generateAmortizationSchedule(principal, rate, tenure, emi, startDate);
        const firstDue = new Date(schedule[0].dueDate);
        expect(firstDue.getFullYear()).toBe(2026);
        expect(firstDue.getMonth()).toBe(9);  // October (0-indexed)
        expect(firstDue.getDate()).toBe(8);
    });

    test('EMI #2 is 2 months after startDate, EMI #12 is 12 months after', () => {
        const schedule = generateAmortizationSchedule(principal, rate, tenure, emi, startDate);
        // EMI #1 → Oct 2026 (month index 9), EMI #2 → Nov 2026 (index 10), etc.
        const expected = [
            { year: 2026, month: 9  },  // Oct
            { year: 2026, month: 10 },  // Nov
            { year: 2026, month: 11 },  // Dec
            { year: 2027, month: 0  },  // Jan
        ];
        for (let i = 0; i < expected.length; i++) {
            const d = new Date(schedule[i].dueDate);
            expect(d.getFullYear()).toBe(expected[i].year);
            expect(d.getMonth()).toBe(expected[i].month);
            expect(d.getDate()).toBe(8);
        }
    });

    test('explicit firstPaymentDate = 15 Sept is used as EMI #1 (not replaced by +1 month)', () => {
        const explicit = new Date('2026-09-15');
        const schedule = generateAmortizationSchedule(principal, rate, tenure, emi, startDate, explicit);
        const firstDue = new Date(schedule[0].dueDate);
        expect(firstDue.getFullYear()).toBe(2026);
        expect(firstDue.getMonth()).toBe(8);   // September
        expect(firstDue.getDate()).toBe(15);
    });

    test('EMI #2 is firstPaymentDate + 1 month when explicit firstPaymentDate is set', () => {
        const explicit = new Date('2026-09-15');
        const schedule = generateAmortizationSchedule(principal, rate, tenure, emi, startDate, explicit);
        const secondDue = new Date(schedule[1].dueDate);
        expect(secondDue.getFullYear()).toBe(2026);
        expect(secondDue.getMonth()).toBe(9);  // October
        expect(secondDue.getDate()).toBe(15);
    });

    test('EMI #1 due 8 Oct 2026 is UPCOMING (not OVERDUE) on 8 Sept 2026', () => {
        const schedule = generateAmortizationSchedule(principal, rate, tenure, emi, startDate);
        const fakeLoan = {
            status: LOAN_STATUS.ACTIVE,
            paymentsReceived: 0,
            gracePeriodDays: 0,
            remainingBalance: principal,
            amortizationSchedule: schedule,
        };
        // Simulate "today = 8 Sept 2026" — the loan creation date
        const today = new Date('2026-09-08');
        const stage = computeLoanStage(fakeLoan, today);
        expect(stage).toBe(LOAN_STAGE.UPCOMING);
    });

    test('principal/interest amounts are unaffected — totals still sum to principal', () => {
        const schedule = generateAmortizationSchedule(principal, rate, tenure, emi, startDate);
        const totalPrincipalPaid = schedule.reduce((sum, e) => sum + e.principal, 0);
        expect(Math.abs(totalPrincipalPaid - principal)).toBeLessThan(1);
        expect(schedule[schedule.length - 1].balance).toBe(0);
    });

    // ── Overdue/grace/default logic unchanged ──────────────────────────────

    test('EMI 15 days past with grace=0 → OVERDUE (existing logic preserved)', () => {
        const pastDate = new Date('2026-09-08');
        pastDate.setDate(pastDate.getDate() - 15);
        const fakeLoan = {
            status: LOAN_STATUS.ACTIVE,
            paymentsReceived: 0,
            gracePeriodDays: 0,
            remainingBalance: principal,
            amortizationSchedule: [
                { month: 1, emi: 8884.88, principal: 7884.88, interest: 1000, balance: 92115.12, dueDate: pastDate },
            ],
        };
        expect(computeLoanStage(fakeLoan)).toBe(LOAN_STAGE.OVERDUE);
    });

    test('EMI 60 days past with grace=0 → DEFAULT (existing logic preserved)', () => {
        const pastDate = new Date('2026-09-08');
        pastDate.setDate(pastDate.getDate() - 60);
        const fakeLoan = {
            status: LOAN_STATUS.ACTIVE,
            paymentsReceived: 0,
            gracePeriodDays: 0,
            remainingBalance: principal,
            amortizationSchedule: [
                { month: 1, emi: 8884.88, principal: 7884.88, interest: 1000, balance: 92115.12, dueDate: pastDate },
            ],
        };
        expect(computeLoanStage(fakeLoan)).toBe(LOAN_STAGE.DEFAULT);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Compound (reducing balance) schedule
// ─────────────────────────────────────────────────────────────────────────────
describe('generateCompoundAmortizationSchedule — first-due-date fix', () => {
    const principal = 100000;
    const rate = 1;
    const tenure = 12;
    const emi = 8884.88;
    const startDate = new Date('2026-09-08');

    test('compound: EMI #1 is 1 month after startDate when no firstPaymentDate is given', () => {
        const schedule = generateCompoundAmortizationSchedule(principal, rate, tenure, emi, startDate);
        const firstDue = new Date(schedule[0].dueDate);
        expect(firstDue.getFullYear()).toBe(2026);
        expect(firstDue.getMonth()).toBe(9);  // October
        expect(firstDue.getDate()).toBe(8);
    });

    test('compound: explicit firstPaymentDate (15 Sept) is used as EMI #1', () => {
        const explicit = new Date('2026-09-15');
        const schedule = generateCompoundAmortizationSchedule(principal, rate, tenure, emi, startDate, explicit);
        const firstDue = new Date(schedule[0].dueDate);
        expect(firstDue.getMonth()).toBe(8); // September
        expect(firstDue.getDate()).toBe(15);
    });

    test('compound: EMI #2 = firstPaymentDate + 1 month when explicit firstPaymentDate is set', () => {
        const explicit = new Date('2026-09-15');
        const schedule = generateCompoundAmortizationSchedule(principal, rate, tenure, emi, startDate, explicit);
        const secondDue = new Date(schedule[1].dueDate);
        expect(secondDue.getMonth()).toBe(9); // October
        expect(secondDue.getDate()).toBe(15);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Weekly schedule simulation
// ─────────────────────────────────────────────────────────────────────────────
describe('weekly firstPaymentDate support', () => {
    const principal = 100000;
    const rate = 1;
    const tenure = 12;
    const emi = 8884.88;
    const startDate = new Date('2026-09-08');

    test('weekly: explicit firstPaymentDate 7 days later (15 Sept) is used as EMI #1', () => {
        const weeklyFirst = new Date('2026-09-15'); // startDate + 7 days
        const schedule = generateAmortizationSchedule(principal, rate, tenure, emi, startDate, weeklyFirst);
        const firstDue = new Date(schedule[0].dueDate);
        expect(firstDue.getDate()).toBe(15);
        expect(firstDue.getMonth()).toBe(8); // September
    });
});
