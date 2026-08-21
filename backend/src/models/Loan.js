const mongoose = require('mongoose');
const { LOAN_STATUS, FORECLOSURE_POLICY, LATE_FEE_TYPE, LOAN_COMPLETION_TYPE, DISCOUNT_REASON } = require('../config/constants');

const amortizationSchema = new mongoose.Schema({
    month: { type: Number, required: true },
    emi: { type: Number, required: true },
    principal: { type: Number, required: true },
    interest: { type: Number, required: true },
    balance: { type: Number, required: true },
    dueDate: { type: Date, required: true },
}, { _id: false });

// Immutable snapshot of the legal policies accepted when the agreement was generated.
// Written ONCE and never overwritten — even if the lender edits policies later.
const agreementSnapshotSchema = new mongoose.Schema({
    agreementVersion: { type: String },
    termsVersion: { type: String },
    termsContent: { type: String },
    interestPolicy: { type: String },
    emiPolicy: { type: String },
    foreclosurePolicy: { type: String },
    defaultPolicy: { type: String },
    privacyPolicy: { type: String },
    generatedAt: { type: Date },
}, { _id: false });

const loanSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, 'Customer is required'],
        index: true,
    },
    loanNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    principal: {
        type: Number,
        required: [true, 'Loan principal amount is required'],
        min: [1, 'Principal must be at least 1'],
    },
    monthlyInterestRate: {
        type: Number,
        required: [true, 'Monthly interest rate is required'],
        min: [0, 'Interest rate cannot be negative'],
        max: [100, 'Interest rate cannot exceed 100%'],
    },
    loanDurationMonths: {
        type: Number,
        required: [true, 'Loan duration is required'],
        min: [1, 'Duration must be at least 1 month'],
        max: [360, 'Duration cannot exceed 360 months'],
    },
    interestType: {
        type: String,
        enum: ['simple', 'compound'],
        default: 'simple',
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
    },
    endDate: {
        type: Date,
    },
    monthlyEMI: {
        type: Number,
        required: true,
    },
    totalAmountPayable: {
        type: Number,
        required: true,
    },
    totalInterestAmount: {
        type: Number,
        required: true,
    },
    remainingBalance: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(LOAN_STATUS),
        default: LOAN_STATUS.PENDING_APPROVAL,
        index: true,
    },
    lenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lender',
        index: true,
    },
    approvalDate: {
        type: Date,
    },
    paymentsReceived: {
        type: Number,
        default: 0,
    },
    amortizationSchedule: [amortizationSchema],
    notes: {
        type: String,
        trim: true,
    },

    // ── Per-Loan Policy (inherited from lender defaults at creation, overridable) ──
    gracePeriodDays: {
        type: Number,
        enum: [0, 3, 5, 7, 15, 30],
        default: 0,
    },
    lateFeeType: {
        type: String,
        enum: Object.values(LATE_FEE_TYPE),
        default: LATE_FEE_TYPE.NONE,
    },
    lateFeeValue: {
        type: Number,
        default: 0,
        min: 0,
    },
    foreclosurePolicy: {
        type: String,
        enum: Object.values(FORECLOSURE_POLICY),
        default: FORECLOSURE_POLICY.WITHOUT_DISCOUNT,
    },

    // ── Foreclosure Fields ────────────────────────────────────────────────────────
    completionType: {
        type: String,
        enum: Object.values(LOAN_COMPLETION_TYPE),
    },
    foreclosureDate: {
        type: Date,
    },
    foreclosureDiscount: {
        type: Number,
        default: 0,
    },
    foreclosureSettlementAmount: {
        type: Number,
    },
    foreclosureRemarks: {
        type: String,
        trim: true,
    },
    foreclosedBy: {
        type: String,
        trim: true,
    },
    discountReason: {
        type: String,
        enum: Object.values(DISCOUNT_REASON),
    },

    // ── Settlement Fields (legacy — kept for backward compat) ─────────────────────
    settlementBalance: { type: Number },
    settlementAmount: { type: Number },
    settlementDiscount: { type: Number },
    settlementPaymentMethod: { type: String },
    settlementNotes: { type: String },
    settlementDate: { type: Date },
    settlementBankDetails: { type: mongoose.Schema.Types.Mixed },

    // ── Agreement Snapshot (immutable — written once, never overwritten) ──────────
    agreementSnapshot: {
        type: agreementSnapshotSchema,
        default: null,
    },
    agreementGeneratedAt: {
        type: Date,
    },

    // ── Agreement Acceptance Metadata (future digital signature support) ──────────
    agreementAcceptedAt: {
        type: Date,
    },
    acceptedBy: {
        type: String,
        trim: true,
    },
    acceptanceIPAddress: {
        type: String,
        trim: true,
    },
    acceptanceDevice: {
        type: String,
        trim: true,
    },
    acceptanceBrowser: {
        type: String,
        trim: true,
    },

}, {
    timestamps: true,
});

// Compound indexes for common queries
loanSchema.index({ customerId: 1, status: 1 });
loanSchema.index({ lenderId: 1, status: 1 });
loanSchema.index({ createdAt: -1 });

// Virtual for progress percentage
loanSchema.virtual('progressPercentage').get(function () {
    if (this.totalAmountPayable === 0) return 0;
    const paid = this.totalAmountPayable - this.remainingBalance;
    return Math.round((paid / this.totalAmountPayable) * 100);
});

loanSchema.set('toJSON', { virtuals: true });
loanSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Loan', loanSchema);
