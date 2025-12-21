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
    logo: {
        type: String, // URL or Base64
    },
    companyStamp: {
        type: String, // URL or Base64 for digital stamp
    },
    termsAndConditions: {
        type: String, // Default T&C for contracts
        default: `1. The borrower agrees to repay the loan amount along with interest as per the agreed schedule.
2. Late payment will attract additional charges as specified in the agreement.
3. Prepayment is allowed without any penalty.
4. The lender reserves the right to recall the loan in case of default.
5. All disputes shall be subject to local jurisdiction.`,
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

// Ensure only one lender record exists
lenderSchema.statics.getLender = async function () {
    let lender = await this.findOne();
    if (!lender) {
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
