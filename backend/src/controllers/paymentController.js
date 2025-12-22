const Payment = require('../models/Payment');
const Loan = require('../models/Loan');
const Customer = require('../models/Customer');
const Lender = require('../models/Lender');
const Invoice = require('../models/Invoice');
const { generatePaymentReceipt } = require('../utils/pdfGenerator');
const { AppError } = require('../middleware/errorHandler');
const { PAGINATION, LOAN_STATUS, INVOICE_STATUS } = require('../config/constants');

/**
 * List all payments with pagination
 */
exports.listPayments = async (req, res, next) => {
    try {
        const {
            page = PAGINATION.DEFAULT_PAGE,
            limit = PAGINATION.DEFAULT_LIMIT,
            loanId,
            customerId,
            dateFrom,
            dateTo,
            sortBy = '-paymentDate',
            search
        } = req.query;

        const filter = {};
        if (loanId) filter.loanId = loanId;
        if (customerId) filter.customerId = customerId;

        // Date range filter
        if (dateFrom || dateTo) {
            filter.paymentDate = {};
            if (dateFrom) filter.paymentDate.$gte = new Date(dateFrom);
            if (dateTo) filter.paymentDate.$lte = new Date(dateTo);
        }

        // Search filter
        if (search) {
            // Find customers and loans that match the search
            const [matchingCustomers, matchingLoans] = await Promise.all([
                Customer.find({
                    $or: [
                        { firstName: new RegExp(search, 'i') },
                        { lastName: new RegExp(search, 'i') },
                    ]
                }).select('_id'),
                Loan.find({
                    loanNumber: new RegExp(search, 'i')
                }).select('_id')
            ]);

            const customerIds = matchingCustomers.map(c => c._id);
            const loanIds = matchingLoans.map(l => l._id);

            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { referenceId: new RegExp(search, 'i') },
                    { customerId: { $in: customerIds } },
                    { loanId: { $in: loanIds } }
                ]
            });
        }

        const payments = await Payment.find(filter)
            .sort(sortBy)
            .limit(Math.min(limit * 1, PAGINATION.MAX_LIMIT))
            .skip((page - 1) * limit)
            .populate('loanId', 'loanNumber principal')
            .populate('customerId', 'firstName lastName');

        const total = await Payment.countDocuments(filter);

        res.json({
            success: true,
            payments,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single payment by ID
 */
exports.getPayment = async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('loanId', 'loanNumber principal monthlyInterestRate')
            .populate('customerId', 'firstName lastName email phone');

        if (!payment) {
            return next(new AppError('Payment not found', 404));
        }

        res.json({
            success: true,
            payment,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Record new payment
 */
exports.recordPayment = async (req, res, next) => {
    try {
        const { loanId, amountPaid, paymentMethod, paymentDate, referenceId, notes } = req.body;

        // Find loan
        const loan = await Loan.findById(loanId).populate('customerId');

        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        if (loan.status !== LOAN_STATUS.ACTIVE && loan.status !== LOAN_STATUS.APPROVED) {
            return next(new AppError('Can only record payments for active loans', 400));
        }

        if (loan.remainingBalance <= 0) {
            return next(new AppError('Loan is already fully paid', 400));
        }

        // Get expected payment from schedule
        const paymentNumber = loan.paymentsReceived + 1;
        const scheduledPayment = loan.amortizationSchedule[loan.paymentsReceived];

        // Calculate principal and interest portions
        let interestPortion, principalPortion;

        if (scheduledPayment) {
            interestPortion = Math.min(scheduledPayment.interest, amountPaid);
            principalPortion = amountPaid - interestPortion;
        } else {
            // Extra payment - all goes to principal
            interestPortion = 0;
            principalPortion = amountPaid;
        }

        // Update loan balance
        const newRemainingBalance = Math.max(0, loan.remainingBalance - amountPaid);

        // Create payment record
        const payment = new Payment({
            loanId: loan._id,
            customerId: loan.customerId._id,
            paymentNumber,
            amountPaid,
            principalPortion,
            interestPortion,
            paymentMethod,
            paymentDate: paymentDate || new Date(),
            referenceId,
            balanceAfterPayment: newRemainingBalance,
            notes,
        });

        await payment.save();

        // Update loan
        loan.paymentsReceived = paymentNumber;
        loan.remainingBalance = newRemainingBalance;

        // Check if loan is fully paid
        if (newRemainingBalance <= 0) {
            loan.status = LOAN_STATUS.COMPLETED;
        } else if (loan.status === LOAN_STATUS.APPROVED) {
            loan.status = LOAN_STATUS.ACTIVE;
        }

        await loan.save();

        // ------------------------------------------------------------------
        // NEW: Update linked Invoice if exists
        // ------------------------------------------------------------------
        // Strategy: Find the oldest 'pending' invoice for this loan
        const pendingInvoice = await Invoice.findOne({
            loanId: loan._id,
            status: { $in: [INVOICE_STATUS.PENDING, INVOICE_STATUS.OVERDUE, INVOICE_STATUS.ISSUED] }
        }).sort({ 'period.year': 1, 'period.month': 1 }); // Oldest first

        if (pendingInvoice) {
            // Calculate how much this payment covers
            const coverage = amountPaid;

            pendingInvoice.amountPaid += coverage;
            pendingInvoice.balanceDue = Math.max(0, pendingInvoice.amountDue - pendingInvoice.amountPaid);
            pendingInvoice.paymentId = payment._id; // Link the payment

            if (pendingInvoice.balanceDue <= 0) {
                pendingInvoice.status = INVOICE_STATUS.PAID;
            } else {
                // Partial payment logic could go here (e.g. PARTIALLY_PAID status if you had one)
                // For now, keep as pending/overdue/issued unless fully paid
            }

            await pendingInvoice.save();
        }

        res.status(201).json({
            success: true,
            message: 'Payment recorded successfully',
            payment: {
                ...payment.toObject(),
                loanNumber: loan.loanNumber,
                customerName: `${loan.customerId.firstName} ${loan.customerId.lastName}`,
            },
            loanStatus: {
                remainingBalance: newRemainingBalance,
                paymentsReceived: paymentNumber,
                status: loan.status,
                nextDueDate: loan.amortizationSchedule[paymentNumber]?.dueDate,
                isFullyPaid: newRemainingBalance <= 0,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get payments for a specific loan
 */
exports.getPaymentsForLoan = async (req, res, next) => {
    try {
        const { loanId } = req.params;

        const loan = await Loan.findById(loanId);
        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        const payments = await Payment.find({ loanId })
            .sort({ paymentDate: -1 })
            .populate('customerId', 'firstName lastName');

        res.json({
            success: true,
            loanNumber: loan.loanNumber,
            payments,
            summary: {
                totalPayments: payments.length,
                totalPaid: payments.reduce((sum, p) => sum + p.amountPaid, 0),
                remainingBalance: loan.remainingBalance,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get payments for a specific customer
 */
exports.getPaymentsForCustomer = async (req, res, next) => {
    try {
        const { customerId } = req.params;

        const payments = await Payment.find({ customerId })
            .sort({ paymentDate: -1 })
            .populate('loanId', 'loanNumber principal');

        res.json({
            success: true,
            payments,
            summary: {
                totalPayments: payments.length,
                totalPaid: payments.reduce((sum, p) => sum + p.amountPaid, 0),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update payment (if recent)
 */
exports.updatePayment = async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return next(new AppError('Payment not found', 404));
        }

        // Only allow updates within 24 hours
        const hoursSincePayment = (Date.now() - new Date(payment.createdAt)) / (1000 * 60 * 60);
        if (hoursSincePayment > 24) {
            return next(new AppError('Payments can only be modified within 24 hours', 400));
        }

        Object.assign(payment, req.body);
        await payment.save();

        res.json({
            success: true,
            message: 'Payment updated successfully',
            payment,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete payment (if recent)
 */
exports.deletePayment = async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return next(new AppError('Payment not found', 404));
        }

        // Only allow deletion within 24 hours
        const hoursSincePayment = (Date.now() - new Date(payment.createdAt)) / (1000 * 60 * 60);
        if (hoursSincePayment > 24) {
            return next(new AppError('Payments can only be deleted within 24 hours', 400));
        }

        // Revert loan balance
        const loan = await Loan.findById(payment.loanId);
        if (loan) {
            loan.remainingBalance += payment.amountPaid;
            loan.paymentsReceived = Math.max(0, loan.paymentsReceived - 1);
            if (loan.status === LOAN_STATUS.COMPLETED) {
                loan.status = LOAN_STATUS.ACTIVE;
            }
            await loan.save();
        }

        // ------------------------------------------------------------------
        // NEW: Revert linked Invoice if exists
        // ------------------------------------------------------------------
        const linkedInvoice = await Invoice.findOne({ paymentId: payment._id });
        if (linkedInvoice) {
            linkedInvoice.amountPaid = Math.max(0, linkedInvoice.amountPaid - payment.amountPaid);
            linkedInvoice.balanceDue = linkedInvoice.amountDue - linkedInvoice.amountPaid;

            // If balance due > 0, revert status to PENDING (or OVERDUE based on date, simplified to PENDING here)
            if (linkedInvoice.balanceDue > 0) {
                linkedInvoice.status = INVOICE_STATUS.PENDING;
            }
            // Remove payment link
            linkedInvoice.paymentId = undefined;
            await linkedInvoice.save();
        }

        await payment.deleteOne();

        res.json({
            success: true,
            message: 'Payment deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Download Payment Receipt PDF
 */
exports.downloadReceipt = async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('loanId')
            .populate('customerId');

        if (!payment) {
            return next(new AppError('Payment not found', 404));
        }

        const lender = await Lender.findOne();
        if (!lender) {
            return next(new AppError('Lender details not configured', 400));
        }

        const pdfDoc = await generatePaymentReceipt(payment, lender);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Receipt-${payment._id.toString().slice(-6)}.pdf`);

        pdfDoc.pipe(res);
        pdfDoc.end();
    } catch (error) {
        next(error);
    }
};
