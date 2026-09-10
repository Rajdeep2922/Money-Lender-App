jest.mock('../src/utils/calculators', () => ({}));

const mongoose = require('mongoose');
const Loan = require('../src/models/Loan');
const Customer = require('../src/models/Customer');
const Lender = require('../src/models/Lender');
const { AGREEMENT_TYPE } = require('../src/config/constants');
const {
    validateCustomAgreementInput,
    calculateTotalRepayment,
    detectMismatch,
    generatePreviewText,
    sanitizeText,
} = require('../src/utils/customAgreementValidator');
const loanController = require('../src/controllers/loanController');
const { generateCustomizedAgreement } = require('../src/utils/pdfGenerator');

describe('Customized Agreement Unit & Immutability Tests', () => {
    describe('customAgreementValidator', () => {
        test('validates required fields properly', () => {
            const result = validateCustomAgreementInput({});
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        test('validates and sanitizes valid input', () => {
            const input = {
                borrowerName: 'John Doe <script>alert(1)</script>',
                borrowerPhone: '9876543210',
                loanAmount: 50000,
                interestType: 'percentage',
                interestRate: 2,
                tenureValue: 12,
                tenureUnit: 'months',
                repaymentAmount: 4500,
                repaymentFrequency: 'monthly',
                startDate: '2026-09-01',
                firstPaymentDate: '2026-10-01',
                foreclosurePolicy: 'WITHOUT_DISCOUNT',
                additionalAgreedTerms: '<b>Prompt payment</b> required.',
            };

            const result = validateCustomAgreementInput(input);
            expect(result.isValid).toBe(true);
            expect(result.sanitizedData.borrowerName).toBe('John Doe');
            expect(result.sanitizedData.additionalAgreedTerms).toBe('Prompt payment required.');
            expect(result.sanitizedData.loanAmount).toBe(50000);
        });

        test('rejects negative numbers and zero tenure', () => {
            const input = {
                borrowerName: 'Jane Doe',
                borrowerPhone: '9876543210',
                loanAmount: -5000,
                interestType: 'percentage',
                tenureValue: 0,
                repaymentAmount: -100,
                repaymentFrequency: 'monthly',
                startDate: '2026-09-01',
                firstPaymentDate: '2026-10-01',
                foreclosurePolicy: 'NOT_ALLOWED',
            };

            const result = validateCustomAgreementInput(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toEqual(
                expect.arrayContaining([
                    'Loan amount must be a positive number',
                    'Tenure must be a positive number greater than 0',
                    'Repayment amount must be a positive number',
                ])
            );
        });

        test('rejects additionalAgreedTerms exceeding 5000 characters', () => {
            const longText = 'a'.repeat(5001);
            const input = {
                borrowerName: 'Jane Doe',
                borrowerPhone: '9876543210',
                loanAmount: 50000,
                interestType: 'percentage',
                tenureValue: 12,
                repaymentAmount: 5000,
                repaymentFrequency: 'monthly',
                startDate: '2026-09-01',
                firstPaymentDate: '2026-10-01',
                foreclosurePolicy: 'NOT_ALLOWED',
                additionalAgreedTerms: longText,
            };

            const result = validateCustomAgreementInput(input);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Additional agreed terms must not exceed 5000 characters');
        });

        test('detectMismatch warns when total repayment is less than principal', () => {
            // loanAmount = 100,000, repayment = 5,000 for 12 months = 60,000 (< 100,000)
            const warnings = detectMismatch(100000, 5000, 'monthly', 12);
            expect(warnings.length).toBe(1);
            expect(warnings[0]).toContain('less than the principal loan amount');
        });

        test('detectMismatch produces no warnings when total repayment is greater or equal', () => {
            const warnings = detectMismatch(50000, 5000, 'monthly', 12);
            expect(warnings.length).toBe(0);
        });
    });

    describe('Write-Once Immutability Safeguard', () => {
        let lender;
        let customer;
        let loan;

        beforeEach(async () => {
            lender = await Lender.create({
                businessName: 'Test Lender Finance',
                ownerName: 'John Owner',
                email: 'lender@test.com',
                password: 'Password123!',
                phone: '9998887776',
            });

            customer = await Customer.create({
                firstName: 'Alice',
                lastName: 'Smith',
                email: 'alice@test.com',
                phone: '9876543211',
                lenderId: lender._id,
            });

            loan = await Loan.create({
                customerId: customer._id,
                lenderId: lender._id,
                loanNumber: 'LN-TEST-001',
                principal: 50000,
                monthlyInterestRate: 2,
                loanDurationMonths: 12,
                startDate: new Date(),
                monthlyEMI: 4500,
                totalAmountPayable: 54000,
                totalInterestAmount: 4000,
                remainingBalance: 54000,
                status: 'active',
            });
        });

        test('rejects approveCustomAgreement with 409 if a Standard Agreement snapshot already exists', async () => {
            // Simulate that a Standard Agreement has already been downloaded/generated
            loan.agreementSnapshot = {
                agreementType: AGREEMENT_TYPE.STANDARD,
                agreementVersion: 'v1.0',
                termsVersion: 'v1.0',
                generatedAt: new Date(),
            };
            loan.agreementGeneratedAt = new Date();
            await loan.save();

            const req = {
                params: { id: loan._id.toString() },
                user: { lenderId: lender._id.toString() },
                body: {
                    borrowerName: 'Alice Smith',
                    borrowerPhone: '9876543211',
                    loanAmount: 50000,
                    interestType: 'percentage',
                    tenureValue: 12,
                    repaymentAmount: 4500,
                    repaymentFrequency: 'monthly',
                    startDate: '2026-09-01',
                    firstPaymentDate: '2026-10-01',
                    foreclosurePolicy: 'WITHOUT_DISCOUNT',
                },
            };

            let capturedError = null;
            const next = (err) => {
                capturedError = err;
            };
            const res = {
                json: jest.fn(),
            };

            await loanController.approveCustomAgreement(req, res, next);

            expect(capturedError).not.toBeNull();
            expect(capturedError.statusCode).toBe(409);
            expect(capturedError.message).toBe('An agreement has already been generated for this loan');

            // Verify the original snapshot was NOT overwritten
            const reloadedLoan = await Loan.findById(loan._id);
            expect(reloadedLoan.agreementSnapshot.agreementType).toBe(AGREEMENT_TYPE.STANDARD);
            expect(reloadedLoan.agreementSnapshot.customAgreementDetails).toBeNull();
        });

        test('rejects approveCustomAgreement with 409 if a Customized Agreement snapshot already exists', async () => {
            // First approval succeeds
            const validPayload = {
                borrowerName: 'Alice Smith',
                borrowerPhone: '9876543211',
                loanAmount: 50000,
                interestType: 'percentage',
                tenureValue: 12,
                repaymentAmount: 4500,
                repaymentFrequency: 'monthly',
                startDate: '2026-09-01',
                firstPaymentDate: '2026-10-01',
                foreclosurePolicy: 'WITHOUT_DISCOUNT',
            };

            const req1 = {
                params: { id: loan._id.toString() },
                user: { lenderId: lender._id.toString() },
                body: validPayload,
            };
            const res1 = {
                json: jest.fn(),
            };
            const next1 = jest.fn();

            await loanController.approveCustomAgreement(req1, res1, next1);
            expect(res1.json).toHaveBeenCalled();
            const reloaded1 = await Loan.findById(loan._id);
            expect(reloaded1.agreementSnapshot.agreementType).toBe(AGREEMENT_TYPE.CUSTOMIZED);
            expect(reloaded1.agreementSnapshot.customAgreementDetails.borrowerName).toBe('Alice Smith');

            // Second approval attempt MUST fail with 409 Conflict
            const req2 = {
                params: { id: loan._id.toString() },
                user: { lenderId: lender._id.toString() },
                body: {
                    ...validPayload,
                    borrowerName: 'Attempt To Overwrite Name',
                },
            };
            let capturedError2 = null;
            const next2 = (err) => {
                capturedError2 = err;
            };
            const res2 = {
                json: jest.fn(),
            };

            await loanController.approveCustomAgreement(req2, res2, next2);

            expect(capturedError2).not.toBeNull();
            expect(capturedError2.statusCode).toBe(409);
            expect(capturedError2.message).toBe('An agreement has already been generated for this loan');

            // Verify unchanged in DB
            const reloaded2 = await Loan.findById(loan._id);
            expect(reloaded2.agreementSnapshot.customAgreementDetails.borrowerName).toBe('Alice Smith');
        });

        test('previewCustomAgreement does not persist to database', async () => {
            const req = {
                params: { id: loan._id.toString() },
                body: {
                    borrowerName: 'Alice Smith',
                    borrowerPhone: '9876543211',
                    loanAmount: 50000,
                    interestType: 'percentage',
                    tenureValue: 12,
                    repaymentAmount: 4500,
                    repaymentFrequency: 'monthly',
                    startDate: '2026-09-01',
                    firstPaymentDate: '2026-10-01',
                    foreclosurePolicy: 'WITHOUT_DISCOUNT',
                },
            };
            const res = {
                json: jest.fn(),
            };
            const next = jest.fn();

            await loanController.previewCustomAgreement(req, res, next);

            expect(res.json).toHaveBeenCalled();
            const responseData = res.json.mock.calls[0][0];
            expect(responseData.success).toBe(true);
            expect(responseData.data.previewText).toContain('PERSONAL LOAN AGREEMENT');

            // Check loan in DB remains unmodified
            const checkLoan = await Loan.findById(loan._id);
            expect(checkLoan.agreementSnapshot).toBeNull();
            expect(checkLoan.agreementGeneratedAt).toBeUndefined();
        });
    });

    describe('generateCustomizedAgreement PDF generation', () => {
        test('creates PDF doc stream without throwing', async () => {
            const snapshot = {
                agreementType: AGREEMENT_TYPE.CUSTOMIZED,
                agreementVersion: 'v1.0',
                generatedAt: new Date(),
                customAgreementDetails: {
                    borrowerName: 'Bob Builder',
                    borrowerPhone: '9876543210',
                    loanAmount: 75000,
                    interestType: 'simple',
                    interestRate: 1.5,
                    interestPeriod: 'monthly',
                    tenureValue: 10,
                    tenureUnit: 'months',
                    repaymentAmount: 8500,
                    repaymentFrequency: 'monthly',
                    startDate: new Date(),
                    firstPaymentDate: new Date(),
                    foreclosurePolicy: 'WITHOUT_DISCOUNT',
                    additionalAgreedTerms: 'Borrower shall provide advance checks.',
                    approvedAt: new Date(),
                },
            };

            const lender = {
                businessName: 'Apex Capital',
                phone: '011-2345678',
                email: 'contact@apexcapital.com',
            };

            const pdfDoc = await generateCustomizedAgreement(snapshot, lender);
            expect(pdfDoc).toBeDefined();
            expect(typeof pdfDoc.pipe).toBe('function');
        });
    });
});
