const Customer = require('../models/Customer');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');

/**
 * Helper to convert array of objects to CSV string
 */
const convertToCSV = (data, fields) => {
    const header = fields.join(',');
    const rows = data.map(item => {
        return fields.map(field => {
            let val = field.split('.').reduce((obj, key) => (obj && obj[key] !== 'undefined') ? obj[key] : '', item);
            // Handle dates and escaping commas
            if (val instanceof Date) val = val.toLocaleDateString();
            if (typeof val === 'string') val = `"${val.replace(/"/g, '""')}"`;
            return val;
        }).join(',');
    });
    return [header, ...rows].join('\n');
};

exports.exportCustomers = async (req, res, next) => {
    try {
        const customers = await Customer.find().lean();
        const fields = ['firstName', 'lastName', 'email', 'phone', 'status', 'createdAt'];
        const csv = convertToCSV(customers, fields);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=customers_export.csv');
        res.status(200).send(csv);
    } catch (error) {
        next(error);
    }
};

exports.exportLoans = async (req, res, next) => {
    try {
        const loans = await Loan.find().populate('customerId').lean();
        const data = loans.map(l => ({
            ...l,
            customerName: `${l.customerId?.firstName || ''} ${l.customerId?.lastName || ''}`
        }));
        const fields = ['loanNumber', 'customerName', 'principal', 'interestRate', 'tenure', 'monthlyEMI', 'status', 'remainingBalance', 'startDate'];
        const csv = convertToCSV(data, fields);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=loans_export.csv');
        res.status(200).send(csv);
    } catch (error) {
        next(error);
    }
};

exports.exportPayments = async (req, res, next) => {
    try {
        const payments = await Payment.find().populate('customerId').populate('loanId').lean();
        const data = payments.map(p => ({
            ...p,
            customerName: `${p.customerId?.firstName || ''} ${p.customerId?.lastName || ''}`,
            loanNumber: p.loanId?.loanNumber || ''
        }));
        const fields = ['paymentDate', 'customerName', 'loanNumber', 'amountPaid', 'paymentMethod', 'referenceId', 'notes'];
        const csv = convertToCSV(data, fields);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=payments_export.csv');
        res.status(200).send(csv);
    } catch (error) {
        next(error);
    }
};
