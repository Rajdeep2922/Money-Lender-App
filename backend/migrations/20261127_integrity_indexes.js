/**
 * Migration: 20261127_integrity_indexes
 *
 * 1. Backfills Invoice.lenderId from the parent Loan using a cursor + bulkWrite.
 * 2. Scans for duplicates across Payment, Invoice, LoanRequest, and Lender before
 *    applying unique indexes. Never deletes financial rows automatically — writes
 *    a duplicate report and aborts if duplicates exist.
 * 3. Syncs indexes across models.
 *
 * Standalone: `node migrations/20261127_integrity_indexes.js`
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Invoice = require('../src/models/Invoice');
const Loan = require('../src/models/Loan');
const Payment = require('../src/models/Payment');
const LoanRequest = require('../src/models/LoanRequest');
const Lender = require('../src/models/Lender');
const Message = require('../src/models/Message');

const REPORT_PATH = path.resolve(__dirname, 'duplicates_report.json');

async function backfillInvoiceLenderId() {
    const cursor = Invoice.find({ lenderId: { $exists: false } })
        .select('_id loanId')
        .lean()
        .cursor();

    let batch = [];
    let totalBackfilled = 0;

    const flushBatch = async (items) => {
        if (items.length === 0) return;
        const loanIds = [...new Set(items.map((i) => String(i.loanId)).filter(Boolean))];
        const loans = await Loan.find({ _id: { $in: loanIds } }).select('_id lenderId').lean();
        const loanMap = new Map(loans.map((l) => [String(l._id), l.lenderId]));

        const ops = [];
        for (const inv of items) {
            const lenderId = loanMap.get(String(inv.loanId));
            if (lenderId) {
                ops.push({
                    updateOne: {
                        filter: { _id: inv._id },
                        update: { $set: { lenderId } },
                    },
                });
            }
        }
        if (ops.length > 0) {
            const res = await Invoice.bulkWrite(ops, { ordered: false });
            totalBackfilled += res.modifiedCount || 0;
        }
    };

    for await (const inv of cursor) {
        batch.push(inv);
        if (batch.length >= 200) {
            await flushBatch(batch);
            batch = [];
        }
    }
    if (batch.length > 0) {
        await flushBatch(batch);
    }

    return totalBackfilled;
}

async function findDuplicates() {
    const [
        dupPayments,
        dupInvoicePeriods,
        dupInvoiceNumbers,
        dupPendingPhoneRequests,
        dupPendingCustomerRequests,
        dupLenderEmails,
    ] = await Promise.all([
        Payment.aggregate([
            { $group: { _id: { loanId: '$loanId', paymentNumber: '$paymentNumber' }, ids: { $push: '$_id' }, n: { $sum: 1 } } },
            { $match: { n: { $gt: 1 } } },
        ]),
        Invoice.aggregate([
            { $match: { 'period.year': { $exists: true } } },
            { $group: { _id: { loanId: '$loanId', year: '$period.year', month: '$period.month' }, ids: { $push: '$_id' }, n: { $sum: 1 } } },
            { $match: { n: { $gt: 1 } } },
        ]),
        Invoice.aggregate([
            { $match: { lenderId: { $exists: true } } },
            { $group: { _id: { lenderId: '$lenderId', invoiceNumber: '$invoiceNumber' }, ids: { $push: '$_id' }, n: { $sum: 1 } } },
            { $match: { n: { $gt: 1 } } },
        ]),
        LoanRequest.aggregate([
            { $match: { status: 'pending', guestPhone: { $type: 'string' } } },
            { $group: { _id: { lenderId: '$lenderId', guestPhone: '$guestPhone' }, ids: { $push: '$_id' }, n: { $sum: 1 } } },
            { $match: { n: { $gt: 1 } } },
        ]),
        LoanRequest.aggregate([
            { $match: { status: 'pending', customerId: { $type: 'objectId' } } },
            { $group: { _id: { lenderId: '$lenderId', customerId: '$customerId' }, ids: { $push: '$_id' }, n: { $sum: 1 } } },
            { $match: { n: { $gt: 1 } } },
        ]),
        Lender.aggregate([
            { $group: { _id: { email: '$email' }, ids: { $push: '$_id' }, n: { $sum: 1 } } },
            { $match: { n: { $gt: 1 } } },
        ]),
    ]);

    const totalDuplicates =
        dupPayments.length +
        dupInvoicePeriods.length +
        dupInvoiceNumbers.length +
        dupPendingPhoneRequests.length +
        dupPendingCustomerRequests.length +
        dupLenderEmails.length;

    return {
        totalDuplicates,
        report: {
            generatedAt: new Date().toISOString(),
            dupPayments,
            dupInvoicePeriods,
            dupInvoiceNumbers,
            dupPendingPhoneRequests,
            dupPendingCustomerRequests,
            dupLenderEmails,
        },
    };
}

async function run() {
    const backfilled = await backfillInvoiceLenderId();
    console.log(`[Migration] Backfilled lenderId on ${backfilled} invoices.`);

    const { totalDuplicates, report } = await findDuplicates();
    if (totalDuplicates > 0) {
        fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
        throw new Error(
            `[Migration] Found ${totalDuplicates} duplicate groups. Report written to ${REPORT_PATH}. Resolve manually before creating unique indexes.`
        );
    }
    console.log('[Migration] Zero duplicates found.');

    const models = [Invoice, Payment, LoanRequest, Message, Loan, Lender];
    const indexResults = {};
    for (const model of models) {
        const synced = await model.syncIndexes();
        indexResults[model.modelName] = synced;
        console.log(`[Migration] Synced indexes for ${model.modelName}:`, synced);
    }

    return {
        backfilled,
        duplicatesFound: totalDuplicates,
        indexResults,
    };
}

if (require.main === module) {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/money_lender_db';
    mongoose
        .connect(mongoUri)
        .then(async () => {
            await run();
            await mongoose.disconnect();
            process.exit(0);
        })
        .catch((err) => {
            console.error(err.message || err);
            process.exit(1);
        });
}

module.exports = run;
