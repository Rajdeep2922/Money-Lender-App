/**
 * Loan Request Controller
 * Handles creation, listing, and response to loan requests
 */
const LoanRequest = require('../models/LoanRequest');
const Customer = require('../models/Customer');
const Lender = require('../models/Lender');
const { emitToUser } = require('../socket/socketManager');

/**
 * @desc    Create a new loan request
 * @route   POST /api/loan-request
 * @access  Private (Customer)
 * customerId is extracted from JWT — NEVER from request body
 */
const createLoanRequest = async (req, res, next) => {
    try {
        const { lenderId, amount, purpose, message } = req.body;
        const customerId = req.customer._id; // Always from JWT

        if (!lenderId || !amount || !purpose) {
            return res.status(400).json({
                success: false,
                message: 'lenderId, amount, and purpose are required',
            });
        }

        // Validate lender exists and is public
        const lender = await Lender.findOne({ _id: lenderId, isPublic: true });
        if (!lender) {
            return res.status(404).json({ success: false, message: 'Lender not found' });
        }

        // Prevent duplicate pending requests to the same lender
        const existing = await LoanRequest.findOne({
            customerId,
            lenderId,
            status: 'pending',
        });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'You already have a pending request with this lender',
            });
        }

        const loanRequest = await LoanRequest.create({
            customerId,
            lenderId,
            amount,
            purpose,
            message: message || '',
            status: 'pending',
        });

        // Real-time notification to lender
        // Find the User (lender account) linked to this Lender profile
        const User = require('../models/User');
        const lenderUser = await User.findOne({ lenderId: lender._id });
        if (lenderUser) {
            const io = req.app.get('io');
            emitToUser(io, lenderUser._id.toString(), 'new_loan_request', {
                loanRequestId: loanRequest._id,
                amount: loanRequest.amount,
                purpose: loanRequest.purpose,
                customerFirstName: req.customer.firstName,
                createdAt: loanRequest.createdAt,
            });
        }

        res.status(201).json({
            success: true,
            data: loanRequest,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get loan requests (role-based)
 * @route   GET /api/loan-request
 * @access  Private (Customer or Lender)
 */
const getLoanRequests = async (req, res, next) => {
    try {
        let query = {};

        if (req.customer) {
            // Customer sees their own requests
            query = { customerId: req.customer._id };
        } else if (req.user) {
            // Lender sees requests for their lender profile
            if (!req.user.lenderId) {
                return res.status(400).json({
                    success: false,
                    message: 'Lender profile not set up',
                });
            }
            query = { lenderId: req.user.lenderId._id || req.user.lenderId };
        }

        const { status } = req.query;
        if (status && ['pending', 'accepted', 'rejected'].includes(status)) {
            query.status = status;
        }

        const loanRequests = await LoanRequest.find(query)
            .populate('customerId', 'firstName lastName email phone')
            .populate('lenderId', 'businessName ownerName interestRate rating')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: loanRequests.length,
            data: loanRequests,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single loan request
 * @route   GET /api/loan-request/:id
 * @access  Private (Customer OR Lender — must be participant)
 */
const getLoanRequestById = async (req, res, next) => {
    try {
        const loanRequest = await LoanRequest.findById(req.params.id)
            .populate('customerId', 'firstName lastName email phone')
            .populate('lenderId', 'businessName ownerName interestRate rating address');

        if (!loanRequest) {
            return res.status(404).json({ success: false, message: 'Loan request not found' });
        }

        // Strict authorization: only participant can view
        const userId = req.customer?._id?.toString() || req.user?._id?.toString();
        const isCustomer = loanRequest.customerId && loanRequest.customerId._id.toString() === userId;
        const lenderProfileId = req.user?.lenderId?._id?.toString() || req.user?.lenderId?.toString();
        const isLender = lenderProfileId && loanRequest.lenderId._id.toString() === lenderProfileId;

        // Note: For guest requests tracking, we use a separate track endpoint.
        // This endpoint is only for authenticated portal users (Lender or Customer)
        if (!isCustomer && !isLender) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Lenders see limited info before acceptance
        let responseData = loanRequest.toObject();
        if (req.user && loanRequest.status === 'pending') {
            // Before acceptance: hide sensitive fields
            if (responseData.customerId) {
                responseData.customerId = {
                    _id: loanRequest.customerId._id,
                    firstName: loanRequest.customerId.firstName,
                };
            }
            // For guests, we only have guestName, guestPhone, guestEmail
            // We should hide phone and email until accepted
            delete responseData.guestPhone;
            delete responseData.guestEmail;
        }

        res.json({ success: true, data: responseData });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Respond to a loan request (accept or reject)
 * @route   POST /api/loan-request/:id/respond
 * @access  Private (Lender only)
 */
const respondToLoanRequest = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'status must be "accepted" or "rejected"',
            });
        }

        const loanRequest = await LoanRequest.findById(req.params.id);
        if (!loanRequest) {
            return res.status(404).json({ success: false, message: 'Loan request not found' });
        }

        // Verify lender owns this request
        const lenderProfileId = req.user?.lenderId?._id?.toString() || req.user?.lenderId?.toString();
        if (!lenderProfileId || loanRequest.lenderId.toString() !== lenderProfileId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        if (loanRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Loan request is already ${loanRequest.status}`,
            });
        }

        loanRequest.status = status;
        await loanRequest.save();

        // Real-time notification to customer (only if portal customer, not guest)
        if (loanRequest.customerId) {
            const io = req.app.get('io');
            const eventName = status === 'accepted' ? 'loan_request_accepted' : 'loan_request_rejected';
            emitToUser(io, loanRequest.customerId.toString(), eventName, {
                loanRequestId: loanRequest._id,
                status,
                lenderBusinessName: req.user.lenderId?.businessName || 'The lender',
                amount: loanRequest.amount,
                purpose: loanRequest.purpose,
            });
        }

        res.json({
            success: true,
            message: `Loan request ${status}`,
            data: loanRequest,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createLoanRequest,
    getLoanRequests,
    getLoanRequestById,
    respondToLoanRequest,
};
