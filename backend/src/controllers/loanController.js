const Loan = require('../models/Loan');
const Customer = require('../models/Customer');
const Lender = require('../models/Lender');
const Payment = require('../models/Payment');
const { AppError } = require('../middleware/errorHandler');
const { PAGINATION, LOAN_STATUS } = require('../config/constants');
const {
    calculateMonthlyEMI,
    generateAmortizationSchedule,
    calculateTotalInterest
} = require('../utils/calculators');
const { generateDocumentNumber } = require('../utils/formatters');
const {
    generateLoanAgreement,
    generateLoanStatement,
    generateLoanClosureNOC
} = require('../utils/pdfGenerator');

/**
 * List all loans with pagination and filtering
 */
exports.listLoans = async (req, res, next) => {
    try {
        const {
            page = PAGINATION.DEFAULT_PAGE,
            limit = PAGINATION.DEFAULT_LIMIT,
            customerId,
            status,
            sortBy = '-createdAt',
            search
        } = req.query;

        const filter = {};
        if (customerId) filter.customerId = customerId;
        if (status) filter.status = status;

        if (search) {
            // Find customers that match the name
            const matchingCustomers = await Customer.find({
                $or: [
                    { firstName: new RegExp(search, 'i') },
                    { lastName: new RegExp(search, 'i') },
                ]
            }).select('_id');

            const customerIds = matchingCustomers.map(c => c._id);

            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { loanNumber: new RegExp(search, 'i') },
                    { customerId: { $in: customerIds } }
                ]
            });
        }

        const loans = await Loan.find(filter)
            .sort(sortBy)
            .limit(Math.min(limit * 1, PAGINATION.MAX_LIMIT))
            .skip((page - 1) * limit)
            .populate('customerId', 'firstName lastName email phone');

        const total = await Loan.countDocuments(filter);

        res.json({
            success: true,
            loans,
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
 * Get single loan by ID with full details
 */
exports.getLoan = async (req, res, next) => {
    try {
        const loan = await Loan.findById(req.params.id)
            .populate('customerId', 'firstName lastName email phone address');

        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        res.json({
            success: true,
            loan,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new loan with auto-calculated EMI
 */
exports.createLoan = async (req, res, next) => {
    try {
        const { customerId, principal, monthlyInterestRate, loanDurationMonths, startDate, notes } = req.body;

        // Verify customer exists
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return next(new AppError('Customer not found', 404));
        }

        // Get lender for prefix
        const lender = await Lender.getLender();

        // Calculate EMI
        const monthlyEMI = calculateMonthlyEMI(principal, monthlyInterestRate, loanDurationMonths);

        // Generate amortization schedule
        const loanStartDate = new Date(startDate || Date.now());
        const amortizationSchedule = generateAmortizationSchedule(
            principal,
            monthlyInterestRate,
            loanDurationMonths,
            monthlyEMI,
            loanStartDate
        );

        // Calculate totals
        const totalInterestAmount = amortizationSchedule.reduce((sum, p) => sum + p.interest, 0);
        const totalAmountPayable = principal + totalInterestAmount;

        // Generate unique loan number
        // Generate unique loan number
        // Find the last created loan to determine the next sequence number
        const lastLoan = await Loan.findOne({}, { loanNumber: 1 }).sort({ createdAt: -1 });
        let nextSequence = 0;

        if (lastLoan && lastLoan.loanNumber) {
            const parts = lastLoan.loanNumber.split('-');
            const lastSeq = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(lastSeq)) {
                nextSequence = lastSeq;
            }
        }

        const loanNumber = generateDocumentNumber(lender.loanPrefix, nextSequence);

        // Calculate end date
        const endDate = new Date(loanStartDate);
        endDate.setMonth(endDate.getMonth() + loanDurationMonths);

        const loan = new Loan({
            customerId,
            loanNumber,
            principal,
            monthlyInterestRate,
            loanDurationMonths,
            startDate: loanStartDate,
            endDate,
            monthlyEMI,
            totalAmountPayable,
            totalInterestAmount,
            remainingBalance: totalAmountPayable,
            amortizationSchedule,
            status: LOAN_STATUS.PENDING_APPROVAL,
            notes,
        });

        await loan.save();

        res.status(201).json({
            success: true,
            message: 'Loan created successfully. Awaiting approval.',
            loan,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Approve pending loan
 */
exports.approveLoan = async (req, res, next) => {
    try {
        const loan = await Loan.findById(req.params.id);

        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        if (loan.status !== LOAN_STATUS.PENDING_APPROVAL) {
            return next(new AppError('Only pending loans can be approved', 400));
        }

        loan.status = LOAN_STATUS.ACTIVE;
        loan.approvalDate = new Date();
        await loan.save();

        res.json({
            success: true,
            message: 'Loan approved successfully',
            loan,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get amortization schedule for a loan
 */
exports.getAmortizationSchedule = async (req, res, next) => {
    try {
        const loan = await Loan.findById(req.params.id);

        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        res.json({
            success: true,
            loanNumber: loan.loanNumber,
            schedule: loan.amortizationSchedule,
            summary: {
                principal: loan.principal,
                totalInterest: loan.totalInterestAmount,
                totalPayable: loan.totalAmountPayable,
                monthlyEMI: loan.monthlyEMI,
                tenure: loan.loanDurationMonths,
                paymentsReceived: loan.paymentsReceived,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current balance for a loan
 */
exports.getCurrentBalance = async (req, res, next) => {
    try {
        const loan = await Loan.findById(req.params.id);

        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        const totalPaid = loan.totalAmountPayable - loan.remainingBalance;

        res.json({
            success: true,
            loanNumber: loan.loanNumber,
            remainingBalance: loan.remainingBalance,
            totalPaid,
            paymentsReceived: loan.paymentsReceived,
            remainingPayments: loan.loanDurationMonths - loan.paymentsReceived,
            status: loan.status,
            nextDueDate: loan.amortizationSchedule[loan.paymentsReceived]?.dueDate,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update loan (only before approval)
 */
exports.updateLoan = async (req, res, next) => {
    try {
        const loan = await Loan.findById(req.params.id);

        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        if (loan.status !== LOAN_STATUS.PENDING_APPROVAL) {
            return next(new AppError('Cannot update approved or active loans', 400));
        }

        Object.assign(loan, req.body);
        await loan.save();

        res.json({
            success: true,
            message: 'Loan updated successfully',
            loan,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cancel loan (only if pending)
 */
exports.cancelLoan = async (req, res, next) => {
    try {
        const loan = await Loan.findById(req.params.id);

        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        if (loan.status !== LOAN_STATUS.PENDING_APPROVAL) {
            return next(new AppError('Only pending loans can be cancelled', 400));
        }

        loan.status = LOAN_STATUS.CLOSED;
        await loan.save();

        res.json({
            success: true,
            message: 'Loan cancelled successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Download Loan Agreement as PDF
 */
exports.downloadAgreement = async (req, res, next) => {
    try {
        const loan = await Loan.findById(req.params.id)
            .populate('customerId', 'firstName lastName email phone address aadhaarNumber panNumber signature');

        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        const lender = await Lender.getLender();

        const pdfDoc = await generateLoanAgreement(loan, lender);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Agreement-${loan.loanNumber}.pdf`);
        pdfDoc.pipe(res);
        pdfDoc.end();
    } catch (error) {
        next(error);
    }
};

/**
 * Download Loan Statement as PDF
 */
exports.downloadStatement = async (req, res, next) => {
    try {
        const loan = await Loan.findById(req.params.id)
            .populate('customerId', 'firstName lastName email phone address aadhaarNumber panNumber');

        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        const lender = await Lender.getLender();
        const payments = await Payment.find({ loanId: loan._id }).sort({ paymentDate: -1 });

        const pdfDoc = await generateLoanStatement(loan, lender, payments);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Statement-${loan.loanNumber}.pdf`);
        pdfDoc.pipe(res);
        pdfDoc.end();
    } catch (error) {
        next(error);
    }
};

/**
 * Foreclose/Early Settlement of a loan
 */
exports.forecloseLoan = async (req, res, next) => {
    try {
        const { foreclosureFee = 0, notes, paymentMethod = 'cash' } = req.body;
        const loan = await Loan.findById(req.params.id);

        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        if (loan.status !== LOAN_STATUS.ACTIVE) {
            return next(new AppError('Only active loans can be foreclosed', 400));
        }

        // Record final settlement payment
        const settlementAmount = loan.remainingBalance + Number(foreclosureFee);

        const payment = new Payment({
            loanId: loan._id,
            customerId: loan.customerId,
            amountPaid: settlementAmount,
            paymentDate: new Date(),
            paymentMethod,
            notes: `Foreclosure Settlement. Fee: ${foreclosureFee}. ${notes || ''}`,
            isForeclosure: true
        });

        await payment.save();

        // Close loan
        loan.status = LOAN_STATUS.CLOSED;
        loan.remainingBalance = 0;
        loan.notes = `${loan.notes || ''}\n[FORECLOSED ${new Date().toLocaleDateString()}]`;
        await loan.save();

        res.json({
            success: true,
            message: 'Loan foreclosed and settled successfully',
            settlementAmount
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Download No Objection Certificate (NOC)
 */
exports.downloadNOC = async (req, res, next) => {
    try {
        const loan = await Loan.findById(req.params.id)
            .populate('customerId', 'firstName lastName email phone address aadhaarNumber panNumber');

        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        if (loan.status !== LOAN_STATUS.CLOSED && loan.status !== LOAN_STATUS.COMPLETED) {
            return next(new AppError('NOC can only be generated for closed or completed loans', 400));
        }

        const lender = await Lender.getLender();
        const pdfDoc = await generateLoanClosureNOC(loan, lender);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=NOC-${loan.loanNumber}.pdf`);
        pdfDoc.pipe(res);
        pdfDoc.end();
    } catch (error) {
        next(error);
    }
};
/**
 * Manually update loan status (Toggle between Pending/Active)
 */
exports.updateLoanStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const loan = await Loan.findById(req.params.id);

        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        // Validate Status Transition
        const allowedStatuses = [LOAN_STATUS.PENDING_APPROVAL, LOAN_STATUS.APPROVED, LOAN_STATUS.ACTIVE];

        if (!allowedStatuses.includes(status)) {
            return next(new AppError('Invalid status update. Only Pending, Approved, or Active status can be set manually.', 400));
        }

        if (status === LOAN_STATUS.PENDING_APPROVAL) {
            // Check if payments exist
            if (loan.paymentsReceived > 0) {
                return next(new AppError('Cannot revert to Pending: Payments have already been recorded.', 400));
            }
            loan.status = LOAN_STATUS.PENDING_APPROVAL;
            loan.approvalDate = undefined; // Clear approval date
        } else {
            // For Approved or Active
            loan.status = status;
            // Set approval date if not already set
            if (!loan.approvalDate) {
                loan.approvalDate = new Date();
            }
        }

        await loan.save();

        res.json({
            success: true,
            message: `Loan status updated to ${status}`,
            loan,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete loan
 */
exports.deleteLoan = async (req, res, next) => {
    try {
        const loan = await Loan.findByIdAndDelete(req.params.id);

        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        // Optional: Delete related payments and invoices
        // await Payment.deleteMany({ loanId: loan._id });
        // await Invoice.deleteMany({ loanId: loan._id });

        res.json({
            success: true,
            message: 'Loan deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
