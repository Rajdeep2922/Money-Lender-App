const mongoose = require('mongoose');
const { CUSTOMER_STATUS } = require('../config/constants');

const customerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        index: true,
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        index: true,
    },
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: { type: String, default: 'India', trim: true },
    },
    governmentId: {
        type: { type: String, enum: ['aadhar', 'pan', 'passport', 'driving_license', 'other'] },
        number: { type: String, trim: true },
        expiryDate: Date,
    },
    aadhaarNumber: {
        type: String,
        trim: true,
    },
    panNumber: {
        type: String,
        trim: true,
        uppercase: true,
    },
    bankDetails: {
        accountName: { type: String, trim: true },
        accountNumber: { type: String, trim: true },
        ifscCode: { type: String, trim: true, uppercase: true },
        bankName: { type: String, trim: true },
    },
    status: {
        type: String,
        enum: Object.values(CUSTOMER_STATUS),
        default: CUSTOMER_STATUS.ACTIVE,
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true,
    },
    notes: {
        type: String,
        trim: true,
    },
    signature: {
        type: String, // Store as Base64 string
    },
    photo: {
        type: String, // Store passport photo as Base64 string
    },
}, {
    timestamps: true,
});

// Virtual for full name
customerSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Include virtuals in JSON output
customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });

// Compound index for searching
customerSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
