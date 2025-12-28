const Invoice = require('../models/Invoice');
const Loan = require('../models/Loan');
const Lender = require('../models/Lender');
const { AppError } = require('../middleware/errorHandler');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const { generateDocumentNumber } = require('../utils/formatters');

/**
 * List all invoices
 */
exports.listInvoices = async (req, res, next) => {
    try {
        const { loanId, customerId, status } = req.query;
        const filter = {};
        if (loanId) filter.loanId = loanId;
        if (customerId) filter.customerId = customerId;
        if (status) filter.status = status;

        const invoices = await Invoice.find(filter)
            .populate('loanId', 'loanNumber')
            .populate('customerId', 'firstName lastName')
            .sort('-invoiceDate');

        res.json({ success: true, invoices });
    } catch (error) {
        next(error);
    }
};

/**
 * Generate monthly invoices for upcoming EMIs
 */
exports.generateMonthlyInvoices = async (req, res, next) => {
    try {
        // Find all active loans with remaining balance
        const loans = await Loan.find({
            status: 'active',
            remainingBalance: { $gt: 0 }
        });

        let generatedCount = 0;
        const lender = await Lender.getLender();

        for (const loan of loans) {
            // Get the next due EMI from amortization schedule
            const nextEmiIndex = loan.paymentsReceived;
            const nextEmi = loan.amortizationSchedule[nextEmiIndex];

            if (!nextEmi) continue; // All EMIs paid

            const dueDate = new Date(nextEmi.dueDate);
            const month = dueDate.getMonth() + 1;
            const year = dueDate.getFullYear();

            // Check if invoice already exists for this loan and period
            const existingInvoice = await Invoice.findOne({
                loanId: loan._id,
                'period.month': month,
                'period.year': year
            });

            if (!existingInvoice) {
                // Find the last invoice to determine the next number safely
                const lastInvoice = await Invoice.findOne().sort({ invoiceNumber: -1 });
                let nextCount = 1;

                if (lastInvoice && lastInvoice.invoiceNumber) {
                    const parts = lastInvoice.invoiceNumber.split('-');
                    if (parts.length === 3) {
                        nextCount = parseInt(parts[2], 10) + 1;
                    }
                }

                const invoiceNumber = generateDocumentNumber(lender?.invoicePrefix || 'INV', nextCount - 1); // generateDocumentNumber adds 1

                const invoice = new Invoice({
                    invoiceNumber,
                    loanId: loan._id,
                    customerId: loan.customerId,
                    amountDue: nextEmi.emi,
                    balanceDue: nextEmi.emi,
                    dueDate: dueDate,
                    period: { month, year },
                    status: 'pending'
                });
                await invoice.save();
                generatedCount++;
            }
        }

        res.json({
            success: true,
            message: `Generated ${generatedCount} invoices`,
            count: generatedCount
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
        const invoice = await Invoice.findById(req.params.id)
            .populate('loanId')
            .populate('customerId', 'firstName lastName email phone address signature')
            .populate('paymentId'); // Populate payment details including bank info

        const lender = await Lender.findOne();

        if (!invoice) {
            return next(new AppError('Invoice not found', 404));
        }

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
 * Delete invoice
 */
exports.deleteInvoice = async (req, res, next) => {
    try {
        const invoice = await Invoice.findByIdAndDelete(req.params.id);

        if (!invoice) {
            return next(new AppError('Invoice not found', 404));
        }

        res.json({
            success: true,
            message: 'Invoice deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
