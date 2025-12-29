const mongoose = require('mongoose');
const { PAYMENT_METHODS } = require('../config/constants');

const paymentSchema = new mongoose.Schema({
    loanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan',
        required: [true, 'Loan reference is required'],
        index: true,
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, 'Customer reference is required'],
        index: true,
    },
    paymentNumber: {
        type: Number,
        required: true,
    },
    amountPaid: {
        type: Number,
        required: [true, 'Payment amount is required'],
        min: [1, 'Amount must be at least 1'],
    },
    principalPortion: {
        type: Number,
        required: true,
    },
    interestPortion: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: Object.values(PAYMENT_METHODS),
        default: PAYMENT_METHODS.BANK_TRANSFER,
    },
    paymentDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    referenceId: {
        type: String,
        trim: true,
    },
    balanceAfterPayment: {
        type: Number,
        required: true,
    },
    notes: {
        type: String,
        trim: true,
    },
    lenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lender',
        index: true,
    },
    // Bank details for bank transfers
    bankDetails: {
        accountHolderName: { type: String, trim: true },
        bankName: { type: String, trim: true },
        accountNumber: { type: String, trim: true },
        ifscCode: { type: String, trim: true },
        branch: { type: String, trim: true },
        upiId: { type: String, trim: true },
        transactionId: { type: String, trim: true },
    },
}, {

    timestamps: true,
});

// Compound indexes
paymentSchema.index({ loanId: 1, paymentDate: -1 });
paymentSchema.index({ customerId: 1, paymentDate: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
