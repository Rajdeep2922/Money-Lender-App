/**
 * Deterministic validation and calculation utilities for Customized Agreements.
 * Zero database access. Zero external APIs / AI.
 */

const sanitizeText = (text) => {
    if (!text || typeof text !== 'string') return '';
    // Strip HTML and script tags
    return text
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .trim();
};

const isValidDate = (dateVal) => {
    if (!dateVal) return false;
    const d = new Date(dateVal);
    return d instanceof Date && !isNaN(d.getTime());
};

const isPositiveNumber = (num) => {
    return typeof num === 'number' && !isNaN(num) && isFinite(num) && num > 0;
};

const isNonNegativeNumber = (num) => {
    return typeof num === 'number' && !isNaN(num) && isFinite(num) && num >= 0;
};

/**
 * Validate customized agreement input fields
 */
const validateCustomAgreementInput = (data = {}) => {
    const errors = [];

    // Required borrower information
    if (!data.borrowerName || typeof data.borrowerName !== 'string' || !data.borrowerName.trim()) {
        errors.push('Borrower name is required');
    }
    if (!data.borrowerPhone || typeof data.borrowerPhone !== 'string' || !data.borrowerPhone.trim()) {
        errors.push('Borrower phone number is required');
    }

    // Required loan terms
    const loanAmount = Number(data.loanAmount);
    if (!isPositiveNumber(loanAmount)) {
        errors.push('Loan amount must be a positive number');
    }

    if (!data.interestType || typeof data.interestType !== 'string') {
        errors.push('Interest type is required');
    }

    const tenureValue = Number(data.tenureValue);
    if (!isPositiveNumber(tenureValue)) {
        errors.push('Tenure must be a positive number greater than 0');
    }

    const repaymentAmount = Number(data.repaymentAmount);
    if (!isPositiveNumber(repaymentAmount)) {
        errors.push('Repayment amount must be a positive number');
    }

    if (!data.repaymentFrequency || typeof data.repaymentFrequency !== 'string') {
        errors.push('Repayment frequency is required');
    }

    if (!isValidDate(data.startDate)) {
        errors.push('Valid start date is required');
    }

    if (!isValidDate(data.firstPaymentDate)) {
        errors.push('Valid first payment date is required');
    }

    if (!data.foreclosurePolicy || typeof data.foreclosurePolicy !== 'string') {
        errors.push('Foreclosure policy is required');
    }

    // Additional agreed terms length & sanitization
    let additionalAgreedTerms = '';
    if (data.additionalAgreedTerms) {
        if (typeof data.additionalAgreedTerms !== 'string') {
            errors.push('Additional agreed terms must be text');
        } else if (data.additionalAgreedTerms.length > 5000) {
            errors.push('Additional agreed terms must not exceed 5000 characters');
        } else {
            additionalAgreedTerms = sanitizeText(data.additionalAgreedTerms);
        }
    }

    // Optional interest rates/amounts
    const interestRate = data.interestRate !== undefined && data.interestRate !== null && data.interestRate !== ''
        ? Number(data.interestRate)
        : undefined;
    if (interestRate !== undefined && !isNonNegativeNumber(interestRate)) {
        errors.push('Interest rate cannot be negative');
    }

    const interestAmount = data.interestAmount !== undefined && data.interestAmount !== null && data.interestAmount !== ''
        ? Number(data.interestAmount)
        : undefined;
    if (interestAmount !== undefined && !isNonNegativeNumber(interestAmount)) {
        errors.push('Interest amount cannot be negative');
    }

    const gracePeriodDays = data.gracePeriodDays !== undefined ? Number(data.gracePeriodDays) : 0;
    if (!isNonNegativeNumber(gracePeriodDays)) {
        errors.push('Grace period days cannot be negative');
    }

    const lateFeeValue = data.lateFeeValue !== undefined ? Number(data.lateFeeValue) : 0;
    if (!isNonNegativeNumber(lateFeeValue)) {
        errors.push('Late fee value cannot be negative');
    }

    // Standardize tenure in months for calculations
    const tenureUnit = data.tenureUnit || 'months';
    let tenureMonths = tenureValue;
    if (tenureUnit === 'years') {
        tenureMonths = tenureValue * 12;
    } else if (tenureUnit === 'weeks') {
        tenureMonths = Math.round((tenureValue / 4.33) * 10) / 10;
    } else if (tenureUnit === 'days') {
        tenureMonths = Math.round((tenureValue / 30) * 10) / 10;
    }

    const sanitizedData = {
        borrowerName: sanitizeText(data.borrowerName),
        borrowerPhone: sanitizeText(data.borrowerPhone),
        loanAmount,
        interestType: data.interestType,
        interestRate,
        interestAmount,
        interestPeriod: data.interestPeriod || 'monthly',
        tenureValue,
        tenureUnit,
        tenureMonths,
        repaymentAmount,
        repaymentFrequency: data.repaymentFrequency,
        startDate: new Date(data.startDate),
        firstPaymentDate: new Date(data.firstPaymentDate),
        foreclosurePolicy: data.foreclosurePolicy,
        gracePeriodDays,
        lateFeeType: data.lateFeeType || 'none',
        lateFeeValue,
        additionalAgreedTerms,
    };

    return {
        isValid: errors.length === 0,
        errors,
        sanitizedData,
    };
};

/**
 * Calculate expected total repayment based on schedule
 */
const calculateTotalRepayment = (repaymentAmount, frequency, tenureMonths) => {
    if (!repaymentAmount || !tenureMonths) return null;
    const freq = String(frequency).toLowerCase();
    if (freq === 'monthly') {
        return Math.round(repaymentAmount * tenureMonths);
    }
    if (freq === 'weekly') {
        const weeks = Math.round(tenureMonths * 4.33);
        return Math.round(repaymentAmount * weeks);
    }
    return null;
};

/**
 * Detect mathematical discrepancies and produce informational warnings
 */
const detectMismatch = (loanAmount, repaymentAmount, frequency, tenureMonths) => {
    const warnings = [];
    const totalRepayment = calculateTotalRepayment(repaymentAmount, frequency, tenureMonths);

    if (totalRepayment !== null && loanAmount > 0) {
        if (totalRepayment < loanAmount) {
            warnings.push(
                `Scheduled total repayment (${totalRepayment}) is less than the principal loan amount (${loanAmount}). Please verify repayment amount or tenure.`
            );
        }
    }

    return warnings;
};

/**
 * Generate preview document text representation
 */
const generatePreviewText = (data, warnings = []) => {
    const lines = [
        '========================================',
        '       PERSONAL LOAN AGREEMENT          ',
        '========================================',
        '',
        `Borrower: ${data.borrowerName} (${data.borrowerPhone})`,
        `Principal Loan Amount: INR ${Number(data.loanAmount).toLocaleString('en-IN')}`,
        `Interest Type: ${data.interestType} ${data.interestRate ? `@ ${data.interestRate}%` : ''} ${data.interestAmount ? `(INR ${data.interestAmount})` : ''}`,
        `Tenure: ${data.tenureValue} ${data.tenureUnit || 'months'}`,
        `Repayment Amount: INR ${Number(data.repaymentAmount).toLocaleString('en-IN')} (${data.repaymentFrequency})`,
        `Start Date: ${new Date(data.startDate).toLocaleDateString('en-IN')}`,
        `First Payment Date: ${new Date(data.firstPaymentDate).toLocaleDateString('en-IN')}`,
        `Foreclosure Policy: ${data.foreclosurePolicy}`,
        `Grace Period: ${data.gracePeriodDays || 0} days`,
        `Late Fee: ${data.lateFeeType || 'none'} ${data.lateFeeValue ? `(INR ${data.lateFeeValue})` : ''}`,
        '',
        'ADDITIONAL AGREED TERMS:',
        data.additionalAgreedTerms ? data.additionalAgreedTerms : 'None specified.',
        '',
        'KEY LEGAL TERMS:',
        '1. The borrower agrees to repay the loan in accordance with the specified schedule.',
        '2. Default in timely payments may incur late charges and legal recourse as permitted by law.',
        '3. Foreclosure and early settlement terms are governed strictly as specified in this agreement.',
        '4. All standard institutional policies, dispute resolution terms, and lender rights remain fully binding.',
        '',
        'BORROWER DECLARATION:',
        'I confirm that I have read, understood, and agreed to all the terms, repayment obligations, and legal policies outlined in this agreement.',
    ];

    if (warnings.length > 0) {
        lines.unshift('WARNINGS DETECTED:\n' + warnings.map(w => `- ${w}`).join('\n') + '\n');
    }

    return lines.join('\n');
};

module.exports = {
    sanitizeText,
    validateCustomAgreementInput,
    calculateTotalRepayment,
    detectMismatch,
    generatePreviewText,
};
