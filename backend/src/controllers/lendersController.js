/**
 * Lenders Discovery Controller
 * Returns public-facing lender info for customer discovery
 */
const Lender = require('../models/Lender');

/**
 * @desc    Get all public lenders for discovery
 * @route   GET /api/lenders
 * @access  Private (Customer)
 */
const getPublicLenders = async (req, res, next) => {
    try {
        const lenders = await Lender.find({ isPublic: true })
            .select('businessName ownerName interestRate rating description address.city address.state logo')
            .sort({ rating: -1 });

        res.json({
            success: true,
            count: lenders.length,
            data: lenders,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single lender by ID
 * @route   GET /api/lenders/:id
 * @access  Private (Customer)
 */
const getLenderById = async (req, res, next) => {
    try {
        const lender = await Lender.findOne({ _id: req.params.id, isPublic: true })
            .select('businessName ownerName interestRate rating description address.city address.state logo');

        if (!lender) {
            return res.status(404).json({ success: false, message: 'Lender not found' });
        }

        res.json({ success: true, data: lender });
    } catch (error) {
        next(error);
    }
};

module.exports = { getPublicLenders, getLenderById };
