const Lender = require('../models/Lender');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get lender details
 */
exports.getLender = async (req, res, next) => {
    try {
        // SECURITY: Get the lender for the authenticated user
        const lenderId = req.user?.lenderId;

        if (!lenderId) {
            return next(new AppError('User does not have an associated lender', 404));
        }

        const lender = await Lender.findById(lenderId);

        if (!lender) {
            return next(new AppError('Lender not found', 404));
        }

        res.json({
            success: true,
            lender,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update lender details
 */
exports.updateLender = async (req, res, next) => {
    try {
        // Debug: Log all request body keys
        console.log('Request body keys:', Object.keys(req.body));
        console.log('Request body has companyStamp key:', 'companyStamp' in req.body);

        // SECURITY: Get the lender for the authenticated user
        const lenderId = req.user?.lenderId;

        if (!lenderId) {
            return next(new AppError('User does not have an associated lender', 404));
        }

        let lender = await Lender.findById(lenderId);
        if (!lender) {
            return next(new AppError('Lender not found', 404));
        }

        // Explicit whitelist — never allow _id, email, or activePolicies via unvalidated spread
        const ALLOWED_LENDER_FIELDS = [
            'businessName', 'ownerName', 'phone', 'panNumber',
            'interestRate', 'rating', 'description', 'isPublic',
            'logo', 'companyStamp', 'invoicePrefix', 'contractPrefix',
            'loanPrefix', 'loanPolicy',
        ];
        for (const field of ALLOWED_LENDER_FIELDS) {
            if (req.body[field] !== undefined) {
                lender[field] = req.body[field];
            }
        }

        // Merge address if provided
        if (req.body.address && typeof req.body.address === 'object') {
            lender.address = {
                ...lender.address?.toObject?.() || lender.address || {},
                street: req.body.address.street ?? lender.address?.street,
                city: req.body.address.city ?? lender.address?.city,
                state: req.body.address.state ?? lender.address?.state,
                country: req.body.address.country ?? lender.address?.country,
            };
        }

        // Merge bankDetails if provided
        if (req.body.bankDetails && typeof req.body.bankDetails === 'object') {
            lender.bankDetails = {
                ...lender.bankDetails?.toObject?.() || lender.bankDetails || {},
                accountName: req.body.bankDetails.accountName ?? lender.bankDetails?.accountName,
                accountNumber: req.body.bankDetails.accountNumber ?? lender.bankDetails?.accountNumber,
                ifscCode: req.body.bankDetails.ifscCode ?? lender.bankDetails?.ifscCode,
                bankName: req.body.bankDetails.bankName ?? lender.bankDetails?.bankName,
            };
        }

        await lender.save();

        res.json({
            success: true,
            message: 'Lender details updated successfully',
            lender,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get lender's configurable loan policy defaults
 */
exports.getLoanPolicy = async (req, res, next) => {
    try {
        const lenderId = req.user?.lenderId;
        if (!lenderId) return next(new AppError('Lender not found', 404));

        const lender = await Lender.findById(lenderId).select('loanPolicy');
        if (!lender) return next(new AppError('Lender not found', 404));

        res.json({
            success: true,
            loanPolicy: lender.loanPolicy || {},
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update lender's configurable loan policy defaults
 */
exports.updateLoanPolicy = async (req, res, next) => {
    try {
        const lenderId = req.user?.lenderId;
        if (!lenderId) return next(new AppError('Lender not found', 404));

        const allowedFields = [
            'defaultInterestRate',
            'defaultGracePeriodDays',
            'defaultLateFeeType',
            'defaultLateFeeValue',
            'defaultForeclosurePolicy',
            'defaultMaxTenureMonths',
            'defaultPaymentMethods',
            'interestCalculationType',
        ];

        const update = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                update[`loanPolicy.${field}`] = req.body[field];
            }
        });

        const lender = await Lender.findByIdAndUpdate(
            lenderId,
            { $set: update },
            { new: true, runValidators: true }
        );

        if (!lender) return next(new AppError('Lender not found', 404));

        res.json({
            success: true,
            message: 'Loan policy updated successfully',
            loanPolicy: lender.loanPolicy,
        });
    } catch (error) {
        next(error);
    }
};

