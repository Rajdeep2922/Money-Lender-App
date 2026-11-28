const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Loan = require('../models/Loan');
const Lender = require('../models/Lender');
const { AppError } = require('../middleware/errorHandler');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const { generateDocumentNumber } = require('../utils/formatters');
const { INVOICE_STATUS } = require('../config/constants');
const { lenderIdOf } = require('../utils/tenant');
const { reserveSequenceBlock } = require('../utils/sequence');

/**
 * List all invoices
 */
exports.listInvoices = async (req, res, next) => {
    try {
        const lenderId = lenderIdOf(req);
        const { loanId, customerId, status, page = 1, limit = 20 } = req.query;
        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || 20), 100);

        const filter = { lenderId };
        if (loanId) filter.loanId = loanId;
        if (customerId) filter.customerId = customerId;
        if (status) {
            if (!Object.values(INVOICE_STATUS).includes(status)) {
                return next(new AppError('Invalid invoice status', 400));
            }
            filter.status = status;
        }

        const [invoices, total] = await Promise.all([
            Invoice.find(filter)
                .populate('loanId', 'loanNumber')
                .populate('customerId', 'firstName lastName')
                .sort('-invoiceDate')
                .skip((safePage - 1) * safeLimit)
                .limit(safeLimit),
            Invoice.countDocuments(filter),
        ]);

        res.json({
            success: true,
            invoices,
            pagination: {
                page: safePage,
                limit: safeLimit,
                total,
                pages: Math.ceil(total / safeLimit),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Generate monthly invoices for a single lender in a constant number of queries
 */
async function generateMonthlyInvoicesForLender(lenderId) {
    const lender = await Lender.getLender(lenderId);

    // Step 1: Load tenant's active loans in one query
    const loans = await Loan.find({
        lenderId,
        status: 'active',
        isDeleted: { $ne: true },
        remainingBalance: { $gt: 0 },
    })
        .select('_id customerId paymentsReceived amortizationSchedule')
        .lean();

    if (loans.length === 0) return 0;

    // Step 2: Build candidates in memory
    const rawCandidates = [];
    for (const loan of loans) {
        const nextEmi = loan.amortizationSchedule?.[loan.paymentsReceived];
        if (!nextEmi) continue;
        const dueDate = new Date(nextEmi.dueDate);
        rawCandidates.push({
            loanId: loan._id,
            customerId: loan.customerId,
            dueDate,
            month: dueDate.getMonth() + 1,
            year: dueDate.getFullYear(),
            emi: nextEmi.emi,
        });
    }

    if (rawCandidates.length === 0) return 0;

    // Step 3: Fetch existing non-cancelled periods in one query
    const existing = await Invoice.find({
        lenderId,
        loanId: { $in: rawCandidates.map((c) => c.loanId) },
        status: { $ne: INVOICE_STATUS.CANCELLED },
    })
        .select('loanId period')
        .lean();

    const existingKeys = new Set(
        existing
            .filter((inv) => inv.period?.year && inv.period?.month)
            .map((inv) => `${inv.loanId}:${inv.period.year}-${inv.period.month}`)
    );

    const candidates = rawCandidates.filter(
        (c) => !existingKeys.has(`${c.loanId}:${c.year}-${c.month}`)
    );

    if (candidates.length === 0) return 0;

    // Step 4: Reserve a block of document numbers & bulk upsert inside a transaction
    const session = await mongoose.startSession();
    let inserted = 0;
    try {
        await session.withTransaction(async () => {
            const start = await reserveSequenceBlock(`invoice:${lenderId}`, candidates.length, session);
            const prefix = lender.invoicePrefix || 'INV';
            const ops = candidates.map((c, i) => ({
                updateOne: {
                    filter: {
                        loanId: c.loanId,
                        lenderId,
                        'period.year': c.year,
                        'period.month': c.month,
                    },
                    update: {
                        $setOnInsert: {
                            invoiceNumber: generateDocumentNumber(prefix, start - 1 + i),
                            lenderId,
                            loanId: c.loanId,
                            customerId: c.customerId,
                            amountDue: c.emi,
                            balanceDue: c.emi,
                            dueDate: c.dueDate,
                            period: { month: c.month, year: c.year },
                            status: INVOICE_STATUS.PENDING,
                        },
                    },
                    upsert: true,
                },
            }));
            const result = await Invoice.bulkWrite(ops, { ordered: false, session });
            inserted = (result.upsertedCount || 0) + (result.modifiedCount || 0);
        });
    } finally {
        await session.endSession();
    }

    return inserted;
}

exports.generateMonthlyInvoicesForLender = generateMonthlyInvoicesForLender;

/**
 * Generate monthly invoices for upcoming EMIs
 */
exports.generateMonthlyInvoices = async (req, res, next) => {
    try {
        const lenderId = lenderIdOf(req);
        const generatedCount = await generateMonthlyInvoicesForLender(lenderId);

        res.json({
            success: true,
            message: `Generated ${generatedCount} invoices`,
            count: generatedCount,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Download Invoice PDF
 */
exports.downloadInvoice = async (req, res, next) => {
    try {
        const lenderId = lenderIdOf(req);
        const invoice = await Invoice.findOne({ _id: req.params.id, lenderId })
            .populate('loanId')
            .populate('customerId', 'firstName lastName email phone address signature')
            .populate('paymentId'); // Populate payment details including bank info

        if (!invoice) {
            return next(new AppError('Invoice not found', 404));
        }

        const lender = await Lender.getLender(lenderId);

        // Restrict Invoice/Receipt generation to Paid amounts only
        if (invoice.amountPaid <= 0) {
            return next(new AppError('Receipts can only be generated for collected payments.', 400));
        }

        const pdfDoc = await generateInvoicePDF(invoice, lender);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice_${invoice.invoiceNumber}.pdf`);

        pdfDoc.pipe(res);
        pdfDoc.end();
    } catch (error) {
        next(error);
    }
};

/**
 * Soft delete invoice (sets status to cancelled for audit trail)
 */
exports.deleteInvoice = async (req, res, next) => {
    try {
        const lenderId = lenderIdOf(req);
        const invoice = await Invoice.findOneAndUpdate(
            { _id: req.params.id, lenderId, status: { $ne: INVOICE_STATUS.CANCELLED } },
            { $set: { status: INVOICE_STATUS.CANCELLED } },
            { new: true }
        );

        if (!invoice) {
            return next(new AppError('Invoice not found', 404));
        }

        res.json({
            success: true,
            message: 'Invoice cancelled successfully',
        });
    } catch (error) {
        next(error);
    }
};
