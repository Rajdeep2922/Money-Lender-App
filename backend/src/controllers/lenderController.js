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
            lender = new Lender(req.body);
        } else {
            // Handle nested objects properly
            const updateData = { ...req.body };

            // Debug: Log companyStamp
            console.log('Received companyStamp:', updateData.companyStamp ? `${updateData.companyStamp.substring(0, 50)}...` : 'undefined');

            // Merge address if provided
            if (updateData.address) {
                updateData.address = {
                    ...lender.address?.toObject?.() || lender.address || {},
                    ...updateData.address
                };
            }

            // Merge bankDetails if provided
            if (updateData.bankDetails) {
                updateData.bankDetails = {
                    ...lender.bankDetails?.toObject?.() || lender.bankDetails || {},
                    ...updateData.bankDetails
                };
            }

            // Update all fields including companyStamp
            Object.keys(updateData).forEach(key => {
                lender[key] = updateData[key];
            });

            // Debug: Log saved companyStamp
            console.log('Saved companyStamp:', lender.companyStamp ? `${lender.companyStamp.substring(0, 50)}...` : 'undefined');
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
