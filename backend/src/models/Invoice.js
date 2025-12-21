const mongoose = require('mongoose');
const { INVOICE_TYPES, INVOICE_STATUS } = require('../config/constants');

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    loanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan',
        required: true,
        index: true,
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
    },
    invoiceType: {
        type: String,
        enum: Object.values(INVOICE_TYPES),
        default: INVOICE_TYPES.EMI_RECEIPT,
    },
    period: {
        month: { type: Number, min: 1, max: 12 },
        year: { type: Number },
    },
    invoiceDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    dueDate: {
        type: Date,
    },
    amountDue: {
        type: Number,
        required: true,
    },
    amountPaid: {
        type: Number,
        default: 0,
    },
    balanceDue: {
        type: Number,
        default: 0,
    },
    pdfData: {
        type: Buffer,
    },
    status: {
        type: String,
        enum: Object.values(INVOICE_STATUS),
        default: INVOICE_STATUS.PENDING,
    },
    emailSentAt: {
        type: Date,
    },
    downloadedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

// Compound index
invoiceSchema.index({ loanId: 1, 'period.year': 1, 'period.month': 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
