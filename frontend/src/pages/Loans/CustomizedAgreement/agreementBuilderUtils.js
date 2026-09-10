/**
 * Utility helpers for Customized Agreement Builder
 */

export const formatForeclosureLabel = (policy) => {
    switch (policy) {
        case 'NOT_ALLOWED':
            return 'Not Allowed';
        case 'WITHOUT_DISCOUNT':
            return 'Allowed – No Discount';
        case 'MANUAL_DISCOUNT':
            return 'Manual Discount Allowed';
        default:
            return policy || 'Allowed – No Discount';
    }
};

export const buildDefaultsFromLoan = (loan = {}) => {
    const customer = loan.customerId || {};
    const borrowerName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || '';
    const borrowerPhone = customer.phone || '';

    const formatDateForInput = (d) => {
        if (!d) return '';
        try {
            return new Date(d).toISOString().split('T')[0];
        } catch {
            return '';
        }
    };

    // Calculate initial next payment date (typically 1 month after start date)
    const startDateStr = formatDateForInput(loan.startDate || new Date());
    let firstPaymentDateStr = '';
    if (loan.startDate) {
        const fp = new Date(loan.startDate);
        fp.setMonth(fp.getMonth() + 1);
        firstPaymentDateStr = formatDateForInput(fp);
    } else {
        const fp = new Date();
        fp.setMonth(fp.getMonth() + 1);
        firstPaymentDateStr = formatDateForInput(fp);
    }

    return {
        borrowerName,
        borrowerPhone,
        loanAmount: loan.principal || '',
        interestType: loan.interestType === 'compound' ? 'compound' : 'percentage',
        interestRate: loan.monthlyInterestRate || '',
        interestAmount: '',
        interestPeriod: 'monthly',
        tenureValue: loan.loanDurationMonths || 12,
        tenureUnit: 'months',
        repaymentAmount: loan.monthlyEMI || '',
        repaymentFrequency: 'monthly',
        startDate: startDateStr,
        firstPaymentDate: firstPaymentDateStr,
        foreclosurePolicy: loan.foreclosurePolicy || 'WITHOUT_DISCOUNT',
        gracePeriodDays: loan.gracePeriodDays || 0,
        lateFeeType: loan.lateFeeType || 'none',
        lateFeeValue: loan.lateFeeValue || 0,
        additionalAgreedTerms: '',
    };
};

export const deriveClientWarnings = (formData) => {
    const warnings = [];
    const loanAmount = Number(formData.loanAmount);
    const repaymentAmount = Number(formData.repaymentAmount);
    const tenureValue = Number(formData.tenureValue);
    const tenureUnit = formData.tenureUnit || 'months';

    let totalPeriods = tenureValue;
    if (formData.repaymentFrequency === 'weekly') {
        if (tenureUnit === 'months') totalPeriods = Math.round(tenureValue * 4.33);
        else if (tenureUnit === 'years') totalPeriods = tenureValue * 52;
    } else if (formData.repaymentFrequency === 'monthly') {
        if (tenureUnit === 'years') totalPeriods = tenureValue * 12;
    }

    if (loanAmount > 0 && repaymentAmount > 0 && totalPeriods > 0) {
        const totalExpected = Math.round(repaymentAmount * totalPeriods);
        if (totalExpected < loanAmount) {
            warnings.push(
                `Scheduled total repayment (₹${totalExpected.toLocaleString('en-IN')}) is less than the principal loan amount (₹${loanAmount.toLocaleString('en-IN')}).`
            );
        }
    }

    return warnings;
};
