/**
 * Formatting utilities for currency, dates, and other display values
 */

/**
 * Format number as Indian Rupee currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @param {string} format - Format type: 'short', 'long', 'iso'
 * @returns {string} Formatted date string
 */
const formatDate = (date, format = 'short') => {
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
        case 'short':
        default:
            return d.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
    }
};

/**
 * Generate unique document number
 * @param {string} prefix - Document prefix (e.g., 'LN', 'INV', 'CONT')
 * @param {number} count - Current count
 * @returns {string} Generated document number
 */
const generateDocumentNumber = (prefix, count) => {
    const year = new Date().getFullYear();
    const paddedCount = String(count + 1).padStart(4, '0');
    return `${prefix}-${year}-${paddedCount}`;
};

/**
 * Format phone number
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
const formatPhone = (phone) => {
    if (!phone) return '';
    // Remove all non-numeric characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');

    // Format as Indian number if 10 digits
    if (cleaned.length === 10) {
        return `+91-${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }

    return cleaned;
};

/**
 * Calculate percentage
 * @param {number} part - Part value
 * @param {number} total - Total value
 * @returns {number} Percentage (0-100)
 */
const calculatePercentage = (part, total) => {
    if (total === 0) return 0;
    return Math.round((part / total) * 10000) / 100;
};

module.exports = {
    formatCurrency,
    formatDate,
    generateDocumentNumber,
    formatPhone,
    calculatePercentage,
};
