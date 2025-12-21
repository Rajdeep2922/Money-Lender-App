const mongoose = require('mongoose');
const { CONTRACT_TYPES, CONTRACT_STATUS } = require('../config/constants');

const contractSchema = new mongoose.Schema({
    contractNumber: {
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
    contractType: {
        type: String,
        enum: Object.values(CONTRACT_TYPES),
        default: CONTRACT_TYPES.LOAN_AGREEMENT,
    },
    contractData: {
        lenderName: String,
        lenderAddress: String,
        customerName: String,
        customerAddress: String,
        loanAmount: Number,
        monthlyRate: Number,
        tenure: Number,
        emi: Number,
        startDate: Date,
        termsAndConditions: String,
    },
    pdfData: {
        type: Buffer,
    },
    signatureRequired: {
        type: Boolean,
        default: true,
    },
    signatureDate: {
        type: Date,
    },
    signatureImage: {
        type: String, // Base64 or URL
    },
    status: {
        type: String,
        enum: Object.values(CONTRACT_STATUS),
        default: CONTRACT_STATUS.DRAFT,
    },
    expiryDate: {
        type: Date,
    },
    version: {
        type: Number,
        default: 1,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Contract', contractSchema);
