const Loan = require('../models/Loan');
const Customer = require('../models/Customer');
const Lender = require('../models/Lender');
const Payment = require('../models/Payment');
const { AppError } = require('../middleware/errorHandler');
const {
    PAGINATION,
    LOAN_STATUS,
    LOAN_COMPLETION_TYPE,
    FORECLOSURE_POLICY,
    DISCOUNT_REASON,
} = require('../config/constants');
const {
    calculateMonthlyEMI,
    generateAmortizationSchedule,
    calculateTotalInterest,
    calculateCompoundEMI,
    generateCompoundAmortizationSchedule,
} = require('../utils/calculators');
const { generateDocumentNumber } = require('../utils/formatters');
const {
    generateLoanAgreement,
    generateLoanStatement,
    generateLoanClosureNOC,
    generateSettlementCertificate
} = require('../utils/pdfGenerator');
const {
    computeForeclosureSettlement,
    computeLoanStage,
} = require('../utils/loanCalculations');
const { buildPolicySnapshot } = require('./legalController');


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

        // SECURITY: Filter by lender to isolate user data
        if (req.user && req.user.lenderId) {
            filter.lenderId = req.user.lenderId;
        }

        if (customerId) filter.customerId = customerId;
        if (status) filter.status = status;

        if (search) {
            // Find customers that match the name (also filter by lenderId)
            const customerFilter = {
                $or: [
                    { firstName: new RegExp(search, 'i') },
                    { lastName: new RegExp(search, 'i') },
                ]
            };
            if (req.user && req.user.lenderId) {
                customerFilter.lenderId = req.user.lenderId;
            }
            const matchingCustomers = await Customer.find(customerFilter).select('_id');

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
 * Create new loan with auto-calculated or manual EMI
 */
exports.createLoan = async (req, res, next) => {
    try {
        const {
            customerId,
            principal,
            monthlyInterestRate,
            loanDurationMonths,
            startDate,
            notes,
            interestType = 'simple',
            manualEMI,
            // Per-loan policy overrides (fall back to lender defaults if not provided)
            gracePeriodDays,
            lateFeeType,
            lateFeeValue,
            foreclosurePolicy,
        } = req.body;

        // Verify customer exists
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return next(new AppError('Customer not found', 404));
        }

        // Get lender for prefix
        const lender = await Lender.getLender(req.user?.lenderId);

        console.log('createLoan received:', { manualEMI, interestType, monthlyInterestRate, principal, loanDurationMonths });

        // Use manual EMI if provided, otherwise calculate
        let monthlyEMI;
        if (manualEMI && manualEMI > 0) {
            monthlyEMI = manualEMI;
            console.log('Using manual EMI:', monthlyEMI);
        } else {
            monthlyEMI = interestType === 'compound'
                ? calculateCompoundEMI(principal, monthlyInterestRate, loanDurationMonths)
                : calculateMonthlyEMI(principal, monthlyInterestRate, loanDurationMonths);
            console.log('Calculated EMI:', monthlyEMI);
        }

        // Generate amortization schedule using the EMI (manual or calculated)
        const loanStartDate = new Date(startDate || Date.now());
        const amortizationSchedule = interestType === 'compound'
            ? generateCompoundAmortizationSchedule(principal, monthlyInterestRate, loanDurationMonths, monthlyEMI, loanStartDate)
            : generateAmortizationSchedule(principal, monthlyInterestRate, loanDurationMonths, monthlyEMI, loanStartDate);

        // Calculate totals based on actual EMI
        const totalAmountPayable = monthlyEMI * loanDurationMonths;
        const totalInterestAmount = totalAmountPayable - principal;

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

        // Resolve per-loan policy: use provided overrides, else fall back to lender defaults
        const lenderPolicy = lender.loanPolicy || {};
        const resolvedGracePeriod   = (gracePeriodDays !== undefined) ? Number(gracePeriodDays)  : (lenderPolicy.defaultGracePeriodDays  || 0);
        const resolvedLateFeeType   = lateFeeType   || lenderPolicy.defaultLateFeeType   || 'none';
        const resolvedLateFeeValue  = (lateFeeValue  !== undefined) ? Number(lateFeeValue)   : (lenderPolicy.defaultLateFeeValue   || 0);
        const resolvedForeclosure   = foreclosurePolicy || lenderPolicy.defaultForeclosurePolicy || FORECLOSURE_POLICY.WITHOUT_DISCOUNT;

        const loan = new Loan({
            customerId,
            loanNumber,
            principal,
            monthlyInterestRate,
            loanDurationMonths,
            interestType,
            startDate: loanStartDate,
            endDate,
            monthlyEMI,
            totalAmountPayable,
            totalInterestAmount,
            remainingBalance: totalAmountPayable,
            amortizationSchedule,
            status: LOAN_STATUS.PENDING_APPROVAL,
            notes,
            lenderId: req.user && req.user.lenderId ? req.user.lenderId : undefined,
            // Policy fields
            gracePeriodDays:    resolvedGracePeriod,
            lateFeeType:        resolvedLateFeeType,
            lateFeeValue:       resolvedLateFeeValue,
            foreclosurePolicy:  resolvedForeclosure,
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

        // Generate schedule dynamically based on interest type
        let schedule;
        const startDate = loan.startDate || loan.disbursementDate || loan.createdAt;

        if (loan.interestType === 'compound') {
            schedule = generateCompoundAmortizationSchedule(
                loan.principal,
                loan.monthlyInterestRate,
                loan.loanDurationMonths,
                loan.monthlyEMI,
                startDate
            );
        } else {
            schedule = generateAmortizationSchedule(
                loan.principal,
                loan.monthlyInterestRate,
                loan.loanDurationMonths,
                loan.monthlyEMI,
                startDate
            );
        }

        res.json({
            success: true,
            loanNumber: loan.loanNumber,
            schedule,
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

        const { customerId, principal, monthlyInterestRate, loanDurationMonths, startDate, notes, interestType = 'simple', manualEMI } = req.body;

        // Use manual EMI if provided, otherwise recalculate
        let monthlyEMI;
        if (manualEMI && manualEMI > 0) {
            monthlyEMI = manualEMI;
        } else {
            monthlyEMI = interestType === 'compound'
                ? calculateCompoundEMI(principal, monthlyInterestRate, loanDurationMonths)
                : calculateMonthlyEMI(principal, monthlyInterestRate, loanDurationMonths);
        }

        // Regenerate amortization schedule using the EMI
        const loanStartDate = new Date(startDate || loan.startDate);
        const amortizationSchedule = interestType === 'compound'
            ? generateCompoundAmortizationSchedule(principal, monthlyInterestRate, loanDurationMonths, monthlyEMI, loanStartDate)
            : generateAmortizationSchedule(principal, monthlyInterestRate, loanDurationMonths, monthlyEMI, loanStartDate);

        // Calculate totals based on actual EMI
        const totalAmountPayable = monthlyEMI * loanDurationMonths;
        const totalInterestAmount = totalAmountPayable - principal;

        // Calculate end date
        const endDate = new Date(loanStartDate);
        endDate.setMonth(endDate.getMonth() + loanDurationMonths);

        // Update loan
        loan.customerId = customerId || loan.customerId;
        loan.principal = principal;
        loan.monthlyInterestRate = monthlyInterestRate;
        loan.loanDurationMonths = loanDurationMonths;
        loan.interestType = interestType;
        loan.startDate = loanStartDate;
        loan.endDate = endDate;
        loan.monthlyEMI = monthlyEMI;
        loan.totalAmountPayable = totalAmountPayable;
        loan.totalInterestAmount = totalInterestAmount;
        loan.remainingBalance = totalAmountPayable;
        loan.amortizationSchedule = amortizationSchedule;
        loan.notes = notes;

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
            .populate('customerId', 'firstName lastName email phone address aadhaarNumber panNumber signature photo');

        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        const lender = await Lender.getLender(req.user?.lenderId);

        // Build immutable snapshot if not yet generated (first download)
        if (!loan.agreementSnapshot || !loan.agreementSnapshot.agreementVersion) {
            const snapshot = await buildPolicySnapshot(req.user?.lenderId);
            const existingLoanDocs = await Loan.countDocuments({ lenderId: req.user?.lenderId });
            const agreementVersion = `v${existingLoanDocs}.0`;
            loan.agreementSnapshot = {
                ...snapshot,
                agreementVersion,
                generatedAt: new Date(),
            };
            loan.agreementGeneratedAt = new Date();
            await loan.save();
        }

        const pdfDoc = await generateLoanAgreement(loan, lender, loan.agreementSnapshot);

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
            .populate('customerId', 'firstName lastName email phone address aadhaarNumber panNumber photo');

        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        const lender = await Lender.getLender(req.user?.lenderId);
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
        const {
            discount = 0,
            discountReason,
            remarks,
            paymentMethod = 'CASH',
            bankDetails = {},
        } = req.body;

        const loan = await Loan.findById(req.params.id);
        if (!loan) return next(new AppError('Loan not found', 404));

        if (loan.status !== LOAN_STATUS.ACTIVE) {
            return next(new AppError('Only active loans can be foreclosed', 400));
        }

        const policy = loan.foreclosurePolicy || FORECLOSURE_POLICY.WITHOUT_DISCOUNT;

        // Compute settlement using pure utility (validates policy, discount limits)
        const { settlementAmount, discountApplied, error } = computeForeclosureSettlement(
            loan.remainingBalance,
            policy,
            Number(discount)
        );

        if (error) return next(new AppError(error, 400));

        // Validate discountReason when MANUAL_DISCOUNT
        if (policy === FORECLOSURE_POLICY.MANUAL_DISCOUNT && discountApplied > 0) {
            if (!discountReason || !Object.values(DISCOUNT_REASON).includes(discountReason)) {
                return next(new AppError('A valid discount reason is required for manual discount foreclosure', 400));
            }
        }

        const originalBalance = loan.remainingBalance;

        // Record final settlement payment
        const payment = new Payment({
            loanId: loan._id,
            customerId: loan.customerId,
            paymentNumber: loan.paymentsReceived + 1,
            amountPaid: settlementAmount,
            principalPortion: originalBalance,
            interestPortion: 0,
            balanceAfterPayment: 0,
            paymentDate: new Date(),
            paymentMethod,
            notes: remarks || 'Foreclosure / Early Settlement',
            referenceId: `FORECLOSURE-${loan.loanNumber}`,
            bankDetails,
        });
        await payment.save();

        // Update loan to FORECLOSED
        loan.status = LOAN_STATUS.FORECLOSED;
        loan.completionType = LOAN_COMPLETION_TYPE.FORECLOSED;
        loan.foreclosureDate = new Date();
        loan.foreclosureDiscount = discountApplied;
        loan.foreclosureSettlementAmount = settlementAmount;
        loan.foreclosureRemarks = remarks || 'Foreclosure / Early Settlement';
        loan.foreclosedBy = req.user?.name || req.user?.email || 'Lender';
        if (discountReason) loan.discountReason = discountReason;
        // Legacy settlement fields for backward compat
        loan.settlementBalance = originalBalance;
        loan.settlementAmount = settlementAmount;
        loan.settlementDiscount = discountApplied;
        loan.settlementPaymentMethod = paymentMethod;
        loan.settlementNotes = remarks || 'Foreclosure / Early Settlement';
        loan.settlementDate = new Date();
        loan.settlementBankDetails = bankDetails;
        loan.remainingBalance = 0;
        await loan.save();

        res.json({
            success: true,
            message: 'Loan foreclosed successfully',
            settlementAmount,
            discountApplied,
            loanId: loan._id,
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

        if (![LOAN_STATUS.CLOSED, LOAN_STATUS.COMPLETED, LOAN_STATUS.FORECLOSED].includes(loan.status)) {
            return next(new AppError('NOC can only be generated for closed, completed, or foreclosed loans', 400));
        }

        const lender = await Lender.getLender(req.user?.lenderId);
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

/**
 * Mark loan as COMPLETED (all EMIs paid)
 */
exports.completeLoan = async (req, res, next) => {
    try {
        const loan = await Loan.findById(req.params.id);
        if (!loan) return next(new AppError('Loan not found', 404));

        if (loan.status !== LOAN_STATUS.ACTIVE) {
            return next(new AppError('Only active loans can be marked as completed', 400));
        }

        if (loan.remainingBalance > 0) {
            return next(new AppError('Cannot complete loan — outstanding balance remaining', 400));
        }

        loan.status = LOAN_STATUS.COMPLETED;
        loan.completionType = LOAN_COMPLETION_TYPE.COMPLETED;
        await loan.save();

        res.json({
            success: true,
            message: 'Loan marked as completed',
            loan,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Download Settlement Certificate PDF
 */
exports.downloadSettlementCertificate = async (req, res, next) => {
    try {
        const loan = await Loan.findById(req.params.id)
            .populate('customerId')
            .populate('lenderId');

        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        if (loan.status !== 'closed') {
            return next(new AppError('Settlement certificate is only available for closed loans', 400));
        }

        const lender = loan.lenderId || await Lender.findOne();

        // Get settlement data from loan or construct from history
        const settlementData = {
            originalBalance: loan.settlementBalance || loan.remainingBalance || 0,
            settlementAmount: loan.settlementAmount || 0,
            discount: loan.settlementDiscount || 0,
            paymentMethod: loan.settlementPaymentMethod || 'cash',
            notes: loan.settlementNotes || 'Early settlement',
            bankDetails: loan.settlementBankDetails || {}
        };


        const pdfDoc = await generateSettlementCertificate(loan, lender, settlementData);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Settlement-${loan.loanNumber}.pdf`);

        pdfDoc.pipe(res);
        pdfDoc.end();
    } catch (error) {
        next(error);
    }
};
