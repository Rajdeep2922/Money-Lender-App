/**
 * Get currency config from localStorage
 */
const getCurrencyConfig = () => {
    const currency = typeof window !== 'undefined'
        ? localStorage.getItem('currency') || 'INR'
        : 'INR';

    const configs = {
        INR: { locale: 'en-IN', currency: 'INR' },
        USD: { locale: 'en-US', currency: 'USD' },
        EUR: { locale: 'de-DE', currency: 'EUR' },
        GBP: { locale: 'en-GB', currency: 'GBP' },
    };

    return configs[currency] || configs.INR;
};

/**
 * Format number as currency based on user preference
 */
export const formatCurrency = (amount) => {
    const config = getCurrencyConfig();
    return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Format date to readable string
 */
export const formatDate = (date, format = 'short') => {
    if (!date) return '-';
    const d = new Date(date);

    switch (format) {
        case 'long':
            return d.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            });
        case 'iso':
            return d.toISOString().split('T')[0];
        default:
            return d.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
    }
};

/**
 * Format phone number
 */
export const formatPhone = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.length === 10) {
        return `+91-${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }
    return cleaned;
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (part, total) => {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
};

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
    const colors = {
        active: 'badge-success',
        completed: 'badge-success',
        approved: 'badge-info',
        pending_approval: 'badge-warning',
        inactive: 'badge-error',
        defaulted: 'badge-error',
        closed: 'badge-secondary',
    };
    return colors[status] || 'badge-info';
};

/**
 * Format status for display
 */
export const formatStatus = (status) => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '-';
};
