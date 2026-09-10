module.exports = {
    // Loan status options
    LOAN_STATUS: {
        PENDING_APPROVAL: 'pending_approval',
        APPROVED: 'approved',
        ACTIVE: 'active',
        COMPLETED: 'completed',
        DEFAULTED: 'defaulted',
        CLOSED: 'closed',
        FORECLOSED: 'foreclosed',
        CANCELLED: 'cancelled',
    },

    LOAN_COMPLETION_TYPE: {
        COMPLETED: 'completed',
        FORECLOSED: 'foreclosed',
    },

    FORECLOSURE_POLICY: {
        NOT_ALLOWED: 'NOT_ALLOWED',
        WITHOUT_DISCOUNT: 'WITHOUT_DISCOUNT',
        MANUAL_DISCOUNT: 'MANUAL_DISCOUNT',
    },

    LATE_FEE_TYPE: {
        NONE: 'none',
        FIXED: 'fixed',
        PERCENTAGE: 'percentage',
    },

    INTEREST_CALC_TYPE: {
        SIMPLE: 'SIMPLE',
        FLAT: 'FLAT',
        REDUCING_BALANCE: 'REDUCING_BALANCE',
    },

    LOAN_STAGE: {
        UPCOMING: 'upcoming',
        DUE_TODAY: 'due_today',
        GRACE: 'grace',
        OVERDUE: 'overdue',
        DEFAULT: 'default',
    },

    LEGAL_POLICY_TYPE: {
        TERMS: 'terms',
        LOAN_AGREEMENT: 'loanAgreement',
        INTEREST: 'interest',
        EMI_PAYMENT: 'emiPayment',
        FORECLOSURE: 'foreclosure',
        DEFAULT_OVERDUE: 'defaultOverdue',
        PRIVACY: 'privacy',
        CONTACT: 'contact',
    },

    DISCOUNT_REASON: {
        MANUAL: 'Manual',
        LOYAL_CUSTOMER: 'Loyal Customer',
        MEDICAL_EMERGENCY: 'Medical Emergency',
        FESTIVAL_OFFER: 'Festival Offer',
        OTHER: 'Other',
    },

    // Customer status options
    CUSTOMER_STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        SUSPENDED: 'suspended',
    },

    // Payment methods
    PAYMENT_METHODS: {
        CASH: 'CASH',
        BANK_TRANSFER: 'BANK_TRANSFER',
        UPI: 'UPI',
        CHEQUE: 'CHEQUE',
        IMPS: 'IMPS',
        NEFT: 'NEFT',
        OTHER: 'OTHER',
    },

    // Invoice types
    INVOICE_TYPES: {
        EMI_RECEIPT: 'emi_receipt',
        MONTHLY_STATEMENT: 'monthly_statement',
        INTERIM_STATEMENT: 'interim_statement',
    },

    // Invoice status
    INVOICE_STATUS: {
        PENDING: 'pending',
        ISSUED: 'issued',
        PAID: 'paid',
        OVERDUE: 'overdue',
        CANCELLED: 'cancelled',
    },

    // Contract types
    CONTRACT_TYPES: {
        LOAN_AGREEMENT: 'loan_agreement',
        AMENDMENT: 'amendment',
        SETTLEMENT: 'settlement',
    },

    // Contract status
    CONTRACT_STATUS: {
        DRAFT: 'draft',
        AWAITING_SIGNATURE: 'awaiting_signature',
        SIGNED: 'signed',
        EXECUTED: 'executed',
        ARCHIVED: 'archived',
    },

    // Agreement types
    AGREEMENT_TYPE: {
        STANDARD: 'STANDARD',
        CUSTOMIZED: 'CUSTOMIZED',
    },

    CUSTOM_INTEREST_TYPE: {
        FIXED_AMOUNT: 'fixed_amount',
        PERCENTAGE: 'percentage',
        SIMPLE: 'simple',
        OTHER: 'other',
    },

    CUSTOM_REPAYMENT_FREQUENCY: {
        MONTHLY: 'monthly',
        WEEKLY: 'weekly',
        OTHER: 'other',
    },

    INTEREST_PERIOD: {
        MONTHLY: 'monthly',
        YEARLY: 'yearly',
        ONE_TIME: 'one_time',
        OTHER: 'other',
    },

    // Pagination defaults
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 100,
    },
};

