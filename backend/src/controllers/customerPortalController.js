/**
 * Customer Portal Controller
 * Handles customer portal data access - all read-only
 */

const Loan = require('../models/Loan');
const Payment = require('../models/Payment');

/**
 * @desc    Get customer's loans
 * @route   GET /api/portal/loans
 * @access  Private (Customer)
 */
const getMyLoans = async (req, res, next) => {
    try {
        const loans = await Loan.find({
            customerId: req.customer._id,
            status: { $ne: 'cancelled' }
        })
            .sort({ createdAt: -1 })
            .select('-amortizationSchedule'); // Don't include full schedule in list view

        res.json({
            success: true,
            count: loans.length,
            data: loans,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single loan details with schedule
 * @route   GET /api/portal/loans/:id
 * @access  Private (Customer)
 */
const getLoanDetails = async (req, res, next) => {
    try {
        const loan = await Loan.findOne({
            _id: req.params.id,
            customerId: req.customer._id,
        });

        if (!loan) {
            return res.status(404).json({
                success: false,
                message: 'Loan not found',
            });
        }

        // Get payments for this loan
        const payments = await Payment.find({ loanId: loan._id })
            .sort({ paymentDate: -1 });

        res.json({
            success: true,
            data: {
                loan,
                payments,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get customer's payment history
 * @route   GET /api/portal/payments
 * @access  Private (Customer)
 */
const getMyPayments = async (req, res, next) => {
    try {
        const payments = await Payment.find({
            customerId: req.customer._id,
        })
            .populate('loanId', 'loanNumber principal')
            .sort({ paymentDate: -1 });

        res.json({
            success: true,
            count: payments.length,
            data: payments,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get loan amortization schedule
 * @route   GET /api/portal/loans/:id/schedule
 * @access  Private (Customer)
 */
const getLoanSchedule = async (req, res, next) => {
    try {
        const loan = await Loan.findOne({
            _id: req.params.id,
            customerId: req.customer._id,
        }).select('loanNumber amortizationSchedule monthlyEMI principal');

        if (!loan) {
            return res.status(404).json({
                success: false,
                message: 'Loan not found',
            });
        }

        res.json({
            success: true,
            data: {
                loanNumber: loan.loanNumber,
                monthlyEMI: loan.monthlyEMI,
                principal: loan.principal,
                schedule: loan.amortizationSchedule,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyLoans,
    getLoanDetails,
    getMyPayments,
    getLoanSchedule,
};
