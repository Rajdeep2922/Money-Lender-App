const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Loan = require('../models/Loan');
const Customer = require('../models/Customer');
const Lender = require('../models/Lender');
const Invoice = require('../models/Invoice');
const { generatePaymentReceipt } = require('../utils/pdfGenerator');
const { AppError } = require('../middleware/errorHandler');
const { PAGINATION, LOAN_STATUS, INVOICE_STATUS, INVOICE_TYPES } = require('../config/constants');
const { lenderIdOf } = require('../utils/tenant');
const { nextDocumentNumber } = require('../utils/sequence');

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

        const lenderId = lenderIdOf(req);
        const filter = { lenderId };

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
            const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escaped, 'i');
            // Find customers and loans that match the search within this tenant
            const [matchingCustomers, matchingLoans] = await Promise.all([
                Customer.find({
                    lenderId,
                    $or: [
                        { firstName: regex },
                        { lastName: regex },
                    ]
                }).select('_id'),
                Loan.find({
                    lenderId,
                    loanNumber: regex
                }).select('_id')
            ]);

            const customerIds = matchingCustomers.map(c => c._id);
            const loanIds = matchingLoans.map(l => l._id);

            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { referenceId: regex },
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
        const lenderId = lenderIdOf(req);
        const payment = await Payment.findOne({ _id: req.params.id, lenderId })
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
    const session = await mongoose.startSession();
    try {
        const lenderId = lenderIdOf(req);
        const key = req.get('Idempotency-Key') || req.body.idempotencyKey;
        if (!key) {
            return next(new AppError('Idempotency-Key is required', 400));
        }

        const existing = await Payment.findOne({ lenderId, idempotencyKey: key });
        if (existing) {
            return res.status(200).json({ success: true, payment: existing, replayed: true });
        }

        const { loanId, amountPaid, paymentMethod, paymentDate, referenceId, notes, bankDetails = {} } = req.body;
        const amount = Number(amountPaid);
        if (!Number.isFinite(amount) || amount <= 0) {
            return next(new AppError('Invalid amount', 400));
        }

        let payload;
        await session.withTransaction(async () => {
            // Acquire write lock on Loan first so concurrent payments serialize via WriteConflict retry
            const loan = await Loan.findOneAndUpdate(
                {
                    _id: loanId,
                    lenderId,
                    isDeleted: { $ne: true },
                    status: { $in: [LOAN_STATUS.ACTIVE, LOAN_STATUS.APPROVED] },
                },
                { $inc: { paymentsReceived: 1 } },
                { new: true, session }
            ).populate('customerId');

            if (!loan) {
                const existingLoan = await Loan.findOne({ _id: loanId, lenderId, isDeleted: { $ne: true } }).session(session);
                if (!existingLoan) throw new AppError('Loan not found', 404);
                throw new AppError('Can only record payments for active loans', 409);
            }
            if (!loan.customerId || String(loan.customerId.lenderId) !== String(lenderId)) {
                throw new AppError('Customer does not belong to this lender', 403);
            }
            if (loan.remainingBalance <= 0) {
                throw new AppError('Loan is already fully paid', 409);
            }
            if (amount > loan.remainingBalance) {
                throw new AppError('Amount exceeds outstanding balance', 400);
            }

            const paymentNumber = loan.paymentsReceived;
            const scheduled = loan.amortizationSchedule[paymentNumber - 1];
            const interestPortion = scheduled ? Math.min(scheduled.interest, amount) : 0;
            const principalPortion = amount - interestPortion;
            const newBalance = loan.remainingBalance - amount;

            const [payment] = await Payment.create([{
                loanId: loan._id,
                customerId: loan.customerId._id,
                lenderId,
                idempotencyKey: key,
                paymentNumber,
                amountPaid: amount,
                principalPortion,
                interestPortion,
                paymentMethod: paymentMethod ? paymentMethod.toLowerCase() : 'bank_transfer',
                paymentDate: paymentDate || new Date(),
                referenceId,
                balanceAfterPayment: newBalance,
                notes,
                bankDetails,
            }], { session });

            loan.remainingBalance = newBalance;
            loan.nextDueDate = loan.amortizationSchedule[paymentNumber]?.dueDate || null;
            if (newBalance === 0) {
                loan.status = LOAN_STATUS.COMPLETED;
            } else if (loan.status === LOAN_STATUS.APPROVED) {
                loan.status = LOAN_STATUS.ACTIVE;
            }
            await loan.save({ session });

            const pendingInvoice = await Invoice.findOne({
                loanId: loan._id,
                lenderId,
                status: { $in: [INVOICE_STATUS.PENDING, INVOICE_STATUS.OVERDUE, INVOICE_STATUS.ISSUED] },
            }).sort({ 'period.year': 1, 'period.month': 1 }).session(session);

            if (pendingInvoice) {
                pendingInvoice.amountPaid = Math.min(pendingInvoice.amountDue, pendingInvoice.amountPaid + amount);
                pendingInvoice.balanceDue = Math.max(0, pendingInvoice.amountDue - pendingInvoice.amountPaid);
                pendingInvoice.paymentId = payment._id;
                pendingInvoice.status = pendingInvoice.balanceDue === 0 ? INVOICE_STATUS.PAID : pendingInvoice.status;
                await pendingInvoice.save({ session });
            } else {
                const invoiceNumber = await nextDocumentNumber(`invoice:${lenderId}`, 'INV');
                const pDate = paymentDate ? new Date(paymentDate) : new Date();
                await Invoice.create([{
                    invoiceNumber,
                    lenderId,
                    loanId: loan._id,
                    customerId: loan.customerId._id,
                    paymentId: payment._id,
                    invoiceType: INVOICE_TYPES.EMI_RECEIPT,
                    amountDue: amount,
                    amountPaid: amount,
                    balanceDue: 0,
                    dueDate: pDate,
                    status: INVOICE_STATUS.PAID,
                }], { session });
            }

            payload = { payment, loan, newBalance, paymentNumber };
        });

        return res.status(201).json({
            success: true,
            message: 'Payment recorded successfully',
            payment: {
                ...payload.payment.toObject(),
                loanNumber: payload.loan.loanNumber,
                customerName: `${payload.loan.customerId.firstName} ${payload.loan.customerId.lastName}`,
            },
            loanStatus: {
                remainingBalance: payload.newBalance,
                paymentsReceived: payload.paymentNumber,
                status: payload.loan.status,
                nextDueDate: payload.loan.nextDueDate,
                isFullyPaid: payload.newBalance === 0,
            },
        });
    } catch (error) {
        if (error?.code === 11000) {
            const key = req.get('Idempotency-Key') || req.body?.idempotencyKey;
            if (key) {
                const existing = await Payment.findOne({ lenderId: lenderIdOf(req), idempotencyKey: key });
                if (existing) {
                    return res.status(200).json({ success: true, payment: existing, replayed: true });
                }
            }
            return next(new AppError('Duplicate payment', 409));
        }
        next(error);
    } finally {
        await session.endSession();
    }
};

/**
 * Get payments for a specific loan
 */
exports.getPaymentsForLoan = async (req, res, next) => {
    try {
        const lenderId = lenderIdOf(req);
        const { loanId } = req.params;

        const loan = await Loan.findOne({ _id: loanId, lenderId });
        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        const payments = await Payment.find({ loanId, lenderId })
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
        const lenderId = lenderIdOf(req);
        const { customerId } = req.params;

        const customer = await Customer.findOne({ _id: customerId, lenderId });
        if (!customer) {
            return next(new AppError('Customer not found', 404));
        }

        const payments = await Payment.find({ customerId, lenderId })
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
        const lenderId = lenderIdOf(req);
        const payment = await Payment.findOne({ _id: req.params.id, lenderId });

        if (!payment) {
            return next(new AppError('Payment not found', 404));
        }

        // Reject immutable ledger fields
        const FORBIDDEN_FIELDS = ['amountPaid', 'loanId', 'customerId', 'paymentNumber', 'lenderId', 'balanceAfterPayment'];
        for (const f of FORBIDDEN_FIELDS) {
            if (req.body[f] !== undefined) {
                return next(new AppError(`Cannot modify ${f} via metadata update`, 400));
            }
        }

        const ALLOWED_PAYMENT_FIELDS = ['paymentMethod', 'paymentDate', 'referenceId', 'notes', 'bankDetails'];
        for (const field of ALLOWED_PAYMENT_FIELDS) {
            if (req.body[field] !== undefined) {
                payment[field] = req.body[field];
            }
        }
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
    const session = await mongoose.startSession();
    try {
        const lenderId = lenderIdOf(req);
        await session.withTransaction(async () => {
            const payment = await Payment.findOneAndDelete({ _id: req.params.id, lenderId }).session(session);
            if (!payment) {
                throw new AppError('Payment not found', 404);
            }

            if (payment.idempotencyKey && payment.idempotencyKey.startsWith('FORECLOSE-')) {
                throw new AppError('Cannot delete a foreclosure settlement payment directly', 409);
            }

            const loan = await Loan.findOne({ _id: payment.loanId, lenderId }).session(session);
            if (loan) {
                if (loan.status === LOAN_STATUS.FORECLOSED) {
                    throw new AppError('Cannot delete payment on a foreclosed loan', 409);
                }
                loan.remainingBalance = Math.min(loan.totalAmountPayable, loan.remainingBalance + payment.amountPaid);
                loan.paymentsReceived = Math.max(0, loan.paymentsReceived - 1);
                loan.nextDueDate = loan.amortizationSchedule[loan.paymentsReceived]?.dueDate || null;
                if (loan.status === LOAN_STATUS.COMPLETED) {
                    loan.status = LOAN_STATUS.ACTIVE;
                }
                await loan.save({ session });
            }

            const linkedInvoice = await Invoice.findOne({ paymentId: payment._id, lenderId }).session(session);
            if (linkedInvoice) {
                linkedInvoice.amountPaid = Math.max(0, linkedInvoice.amountPaid - payment.amountPaid);
                linkedInvoice.balanceDue = Math.max(0, linkedInvoice.amountDue - linkedInvoice.amountPaid);
                if (linkedInvoice.balanceDue > 0) {
                    linkedInvoice.status = INVOICE_STATUS.PENDING;
                }
                linkedInvoice.paymentId = undefined;
                await linkedInvoice.save({ session });
            }
        });

        res.json({
            success: true,
            message: 'Payment deleted successfully',
        });
    } catch (error) {
        next(error);
    } finally {
        await session.endSession();
    }
};

/**
 * Download Payment Receipt PDF
 */
exports.downloadReceipt = async (req, res, next) => {
    try {
        const lenderId = lenderIdOf(req);
        const payment = await Payment.findOne({ _id: req.params.id, lenderId })
            .populate('loanId')
            .populate('customerId');

        if (!payment) {
            return next(new AppError('Payment not found', 404));
        }

        const lender = await Lender.getLender(lenderId);

        console.log('Generating receipt for payment:', payment._id);
        console.log('Payment Method:', payment.paymentMethod);
        console.log('Bank Details:', JSON.stringify(payment.bankDetails, null, 2));

        const pdfDoc = await generatePaymentReceipt(payment, lender);


        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Receipt-${payment._id.toString().slice(-6)}.pdf`);

        pdfDoc.pipe(res);
        pdfDoc.end();
    } catch (error) {
        next(error);
    }
};
