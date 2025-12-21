const mongoose = require('mongoose');
const { LOAN_STATUS } = require('../config/constants');

const amortizationSchema = new mongoose.Schema({
    month: { type: Number, required: true },
    emi: { type: Number, required: true },
    principal: { type: Number, required: true },
    interest: { type: Number, required: true },
    balance: { type: Number, required: true },
    dueDate: { type: Date, required: true },
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
}, {
    timestamps: true,
});

// Compound indexes for common queries
loanSchema.index({ customerId: 1, status: 1 });
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
