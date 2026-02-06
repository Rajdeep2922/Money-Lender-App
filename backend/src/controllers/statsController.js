const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const Customer = require('../models/Customer');

/**
 * Get aggregated dashboard statistics
 */
exports.getDashboardStats = async (req, res, next) => {
    try {
        const now = new Date();

        // SECURITY: Filter by lender to isolate user data
        // req.user.lenderId might be a populated object or just an ObjectId
        const lenderId = req.user?.lenderId?._id || req.user?.lenderId;
        const lenderFilter = lenderId
            ? { $or: [{ lenderId: lenderId }, { lenderId: { $exists: false } }, { lenderId: null }] }
            : {};

        const [
            totalCustomers,
            loanStats,
            paymentStats,
            activeLoans,
            overdueLoansCount
        ] = await Promise.all([
            // Exclude soft-deleted customers from count
            Customer.countDocuments({ isDeleted: { $ne: true }, ...lenderFilter }),
            Loan.aggregate([
                { $match: lenderFilter },
                {
                    $group: {
                        _id: null,
                        totalPrincipal: { $sum: '$principal' },
                        totalRemaining: { $sum: '$remainingBalance' },
                        totalPayable: { $sum: '$totalAmountPayable' }
                    }
                }
            ]),
            Payment.aggregate([
                { $match: lenderFilter },
                { $group: { _id: null, totalCollected: { $sum: '$amountPaid' } } }
            ]),
            Loan.countDocuments({ status: 'active', ...lenderFilter }),
            Loan.countDocuments({
                status: 'active',
                nextDueDate: { $lt: now },
                ...lenderFilter
            })
        ]);

        const stats = loanStats[0] || { totalPrincipal: 0, totalRemaining: 0, totalPayable: 0 };
        const collected = paymentStats[0]?.totalCollected || 0;

        // Unearned Interest = Total Contracted Interest - (Total Amount Collected - Total Principal Lent) ?
        // Simpler: Total Remaining Payable - Total Remaining Principal
        const projectedInterest = stats.totalPayable - stats.totalPrincipal;

        // Monthly data for chart (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Build date filter for last 6 months
        const dateFilter = { createdAt: { $gte: sixMonthsAgo } };

        // Combine filters properly - can't spread two $or at same level
        const monthlyLoanFilter = req.user && req.user.lenderId
            ? { $and: [dateFilter, lenderFilter] }
            : dateFilter;

        const monthlyPaymentFilter = req.user && req.user.lenderId
            ? { $and: [{ paymentDate: { $gte: sixMonthsAgo } }, lenderFilter] }
            : { paymentDate: { $gte: sixMonthsAgo } };

        const [monthlyLoans, monthlyPayments] = await Promise.all([
            Loan.aggregate([
                { $match: monthlyLoanFilter },
                {
                    $group: {
                        _id: {
                            month: { $month: '$createdAt' },
                            year: { $year: '$createdAt' }
                        },
                        total: { $sum: '$principal' }
                    }
                }
            ]),
            Payment.aggregate([
                { $match: monthlyPaymentFilter },
                {
                    $group: {
                        _id: {
                            month: { $month: '$paymentDate' },
                            year: { $year: '$paymentDate' }
                        },
                        total: { $sum: '$amountPaid' }
                    }
                }
            ])
        ]);

        res.json({
            success: true,
            stats: {
                totalCustomers,
                activeLoans,
                overdueLoans: overdueLoansCount,
                healthyLoans: activeLoans - overdueLoansCount,
                totalLent: stats.totalPrincipal,
                totalRemaining: stats.totalRemaining,
                totalReceived: collected,
                projectedInterest: projectedInterest,
                monthlyData: {
                    loans: monthlyLoans,
                    payments: monthlyPayments
                }
            }
        });
    } catch (error) {
        next(error);
    }
};
