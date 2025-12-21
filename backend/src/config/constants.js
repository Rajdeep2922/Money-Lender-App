module.exports = {
    // Loan status options
    LOAN_STATUS: {
        PENDING_APPROVAL: 'pending_approval',
        APPROVED: 'approved',
        ACTIVE: 'active',
        COMPLETED: 'completed',
        DEFAULTED: 'defaulted',
        CLOSED: 'closed',
    },

    // Customer status options
    CUSTOMER_STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        SUSPENDED: 'suspended',
    },

    // Payment methods
    PAYMENT_METHODS: {
        CASH: 'cash',
        BANK_TRANSFER: 'bank_transfer',
        UPI: 'upi',
        CHEQUE: 'cheque',
        OTHER: 'other',
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

    // Pagination defaults
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 100,
    },
};
