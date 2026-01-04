const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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
    // Portal authentication fields
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters'],
        select: false, // Don't return password by default
    },
    isPortalActive: {
        type: Boolean,
        default: false,
        index: true,
    },
    lastPortalLogin: {
        type: Date,
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
    lenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lender',
        index: true,
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

// Hash password before saving (only if modified)
customerSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords for portal login
customerSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
customerSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Include virtuals in JSON output
customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });

// Method to get customer without password
customerSchema.methods.toJSON = function () {
    const customer = this.toObject();
    delete customer.password;
    return customer;
};

// Compound index for searching
customerSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

module.exports = mongoose.model('Customer', customerSchema);

