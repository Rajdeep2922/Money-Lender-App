const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const { LOAN_STATUS } = require('../config/constants');
const { computeCollectionRate, computeRecoveryRate, computeLoanStage } = require('../utils/loanCalculations');

/**
 * Get aggregated dashboard statistics
 */
exports.getDashboardStats = async (req, res, next) => {
    try {
        const now = new Date();

        // SECURITY: Filter by lender to isolate user data
        const lenderId = req.user?.lenderId?._id || req.user?.lenderId;
        const lenderFilter = lenderId
            ? { $or: [{ lenderId: lenderId }, { lenderId: { $exists: false } }, { lenderId: null }] }
            : {};

        const [
            totalCustomers,
            loanStats,
            paymentStats,
            activeLoansCount,
            completedLoansCount,
            foreclosedLoansCount,
            defaultedLoansCount,
            activeLoans,
        ] = await Promise.all([
            Customer.countDocuments({ isDeleted: { $ne: true }, ...lenderFilter }),
            Loan.aggregate([
                { $match: lenderFilter },
                {
                    $group: {
                        _id: null,
                        totalPrincipal: { $sum: '$principal' },
                        totalRemaining: { $sum: '$remainingBalance' },
                        totalPayable: { $sum: '$totalAmountPayable' },
                    }
                }
            ]),
            Payment.aggregate([
                { $match: lenderFilter },
                { $group: { _id: null, totalCollected: { $sum: '$amountPaid' } } }
            ]),
            Loan.countDocuments({ status: LOAN_STATUS.ACTIVE, ...lenderFilter }),
            Loan.countDocuments({ status: LOAN_STATUS.COMPLETED, ...lenderFilter }),
            Loan.countDocuments({ status: LOAN_STATUS.FORECLOSED, ...lenderFilter }),
            Loan.countDocuments({ status: LOAN_STATUS.DEFAULTED, ...lenderFilter }),
            // Fetch active loans with amortization data to compute overdue/upcoming/today counts
            Loan.find({ status: LOAN_STATUS.ACTIVE, ...lenderFilter })
                .select('paymentsReceived amortizationSchedule gracePeriodDays status'),
        ]);

        const stats = loanStats[0] || { totalPrincipal: 0, totalRemaining: 0, totalPayable: 0 };
        const collected = paymentStats[0]?.totalCollected || 0;

        // Compute dynamic EMI stages across all active loans
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const sevenDaysLater = new Date(todayStart);
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

        let overdueLoansCount = 0;
        let todaysDueEMIs = 0;
        let upcomingEMIs = 0;

        activeLoans.forEach(loan => {
            const stage = computeLoanStage(loan, now);
            const nextEntry = loan.amortizationSchedule?.[loan.paymentsReceived];
            if (!nextEntry) return;

            const dueDate = new Date(nextEntry.dueDate);
            const dueMidnight = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

            if (stage === 'overdue' || stage === 'default') overdueLoansCount++;
            if (dueMidnight.getTime() === todayStart.getTime()) todaysDueEMIs++;
            if (dueMidnight > todayStart && dueMidnight <= sevenDaysLater) upcomingEMIs++;
        });

        // Compute recovery from defaulted loans (total payments made on defaulted loans)
        const defaultedLoanIds = await Loan.find({ status: LOAN_STATUS.DEFAULTED, ...lenderFilter }).select('_id');
        const defaultedPrincipalResult = await Loan.aggregate([
            { $match: { status: LOAN_STATUS.DEFAULTED, ...lenderFilter } },
            { $group: { _id: null, total: { $sum: '$principal' } } },
        ]);
        const recoveredResult = await Payment.aggregate([
            { $match: { loanId: { $in: defaultedLoanIds.map(l => l._id) }, ...lenderFilter } },
            { $group: { _id: null, total: { $sum: '$amountPaid' } } },
        ]);

        const defaultedPrincipal = defaultedPrincipalResult[0]?.total || 0;
        const recoveredAmount = recoveredResult[0]?.total || 0;

        const projectedInterest = stats.totalPayable - stats.totalPrincipal;
        const collectionRate = computeCollectionRate(collected, stats.totalPayable);
        const recoveryRate = computeRecoveryRate(recoveredAmount, defaultedPrincipal);

        // Monthly data for charts (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const dateFilter = { createdAt: { $gte: sixMonthsAgo } };
        const monthlyLoanFilter = lenderId ? { $and: [dateFilter, lenderFilter] } : dateFilter;
        const monthlyPaymentFilter = lenderId
            ? { $and: [{ paymentDate: { $gte: sixMonthsAgo } }, lenderFilter] }
            : { paymentDate: { $gte: sixMonthsAgo } };

        const [monthlyLoans, monthlyPayments] = await Promise.all([
            Loan.aggregate([
                { $match: monthlyLoanFilter },
                {
                    $group: {
                        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                        total: { $sum: '$principal' }
                    }
                }
            ]),
            Payment.aggregate([
                { $match: monthlyPaymentFilter },
                {
                    $group: {
                        _id: { month: { $month: '$paymentDate' }, year: { $year: '$paymentDate' } },
                        total: { $sum: '$amountPaid' }
                    }
                }
            ])
        ]);

        res.json({
            success: true,
            stats: {
                // Portfolio Overview
                totalCustomers,
                totalLent: stats.totalPrincipal,
                totalRemaining: stats.totalRemaining,
                totalReceived: collected,
                projectedInterest,

                // Loan Status
                activeLoans: activeLoansCount,
                completedLoans: completedLoansCount,
                foreclosedLoans: foreclosedLoansCount,
                defaultedLoans: defaultedLoansCount,
                overdueLoans: overdueLoansCount,
                healthyLoans: Math.max(0, activeLoansCount - overdueLoansCount),

                // Collection Metrics
                todaysDueEMIs,
                upcomingEMIs,
                collectionRate,
                recoveryRate,

                // Chart data
                monthlyData: {
                    loans: monthlyLoans,
                    payments: monthlyPayments,
                }
            }
        });
    } catch (error) {
        next(error);
    }
};
