const mongoose = require('mongoose');
const Loan = require('../models/Loan');
const Customer = require('../models/Customer');
const Lender = require('../models/Lender');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const { AppError } = require('../middleware/errorHandler');
const { nextDocumentNumber, nextSequence } = require('../utils/sequence');
const {
    PAGINATION,
    LOAN_STATUS,
    LOAN_COMPLETION_TYPE,
    FORECLOSURE_POLICY,
    DISCOUNT_REASON,
    AGREEMENT_TYPE,
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
    generateCustomizedAgreement,
    generateLoanStatement,
    generateLoanClosureNOC,
    generateSettlementCertificate
} = require('../utils/pdfGenerator');
const {
    computeForeclosureSettlement,
    computeLoanStage,
} = require('../utils/loanCalculations');
const { buildPolicySnapshot } = require('./legalController');
const {
    validateCustomAgreementInput,
    calculateTotalRepayment,
    detectMismatch,
    generatePreviewText,
} = require('../utils/customAgreementValidator');
const { lenderIdOf } = require('../utils/tenant');

const ALLOWED_LOAN_SORTS = ['createdAt', '-createdAt', 'loanNumber', '-loanNumber', 'principal', '-principal'];


/**
 * List all loans with pagination and filtering
 */
exports.listLoans = async (req, res, next) => {
    try {
        const lenderId = lenderIdOf(req);
        const {
            page = PAGINATION.DEFAULT_PAGE,
            limit = PAGINATION.DEFAULT_LIMIT,
            customerId,
            status,
            sortBy = '-createdAt',
            search
        } = req.query;

        const safePage = Math.max(1, parseInt(page, 10) || PAGINATION.DEFAULT_PAGE);
        const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT), PAGINATION.MAX_LIMIT);
        const safeSort = ALLOWED_LOAN_SORTS.includes(sortBy) ? sortBy : '-createdAt';

        const filter = { lenderId, isDeleted: { $ne: true } };

        if (customerId) filter.customerId = customerId;
        if (status) filter.status = status;

        if (search) {
            const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escaped, 'i');
            const customerFilter = {
                lenderId,
                $or: [
                    { firstName: regex },
                    { lastName: regex },
                ]
            };
            const matchingCustomers = await Customer.find(customerFilter).select('_id');

            const customerIds = matchingCustomers.map(c => c._id);

            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { loanNumber: regex },
                    { customerId: { $in: customerIds } }
                ]
            });
        }

        const loans = await Loan.find(filter)
            .sort(safeSort)
            .limit(safeLimit)
            .skip((safePage - 1) * safeLimit)
            .populate('customerId', 'firstName lastName email phone');

        const total = await Loan.countDocuments(filter);

        res.json({
            success: true,
            loans,
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
 * Get single loan by ID with full details
 */
exports.getLoan = async (req, res, next) => {
    try {
        const lenderId = lenderIdOf(req);
        const loan = await Loan.findOne({ _id: req.params.id, lenderId, isDeleted: { $ne: true } })
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
        const lenderId = lenderIdOf(req);
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

        // Verify customer exists and belongs to this lender
        const customer = await Customer.findOne({ _id: customerId, lenderId, isDeleted: { $ne: true } });
        if (!customer) {
            return next(new AppError('Customer not found', 404));
        }

        // Get lender for prefix
        const lender = await Lender.getLender(lenderId);

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

        // Generate unique loan number atomically via Counter
        const loanNumber = await nextDocumentNumber(`loan:${lenderId}`, lender.loanPrefix || 'LN');

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
            nextDueDate: amortizationSchedule[0]?.dueDate || null,
            amortizationSchedule,
            status: LOAN_STATUS.PENDING_APPROVAL,
            notes,
            lenderId,
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
        if (error?.code === 11000) {
            return next(new AppError('Duplicate loan number conflict, please retry', 409));
        }
        next(error);
    }
};

/**
 * Approve pending loan
 */
exports.approveLoan = async (req, res, next) => {
    try {
        const lenderId = lenderIdOf(req);
        const loan = await Loan.findOneAndUpdate(
            { _id: req.params.id, lenderId, isDeleted: { $ne: true }, status: LOAN_STATUS.PENDING_APPROVAL },
            { $set: { status: LOAN_STATUS.ACTIVE, approvalDate: new Date() } },
            { new: true }
        );

        if (!loan) {
            const exists = await Loan.exists({ _id: req.params.id, lenderId, isDeleted: { $ne: true } });
            return next(new AppError(exists ? 'Loan is no longer pending approval' : 'Loan not found', exists ? 409 : 404));
        }

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
        const lenderId = lenderIdOf(req);
        const loan = await Loan.findOne({ _id: req.params.id, lenderId });

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
        const lenderId = lenderIdOf(req);
        const loan = await Loan.findOne({ _id: req.params.id, lenderId });

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
        const lenderId = lenderIdOf(req);
        const loan = await Loan.findOne({ _id: req.params.id, lenderId });

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
        const lenderId = lenderIdOf(req);
        const loan = await Loan.findOneAndUpdate(
            { _id: req.params.id, lenderId, isDeleted: { $ne: true }, status: LOAN_STATUS.PENDING_APPROVAL },
            { $set: { status: LOAN_STATUS.CLOSED } },
            { new: true }
        );

        if (!loan) {
            const exists = await Loan.exists({ _id: req.params.id, lenderId, isDeleted: { $ne: true } });
            return next(new AppError(exists ? 'Only pending loans can be cancelled' : 'Loan not found', exists ? 409 : 404));
        }

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
        const lenderId = lenderIdOf(req);
        const loan = await Loan.findOne({ _id: req.params.id, lenderId })
            .populate('customerId', 'firstName lastName email phone address aadhaarNumber panNumber signature photo');

        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        const lender = await Lender.getLender(lenderId);

        // ── ROUTE CUSTOMIZED AGREEMENT (if approved) ──
        if (loan.agreementSnapshot?.agreementType === AGREEMENT_TYPE.CUSTOMIZED && loan.agreementSnapshot?.customAgreementDetails?.approvedAt) {
            const pdfDoc = await generateCustomizedAgreement(loan.agreementSnapshot, lender);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Agreement-${loan.loanNumber}.pdf`);
            pdfDoc.pipe(res);
            pdfDoc.end();
            return;
        }

        // Build immutable snapshot if not yet generated (first download)
        if (!loan.agreementSnapshot || !loan.agreementSnapshot.agreementVersion) {
            const snapshot = await buildPolicySnapshot(lenderId);
            const versionSeq = await nextSequence(`agreement:${lenderId}`);
            const agreementVersion = `v${versionSeq}.0`;
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
        const lenderId = lenderIdOf(req);
        const loan = await Loan.findOne({ _id: req.params.id, lenderId })
            .populate('customerId', 'firstName lastName email phone address aadhaarNumber panNumber photo');

        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        const lender = await Lender.getLender(lenderId);
        const payments = await Payment.find({ loanId: loan._id, lenderId }).sort({ paymentDate: -1 });

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
    const session = await mongoose.startSession();
    try {
        const lenderId = lenderIdOf(req);
        const {
            discount = 0,
            discountReason,
            remarks,
            paymentMethod = 'CASH',
            bankDetails = {},
        } = req.body;
        const idempotencyKey = req.get('Idempotency-Key') || `FORECLOSE-${req.params.id}`;

        let result;
        await session.withTransaction(async () => {
            const loan = await Loan.findOne({
                _id: req.params.id,
                lenderId,
                isDeleted: { $ne: true },
            }).session(session);

            if (!loan) throw new AppError('Loan not found', 404);
            if (loan.status !== LOAN_STATUS.ACTIVE) {
                throw new AppError('Only active loans can be foreclosed', 409);
            }

            const policy = loan.foreclosurePolicy || FORECLOSURE_POLICY.WITHOUT_DISCOUNT;
            const { settlementAmount, discountApplied, error } = computeForeclosureSettlement(
                loan.remainingBalance,
                policy,
                Number(discount)
            );
            if (error) throw new AppError(error, 400);

            if (policy === FORECLOSURE_POLICY.MANUAL_DISCOUNT && discountApplied > 0) {
                if (!discountReason || !Object.values(DISCOUNT_REASON).includes(discountReason)) {
                    throw new AppError('A valid discount reason is required for manual discount foreclosure', 400);
                }
            }

            const originalBalance = loan.remainingBalance;
            const paymentNumber = loan.paymentsReceived + 1;

            await Payment.create([{
                loanId: loan._id,
                customerId: loan.customerId,
                lenderId,
                idempotencyKey,
                paymentNumber,
                amountPaid: settlementAmount,
                principalPortion: originalBalance,
                interestPortion: 0,
                balanceAfterPayment: 0,
                paymentDate: new Date(),
                paymentMethod: paymentMethod ? paymentMethod.toLowerCase() : 'cash',
                notes: remarks || 'Foreclosure / Early Settlement',
                referenceId: `FORECLOSURE-${loan.loanNumber}`,
                bankDetails,
            }], { session });

            loan.status = LOAN_STATUS.FORECLOSED;
            loan.completionType = LOAN_COMPLETION_TYPE.FORECLOSED;
            loan.foreclosureDate = new Date();
            loan.foreclosureDiscount = discountApplied;
            loan.foreclosureSettlementAmount = settlementAmount;
            loan.foreclosureRemarks = remarks || 'Foreclosure / Early Settlement';
            loan.foreclosedBy = req.user?.name || req.user?.email || 'Lender';
            if (discountReason) loan.discountReason = discountReason;
            loan.settlementBalance = originalBalance;
            loan.settlementAmount = settlementAmount;
            loan.settlementDiscount = discountApplied;
            loan.settlementPaymentMethod = paymentMethod;
            loan.settlementNotes = remarks || 'Foreclosure / Early Settlement';
            loan.settlementDate = new Date();
            loan.settlementBankDetails = bankDetails;
            loan.paymentsReceived = paymentNumber;
            loan.remainingBalance = 0;
            loan.nextDueDate = null;
            await loan.save({ session });

            result = { settlementAmount, discountApplied, loanId: loan._id };
        });

        res.json({
            success: true,
            message: 'Loan foreclosed successfully',
            settlementAmount: result.settlementAmount,
            discountApplied: result.discountApplied,
            loanId: result.loanId,
        });
    } catch (error) {
        if (error?.code === 11000) {
            return next(new AppError('Foreclosure already processed or in progress', 409));
        }
        next(error);
    } finally {
        await session.endSession();
    }
};


/**
 * Download No Objection Certificate (NOC)
 */
exports.downloadNOC = async (req, res, next) => {
    try {
        const lenderId = lenderIdOf(req);
        const loan = await Loan.findOne({ _id: req.params.id, lenderId })
            .populate('customerId', 'firstName lastName email phone address aadhaarNumber panNumber');

        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        if (![LOAN_STATUS.CLOSED, LOAN_STATUS.COMPLETED, LOAN_STATUS.FORECLOSED].includes(loan.status)) {
            return next(new AppError('NOC can only be generated for closed, completed, or foreclosed loans', 400));
        }

        const lender = await Lender.getLender(lenderId);
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
        const lenderId = lenderIdOf(req);
        const { status } = req.body;
        const allowedStatuses = [LOAN_STATUS.PENDING_APPROVAL, LOAN_STATUS.APPROVED, LOAN_STATUS.ACTIVE];

        if (!allowedStatuses.includes(status)) {
            return next(new AppError('Invalid status update. Only Pending, Approved, or Active status can be set manually.', 400));
        }

        let loan;
        if (status === LOAN_STATUS.PENDING_APPROVAL) {
            loan = await Loan.findOneAndUpdate(
                { _id: req.params.id, lenderId, isDeleted: { $ne: true }, paymentsReceived: 0 },
                { $set: { status: LOAN_STATUS.PENDING_APPROVAL }, $unset: { approvalDate: 1 } },
                { new: true }
            );
            if (!loan) {
                const exists = await Loan.exists({ _id: req.params.id, lenderId, isDeleted: { $ne: true } });
                return next(new AppError(exists ? 'Cannot revert to Pending: Payments have already been recorded.' : 'Loan not found', exists ? 409 : 404));
            }
        } else {
            loan = await Loan.findOneAndUpdate(
                { _id: req.params.id, lenderId, isDeleted: { $ne: true } },
                [
                    {
                        $set: {
                            status,
                            approvalDate: { $ifNull: ['$approvalDate', new Date()] },
                        },
                    },
                ],
                { new: true }
            );
            if (!loan) {
                return next(new AppError('Loan not found', 404));
            }
        }

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
 * Soft delete loan (rejects when payments exist unless ?cascade=true in a transaction)
 */
exports.deleteLoan = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        const lenderId = lenderIdOf(req);
        const cascade = req.query.cascade === 'true';

        await session.withTransaction(async () => {
            const loan = await Loan.findOne({ _id: req.params.id, lenderId, isDeleted: { $ne: true } }).session(session);
            if (!loan) {
                throw new AppError('Loan not found', 404);
            }

            const paymentCount = await Payment.countDocuments({ loanId: loan._id, lenderId }).session(session);
            if (paymentCount > 0 && !cascade) {
                throw new AppError('Cannot delete loan with recorded payments without explicit cascade', 409);
            }

            loan.isDeleted = true;
            loan.deletedAt = new Date();
            await loan.save({ session });

            if (cascade) {
                await Invoice.updateMany(
                    { loanId: loan._id, lenderId },
                    { $set: { status: 'cancelled' } },
                    { session }
                );
            }
        });

        res.json({
            success: true,
            message: 'Loan deleted successfully',
        });
    } catch (error) {
        next(error);
    } finally {
        await session.endSession();
    }
};

/**
 * Mark loan as COMPLETED (all EMIs paid)
 */
exports.completeLoan = async (req, res, next) => {
    try {
        const lenderId = lenderIdOf(req);
        const loan = await Loan.findOneAndUpdate(
            {
                _id: req.params.id,
                lenderId,
                isDeleted: { $ne: true },
                status: LOAN_STATUS.ACTIVE,
                remainingBalance: { $lte: 0 },
            },
            {
                $set: {
                    status: LOAN_STATUS.COMPLETED,
                    completionType: LOAN_COMPLETION_TYPE.COMPLETED,
                    nextDueDate: null,
                },
            },
            { new: true }
        );

        if (!loan) {
            const existing = await Loan.findOne({ _id: req.params.id, lenderId, isDeleted: { $ne: true } });
            if (!existing) return next(new AppError('Loan not found', 404));
            if (existing.status !== LOAN_STATUS.ACTIVE) {
                return next(new AppError('Only active loans can be marked as completed', 409));
            }
            return next(new AppError('Cannot complete loan — outstanding balance remaining', 409));
        }

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
        const lenderId = lenderIdOf(req);
        const loan = await Loan.findOne({ _id: req.params.id, lenderId })
            .populate('customerId')
            .populate('lenderId');

        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        if (loan.status !== 'closed') {
            return next(new AppError('Settlement certificate is only available for closed loans', 400));
        }

        const lender = loan.lenderId || await Lender.getLender(lenderId);

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

/**
 * Preview Customized Loan Agreement (Deterministic, no DB persistence)
 */
exports.previewCustomAgreement = async (req, res, next) => {
    try {
        const lenderId = lenderIdOf(req);
        const loan = await Loan.findOne({ _id: req.params.id, lenderId })
            .populate('customerId', 'firstName lastName phone');

        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        const { isValid, errors, sanitizedData } = validateCustomAgreementInput(req.body);
        if (!isValid) {
            return next(new AppError(`Validation failed: ${errors.join(', ')}`, 400));
        }

        const warnings = detectMismatch(
            sanitizedData.loanAmount,
            sanitizedData.repaymentAmount,
            sanitizedData.repaymentFrequency,
            sanitizedData.tenureMonths
        );

        const totalRepayment = calculateTotalRepayment(
            sanitizedData.repaymentAmount,
            sanitizedData.repaymentFrequency,
            sanitizedData.tenureMonths
        );

        const previewText = generatePreviewText(sanitizedData, warnings);

        res.json({
            success: true,
            data: {
                previewText,
                warnings,
                totalRepayment,
                sanitizedData,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Approve Customized Loan Agreement (Write-once, immutable snapshot)
 */
exports.approveCustomAgreement = async (req, res, next) => {
    try {
        const lenderId = lenderIdOf(req);
        const loan = await Loan.findOne({ _id: req.params.id, lenderId });
        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }

        // Write-Once Immutability Safeguard:
        // If ANY agreementSnapshot already exists (Standard or Customized), reject with 409 Conflict
        if (loan.agreementSnapshot && (loan.agreementSnapshot.agreementVersion || loan.agreementGeneratedAt)) {
            return next(new AppError('An agreement has already been generated for this loan', 409));
        }

        const { isValid, errors, sanitizedData } = validateCustomAgreementInput(req.body);
        if (!isValid) {
            return next(new AppError(`Validation failed: ${errors.join(', ')}`, 400));
        }

        const warnings = detectMismatch(
            sanitizedData.loanAmount,
            sanitizedData.repaymentAmount,
            sanitizedData.repaymentFrequency,
            sanitizedData.tenureMonths
        );

        const totalRepayment = calculateTotalRepayment(
            sanitizedData.repaymentAmount,
            sanitizedData.repaymentFrequency,
            sanitizedData.tenureMonths
        );

        const previewText = generatePreviewText(sanitizedData, warnings);

        // Build policy snapshot from legal center
        const snapshot = await buildPolicySnapshot(lenderId);
        const versionSeq = await nextSequence(`agreement:${lenderId}`);
        const agreementVersion = `v${versionSeq}.0`;

        loan.agreementSnapshot = {
            ...snapshot,
            agreementType: AGREEMENT_TYPE.CUSTOMIZED,
            agreementVersion,
            snapshotDate: new Date(),
            generatedAt: new Date(),
            customAgreementDetails: {
                ...sanitizedData,
                totalRepayment,
                warnings,
                generatedContent: previewText,
                approvedAt: new Date(),
            },
        };
        loan.agreementGeneratedAt = new Date();

        await loan.save();

        res.json({
            success: true,
            message: 'Customized agreement approved successfully',
            agreementSnapshot: loan.agreementSnapshot,
        });
    } catch (error) {
        next(error);
    }
};

