const NodeCache = require('node-cache');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const { LOAN_STATUS } = require('../config/constants');
const { computeCollectionRate, computeRecoveryRate } = require('../utils/loanCalculations');
const { lenderIdOf } = require('../utils/tenant');

const statsCache = new NodeCache({ stdTTL: 45, checkperiod: 60 });

/**
 * Get aggregated dashboard statistics (<= 5 queries, no amortization schedules loaded)
 */
exports.getDashboardStats = async (req, res, next) => {
    try {
        const lenderId = lenderIdOf(req);
        const cacheKey = `dashboard:${lenderId}`;
        const cached = statsCache.get(cacheKey);
        if (cached && req.query.refresh !== 'true') {
            return res.json({ success: true, stats: cached, cached: true });
        }

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrowStart = new Date(todayStart);
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);
        const sevenDaysLater = new Date(todayStart);
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const lenderFilter = { lenderId, isDeleted: { $ne: true } };

        const [
            totalCustomers,
            loanAgg,
            paymentAgg,
            monthlyLoans,
            monthlyPayments,
        ] = await Promise.all([
            Customer.countDocuments({ isDeleted: { $ne: true }, lenderId }),
            Loan.aggregate([
                { $match: lenderFilter },
                {
                    $group: {
                        _id: null,
                        totalPrincipal: { $sum: '$principal' },
                        totalRemaining: { $sum: '$remainingBalance' },
                        totalPayable: { $sum: '$totalAmountPayable' },
                        activeLoans: {
                            $sum: { $cond: [{ $eq: ['$status', LOAN_STATUS.ACTIVE] }, 1, 0] },
                        },
                        completedLoans: {
                            $sum: { $cond: [{ $eq: ['$status', LOAN_STATUS.COMPLETED] }, 1, 0] },
                        },
                        foreclosedLoans: {
                            $sum: { $cond: [{ $eq: ['$status', LOAN_STATUS.FORECLOSED] }, 1, 0] },
                        },
                        defaultedLoans: {
                            $sum: { $cond: [{ $eq: ['$status', LOAN_STATUS.DEFAULTED] }, 1, 0] },
                        },
                        defaultedPrincipal: {
                            $sum: { $cond: [{ $eq: ['$status', LOAN_STATUS.DEFAULTED] }, '$principal', 0] },
                        },
                        overdueLoans: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $eq: ['$status', LOAN_STATUS.ACTIVE] },
                                            { $ne: ['$nextDueDate', null] },
                                            { $lt: ['$nextDueDate', todayStart] },
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },
                        todaysDueEMIs: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $eq: ['$status', LOAN_STATUS.ACTIVE] },
                                            { $gte: ['$nextDueDate', todayStart] },
                                            { $lt: ['$nextDueDate', tomorrowStart] },
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },
                        upcomingEMIs: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $eq: ['$status', LOAN_STATUS.ACTIVE] },
                                            { $gte: ['$nextDueDate', tomorrowStart] },
                                            { $lte: ['$nextDueDate', sevenDaysLater] },
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },
                    },
                },
            ]),
            Payment.aggregate([
                { $match: { lenderId } },
                { $group: { _id: null, totalCollected: { $sum: '$amountPaid' } } },
            ]),
            Loan.aggregate([
                { $match: { ...lenderFilter, createdAt: { $gte: sixMonthsAgo } } },
                {
                    $group: {
                        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                        total: { $sum: '$principal' },
                    },
                },
            ]),
            Payment.aggregate([
                { $match: { lenderId, paymentDate: { $gte: sixMonthsAgo } } },
                {
                    $group: {
                        _id: { month: { $month: '$paymentDate' }, year: { $year: '$paymentDate' } },
                        total: { $sum: '$amountPaid' },
                    },
                },
            ]),
        ]);

        const ls = loanAgg[0] || {
            totalPrincipal: 0,
            totalRemaining: 0,
            totalPayable: 0,
            activeLoans: 0,
            completedLoans: 0,
            foreclosedLoans: 0,
            defaultedLoans: 0,
            defaultedPrincipal: 0,
            overdueLoans: 0,
            todaysDueEMIs: 0,
            upcomingEMIs: 0,
        };
        const collected = paymentAgg[0]?.totalCollected || 0;
        const projectedInterest = ls.totalPayable - ls.totalPrincipal;
        const collectionRate = computeCollectionRate(collected, ls.totalPayable);
        const recoveryRate = computeRecoveryRate(0, ls.defaultedPrincipal);

        const statsPayload = {
            totalCustomers,
            totalLent: ls.totalPrincipal,
            totalRemaining: ls.totalRemaining,
            totalReceived: collected,
            projectedInterest,
            activeLoans: ls.activeLoans,
            completedLoans: ls.completedLoans,
            foreclosedLoans: ls.foreclosedLoans,
            defaultedLoans: ls.defaultedLoans,
            overdueLoans: ls.overdueLoans,
            healthyLoans: Math.max(0, ls.activeLoans - ls.overdueLoans),
            todaysDueEMIs: ls.todaysDueEMIs,
            upcomingEMIs: ls.upcomingEMIs,
            collectionRate,
            recoveryRate,
            monthlyData: {
                loans: monthlyLoans,
                payments: monthlyPayments,
            },
        };

        statsCache.set(cacheKey, statsPayload);

        res.json({
            success: true,
            stats: statsPayload,
        });
    } catch (error) {
        next(error);
    }
};
