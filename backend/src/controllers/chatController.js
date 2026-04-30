/**
 * Chat Controller
 * Handles message history retrieval
 * Real-time messaging is handled by Socket.IO (socketManager.js)
 */
const Message = require('../models/Message');
const LoanRequest = require('../models/LoanRequest');

/**
 * Shared authorization helper
 * Verifies the user is a participant in the loan request AND it is accepted
 */
const verifyAcceptedAccess = async (loanRequestId, userId, userRole) => {
    const loanRequest = await LoanRequest.findById(loanRequestId);
    if (!loanRequest) throw Object.assign(new Error('Loan request not found'), { statusCode: 404 });

    const isCustomer = loanRequest.customerId.toString() === userId;
    const isLender = loanRequest.lenderId.toString() === userId;

    if (!isCustomer && !isLender) {
        throw Object.assign(new Error('Access denied: not a participant'), { statusCode: 403 });
    }

    if (loanRequest.status !== 'accepted') {
        throw Object.assign(
            new Error('Chat is only available for accepted loan requests'),
            { statusCode: 403 }
        );
    }

    return loanRequest;
};

/**
 * @desc    Get paginated message history for a loan request
 * @route   GET /api/chat/:loanRequestId/messages
 * @access  Private (Customer or Lender — participant + accepted)
 */
const getMessages = async (req, res, next) => {
    try {
        const { loanRequestId } = req.params;

        // Determine caller identity (customer or lender)
        let userId, userRole;
        if (req.customer) {
            userId = req.customer._id.toString();
            userRole = 'customer';
        } else if (req.user) {
            // For lender, compare against lender profile ID
            userId = (req.user.lenderId?._id || req.user.lenderId)?.toString();
            userRole = 'lender';
        }

        await verifyAcceptedAccess(loanRequestId, userId, userRole);

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
