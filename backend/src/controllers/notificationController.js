/**
 * Notification Controller
 *
 * Computes live unread counts directly from MongoDB for badges and notifications.
 */
const LoanRequest = require('../models/LoanRequest');
const Message = require('../models/Message');

/**
 * @desc    Get unread notification summary (unread loan requests and unread chats)
 * @route   GET /api/notifications/unread-summary
 * @access  Private (Dual-auth: Lender JWT, Customer JWT, or Guest Tracking Token)
 */
const getUnreadSummary = async (req, res, next) => {
    try {
        let unreadRequests = 0;
        let unreadChats = {};

        if (req.user) {
            // ── Lender persona ──────────────────────────────────────────
            const lenderProfileId = req.user.lenderId?._id || req.user.lenderId;
            if (lenderProfileId) {
                const [pendingCount, acceptedRequests] = await Promise.all([
                    LoanRequest.countDocuments({
                        lenderId: lenderProfileId,
                        status: 'pending',
                        viewedByLender: false,
                    }),
                    LoanRequest.find({
                        lenderId: lenderProfileId,
                        status: 'accepted',
                    }).select('_id'),
                ]);

                unreadRequests = pendingCount;

                if (acceptedRequests.length > 0) {
                    const requestIds = acceptedRequests.map((r) => r._id);
                    const chatAgg = await Message.aggregate([
                        {
                            $match: {
                                loanRequestId: { $in: requestIds },
                                senderType: 'customer',
                                read: false,
                            },
                        },
                        {
                            $group: {
                                _id: '$loanRequestId',
                                count: { $sum: 1 },
                            },
                        },
                    ]);

                    chatAgg.forEach((item) => {
                        unreadChats[item._id.toString()] = item.count;
                    });
                }
            }
        } else if (req.customer) {
            // ── Portal Customer persona ─────────────────────────────────
            const acceptedRequests = await LoanRequest.find({
                customerId: req.customer._id,
                status: 'accepted',
            }).select('_id');

            if (acceptedRequests.length > 0) {
                const requestIds = acceptedRequests.map((r) => r._id);
                const chatAgg = await Message.aggregate([
                    {
                        $match: {
                            loanRequestId: { $in: requestIds },
                            senderType: 'lender',
                            read: false,
                        },
                    },
                    {
                        $group: {
                            _id: '$loanRequestId',
                            count: { $sum: 1 },
                        },
                    },
                ]);

                chatAgg.forEach((item) => {
                    unreadChats[item._id.toString()] = item.count;
                });
            }
        } else if (req.guestTrackingToken) {
            // ── Guest Customer persona ──────────────────────────────────
            const guestRequest = await LoanRequest.findOne({
                trackingToken: req.guestTrackingToken,
                status: 'accepted',
            }).select('_id');

            if (guestRequest) {
                const count = await Message.countDocuments({
                    loanRequestId: guestRequest._id,
                    senderType: 'lender',
                    read: false,
                });
                if (count > 0) {
                    unreadChats[guestRequest._id.toString()] = count;
                }
            }
        }

        const totalUnreadChats = Object.values(unreadChats).reduce((sum, n) => sum + n, 0);

        res.json({
            success: true,
            data: {
                unreadRequests,
                unreadChats,
                totalUnreadChats,
                serverTime: new Date(),
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUnreadSummary,
};
