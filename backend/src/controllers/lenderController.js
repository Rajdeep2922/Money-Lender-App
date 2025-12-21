const Lender = require('../models/Lender');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get lender details
 */
exports.getLender = async (req, res, next) => {
    try {
        const lender = await Lender.getLender();
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
        let lender = await Lender.findOne();

        if (!lender) {
            lender = new Lender(req.body);
        } else {
            Object.assign(lender, req.body);
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
