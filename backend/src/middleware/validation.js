const Joi = require('joi');
const { AppError } = require('./errorHandler');

/**
 * Request validation middleware factory
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const message = error.details.map(d => d.message).join('. ');
            return next(new AppError(message, 400));
        }

        req.body = value;
        next();
    };
};

// Customer validation schema
const customerSchema = Joi.object({
    firstName: Joi.string().trim().min(1).max(50).required(),
    lastName: Joi.string().trim().min(1).max(50).required(),
    email: Joi.string().email().lowercase().required(),
    phone: Joi.string().trim().min(10).max(15).required(),
    address: Joi.object({
        street: Joi.string().trim().allow(''),
        city: Joi.string().trim().allow(''),
        state: Joi.string().trim().allow(''),
        country: Joi.string().trim().default('India'),
    }),
    governmentId: Joi.object({
        type: Joi.string().valid('aadhar', 'pan', 'passport', 'driving_license', 'other'),
        number: Joi.string().trim(),
        expiryDate: Joi.date(),
    }),
    aadhaarNumber: Joi.string().trim().length(12).allow(''),
    panNumber: Joi.string().trim().uppercase().allow(''),
    bankDetails: Joi.object({
        accountName: Joi.string().trim().allow(''),
        accountNumber: Joi.string().trim().allow(''),
        ifscCode: Joi.string().trim().uppercase().allow(''),
        bankName: Joi.string().trim().allow(''),
    }),
    notes: Joi.string().trim().allow(''),
    signature: Joi.string().allow(''),
});

// Loan validation schema
const loanSchema = Joi.object({
    customerId: Joi.string().required(),
    principal: Joi.number().min(1).required(),
    monthlyInterestRate: Joi.number().min(0).max(100).required(),
    loanDurationMonths: Joi.number().integer().min(1).max(360).required(),
    startDate: Joi.date().default(new Date()),
    interestType: Joi.string().valid('simple', 'compound').default('simple'),
    manualEMI: Joi.number().min(0).optional(),
    notes: Joi.string().trim().allow(''),
});

// Payment validation schema
const paymentSchema = Joi.object({
    loanId: Joi.string().required(),
    amountPaid: Joi.number().min(1).required(),
    paymentMethod: Joi.string().valid('cash', 'bank_transfer', 'upi', 'cheque', 'other').default('bank_transfer'),
    paymentDate: Joi.date().default(new Date()),
    referenceId: Joi.string().trim().allow(''),
    notes: Joi.string().trim().allow(''),
    bankDetails: Joi.object({
        accountHolderName: Joi.string().trim().allow(''),
        bankName: Joi.string().trim().allow(''),
        accountNumber: Joi.string().trim().allow(''),
        ifscCode: Joi.string().trim().allow(''),
        branch: Joi.string().trim().allow(''),
        upiId: Joi.string().trim().allow(''),
        transactionId: Joi.string().trim().allow(''),
    }).optional(),
});


// Lender validation schema
const lenderSchema = Joi.object({
    businessName: Joi.string().trim().required(),
    ownerName: Joi.string().trim().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().trim().required(),
    address: Joi.object({
        street: Joi.string().trim().allow(''),
        city: Joi.string().trim().allow(''),
        state: Joi.string().trim().allow(''),
        country: Joi.string().trim().default('India'),
    }),
    panNumber: Joi.string().trim().allow(''),
    bankDetails: Joi.object({
        accountName: Joi.string().trim().allow(''),
        accountNumber: Joi.string().trim().allow(''),
        ifscCode: Joi.string().trim().allow(''),
        bankName: Joi.string().trim().allow(''),
    }),
    logo: Joi.string().allow('', null),
    companyStamp: Joi.string().allow('', null),
    termsAndConditions: Joi.string().allow(''),
    invoicePrefix: Joi.string().uppercase().default('INV'),
    contractPrefix: Joi.string().uppercase().default('CONT'),
    loanPrefix: Joi.string().uppercase().default('LN'),
});


module.exports = {
    validate,
    validateCustomer: validate(customerSchema),
    validateLoan: validate(loanSchema),
    validatePayment: validate(paymentSchema),
    validateLender: validate(lenderSchema),
};
