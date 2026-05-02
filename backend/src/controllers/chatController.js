/**
 * Chat Controller
 * Handles message history retrieval
 * Real-time messaging is handled by Socket.IO (socketManager.js)
 */
const Message = require('../models/Message');
const LoanRequest = require('../models/LoanRequest');

/**
 * Shared authorization helper — works for JWT users AND trackingToken guests.
 * For JWT users: userId is their customerId or lenderProfileId
 * For guests: pass trackingToken directly
 */
const verifyAcceptedAccess = async (loanRequestId, { userId, userRole, trackingToken } = {}) => {
    const loanRequest = await LoanRequest.findById(loanRequestId);
    if (!loanRequest) throw Object.assign(new Error('Loan request not found'), { statusCode: 404 });

    if (loanRequest.status !== 'accepted') {
        throw Object.assign(
            new Error('Chat is only available for accepted loan requests'),
            { statusCode: 403 }
        );
    }

    // Guest auth: verify trackingToken
    if (trackingToken) {
        if (loanRequest.trackingToken !== trackingToken) {
            throw Object.assign(new Error('Access denied: invalid tracking token'), { statusCode: 403 });
        }
        return loanRequest;
    }

    // JWT user auth: verify participant
    const isLender = userRole === 'lender' && loanRequest.lenderId.toString() === userId;
    // For portal customers: compare customerId; for guest requests customerId is null (lender-only access)
    const isCustomer = userRole === 'customer' &&
        loanRequest.customerId &&
        loanRequest.customerId.toString() === userId;

    if (!isCustomer && !isLender) {
        throw Object.assign(new Error('Access denied: not a participant'), { statusCode: 403 });
    }

    return loanRequest;
};

/**
 * @desc    Get paginated message history for a loan request
 * @route   GET /api/chat/:loanRequestId/messages
 * @access  JWT (Lender/Portal Customer) OR trackingToken header (Guest)
 */
const getMessages = async (req, res, next) => {
    try {
        const { loanRequestId } = req.params;

        let authContext = {};

        if (req.customer) {
            authContext = { userId: req.customer._id.toString(), userRole: 'customer' };
        } else if (req.user) {
            authContext = {
                userId: (req.user.lenderId?._id || req.user.lenderId)?.toString(),
                userRole: 'lender',
            };
        } else if (req.guestTrackingToken) {
            // Guest access via X-Tracking-Token header (set by protectBoth middleware)
            authContext = { trackingToken: req.guestTrackingToken };
        }

        await verifyAcceptedAccess(loanRequestId, authContext);

        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 50);
        const skip = (page - 1) * limit;

        const [messages, total] = await Promise.all([
            Message.find({ loanRequestId })
                .sort({ createdAt: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Message.countDocuments({ loanRequestId }),
        ]);

        res.json({
            success: true,
            count: messages.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: messages,
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

module.exports = { getMessages };
