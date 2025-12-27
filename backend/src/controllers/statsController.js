const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const Customer = require('../models/Customer');

/**
 * Get aggregated dashboard statistics
 */
exports.getDashboardStats = async (req, res, next) => {
    try {
        const now = new Date();

        const [
            totalCustomers,
            loanStats,
            paymentStats,
            activeLoans,
            overdueLoansCount
        ] = await Promise.all([
            // Exclude soft-deleted customers from count
            Customer.countDocuments({ isDeleted: { $ne: true } }),
            Loan.aggregate([
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
                { $group: { _id: null, totalCollected: { $sum: '$amountPaid' } } }
            ]),
            Loan.countDocuments({ status: 'active' }),
            Loan.countDocuments({
                status: 'active',
                nextDueDate: { $lt: now }
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

        const [monthlyLoans, monthlyPayments] = await Promise.all([
            Loan.aggregate([
                { $match: { createdAt: { $gte: sixMonthsAgo } } },
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
                { $match: { paymentDate: { $gte: sixMonthsAgo } } },
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
