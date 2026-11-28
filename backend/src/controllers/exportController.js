const Customer = require('../models/Customer');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const { lenderIdOf } = require('../utils/tenant');

/**
 * Escape CSV cell to prevent formula injection and properly quote special characters
 */
const escapeCsvCell = (raw) => {
    if (raw === null || raw === undefined) return '';
    let str = raw instanceof Date ? raw.toISOString().split('T')[0] : String(raw);
    if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
    }
    if (/[",\n\r]/.test(str)) {
        str = `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

const toCsvRow = (doc, fields) => {
    return (
        fields
            .map((field) => {
                const val = field
                    .split('.')
                    .reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : ''), doc);
                return escapeCsvCell(val);
            })
            .join(',') + '\n'
    );
};

async function streamCursorToCsv(res, filename, cursor, fields) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.write(fields.join(',') + '\n');

    for await (const doc of cursor) {
        if (!res.write(toCsvRow(doc, fields))) {
            await new Promise((resolve) => res.once('drain', resolve));
        }
    }
    res.end();
}

exports.exportCustomers = async (req, res, next) => {
    try {
        const lenderId = lenderIdOf(req);
        const fields = ['firstName', 'lastName', 'email', 'phone', 'status', 'createdAt'];
        const cursor = Customer.find({ lenderId, isDeleted: { $ne: true } })
            .select(fields.join(' '))
            .lean()
            .cursor();

        await streamCursorToCsv(res, 'customers_export.csv', cursor, fields);
    } catch (error) {
        next(error);
    }
};

exports.exportLoans = async (req, res, next) => {
    try {
        const lenderId = lenderIdOf(req);
        const fields = [
            'loanNumber',
            'customerId',
            'principal',
            'interestRate',
            'tenure',
            'monthlyEMI',
            'status',
            'remainingBalance',
            'startDate',
        ];
        const cursor = Loan.find({ lenderId, isDeleted: { $ne: true } })
            .select('loanNumber customerId principal monthlyInterestRate loanDurationMonths monthlyEMI status remainingBalance startDate')
            .lean()
            .cursor();

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=loans_export.csv');
        res.write(fields.join(',') + '\n');

        for await (const doc of cursor) {
            const mapped = {
                loanNumber: doc.loanNumber,
                customerId: doc.customerId ? String(doc.customerId) : '',
                principal: doc.principal,
                interestRate: doc.monthlyInterestRate,
                tenure: doc.loanDurationMonths,
                monthlyEMI: doc.monthlyEMI,
                status: doc.status,
                remainingBalance: doc.remainingBalance,
                startDate: doc.startDate,
            };
            if (!res.write(toCsvRow(mapped, fields))) {
                await new Promise((resolve) => res.once('drain', resolve));
            }
        }
        res.end();
    } catch (error) {
        next(error);
    }
};

exports.exportPayments = async (req, res, next) => {
    try {
        const lenderId = lenderIdOf(req);
        const fields = ['paymentDate', 'customerId', 'loanId', 'amountPaid', 'paymentMethod', 'referenceId', 'notes'];
        const cursor = Payment.find({ lenderId })
            .select(fields.join(' '))
            .lean()
            .cursor();

        await streamCursorToCsv(res, 'payments_export.csv', cursor, fields);
    } catch (error) {
        next(error);
    }
};
