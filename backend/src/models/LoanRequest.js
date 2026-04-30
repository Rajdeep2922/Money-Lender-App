const mongoose = require('mongoose');
const crypto = require('crypto');

const loanRequestSchema = new mongoose.Schema(
    {
        // ── Authenticated customer (optional — for portal users) ──────────
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            default: null,
            index: true,
        },

        // ── Guest / public request fields ─────────────────────────────────
        guestName: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        guestPhone: {
            type: String,
            trim: true,
            index: true,          // used for "track by phone"
        },
        guestEmail: {
            type: String,
            trim: true,
            lowercase: true,
        },

        // ── Tracking token (given to guest for chat access) ───────────────
        trackingToken: {
            type: String,
            index: true,
            unique: true,
            sparse: true,         // allows null without unique conflict
        },

        // ── Common fields ─────────────────────────────────────────────────
        lenderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lender',
            required: [true, 'lenderId is required'],
            index: true,
        },
        amount: {
            type: Number,
            required: [true, 'Loan amount is required'],
            min: [1, 'Amount must be positive'],
        },
        purpose: {
            type: String,
            required: [true, 'Loan purpose is required'],
            trim: true,
            maxlength: [200, 'Purpose must be 200 characters or less'],
        },
        message: {
            type: String,
            trim: true,
            maxlength: [1000, 'Message must be 1000 characters or less'],
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending',
            index: true,
        },
    },
    { timestamps: true }
);

// Compound indexes
loanRequestSchema.index({ customerId: 1, status: 1 });
loanRequestSchema.index({ lenderId: 1, status: 1 });
loanRequestSchema.index({ guestPhone: 1, status: 1 });

// Auto-generate trackingToken before save if not set
loanRequestSchema.pre('save', function (next) {
    if (!this.trackingToken) {
        this.trackingToken = crypto.randomBytes(24).toString('hex');
    }
    next();
});

module.exports = mongoose.model('LoanRequest', loanRequestSchema);
