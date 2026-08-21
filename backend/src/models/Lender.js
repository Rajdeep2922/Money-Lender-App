const mongoose = require('mongoose');

const lenderSchema = new mongoose.Schema({
    businessName: {
        type: String,
        required: [true, 'Business name is required'],
        trim: true,
    },
    ownerName: {
        type: String,
        required: [true, 'Owner name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
    },
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: { type: String, default: 'India', trim: true },
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
    // Lender Discovery fields
    interestRate: {
        type: Number,
        default: 12, // percent per annum
        min: 0,
        max: 100,
    },
    rating: {
        type: Number,
        default: 4.0,
        min: 0,
        max: 5,
    },
    description: {
        type: String,
        trim: true,
        default: 'Trusted money lending services.',
    },
    isPublic: {
        type: Boolean,
        default: true,
        index: true,
    },
    logo: {
        type: String, // URL or Base64
    },
    companyStamp: {
        type: String, // URL or Base64 for digital stamp
    },
    activePolicies: {
        termsId: { type: mongoose.Schema.Types.ObjectId, ref: 'LegalPolicy' },
        loanAgreementId: { type: mongoose.Schema.Types.ObjectId, ref: 'LegalPolicy' },
        interestId: { type: mongoose.Schema.Types.ObjectId, ref: 'LegalPolicy' },
        emiPaymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'LegalPolicy' },
        foreclosureId: { type: mongoose.Schema.Types.ObjectId, ref: 'LegalPolicy' },
        defaultOverdueId: { type: mongoose.Schema.Types.ObjectId, ref: 'LegalPolicy' },
        privacyId: { type: mongoose.Schema.Types.ObjectId, ref: 'LegalPolicy' },
        contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'LegalPolicy' },
    },
    loanPolicy: {
        defaultInterestRate: { type: Number, default: 12 },
        defaultGracePeriodDays: { type: Number, enum: [0, 3, 5, 7, 15, 30], default: 0 },
        defaultLateFeeType: { type: String, enum: ['none', 'fixed', 'percentage'], default: 'none' },
        defaultLateFeeValue: { type: Number, default: 0 },
        defaultForeclosurePolicy: {
            type: String,
            enum: ['NOT_ALLOWED', 'WITHOUT_DISCOUNT', 'MANUAL_DISCOUNT'],
            default: 'WITHOUT_DISCOUNT'
        },
        defaultMaxTenureMonths: { type: Number, default: 360 },
        defaultPaymentMethods: {
            type: [String],
            default: ['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'IMPS', 'NEFT']
        },
        interestCalculationType: {
            type: String,
            enum: ['SIMPLE', 'FLAT', 'REDUCING_BALANCE'],
            default: 'SIMPLE'
        },
    },
    invoicePrefix: {
        type: String,
        default: 'INV',
        uppercase: true,
    },
    contractPrefix: {
        type: String,
        default: 'CONT',
        uppercase: true,
    },
    loanPrefix: {
        type: String,
        default: 'LN',
        uppercase: true,
    },
}, {
    timestamps: true,
});

// Get lender by ID, or get the most recently updated one
lenderSchema.statics.getLender = async function (lenderId = null) {
    let lender;

    if (lenderId) {
        // If lenderId provided, find that specific lender
        lender = await this.findById(lenderId);
    }

    if (!lender) {
        // Fallback: find the most recently updated lender
        lender = await this.findOne().sort({ updatedAt: -1 });
    }

    if (!lender) {
        // Create default if none exists
        lender = await this.create({
            businessName: 'Your Finance Company',
            ownerName: 'Owner Name',
            email: 'contact@yourfinance.com',
            phone: '+91-9999999999',
            address: {
                street: '123 Main Street',
                city: 'Mumbai',
                state: 'Maharashtra',
                country: 'India',
            },
        });
    }
    return lender;
};

module.exports = mongoose.model('Lender', lenderSchema);
