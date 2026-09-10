/**
 * Migration: 20260911_backfill_message_read
 *
 * Backfills legacy documents:
 * - Messages created prior to the `read` field introduction are marked `read: true`.
 * - LoanRequests created prior to `viewedByLender` are marked `viewedByLender: true`.
 *
 * Can be run standalone: `node migrations/20260911_backfill_message_read.js`
 * Or triggered on boot if `process.env.RUN_MIGRATIONS === 'true'`.
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Message = require('../src/models/Message');
const LoanRequest = require('../src/models/LoanRequest');

const runMigration = async () => {
    try {
        console.log('[Migration] Starting backfill for message read status and loan request viewedByLender...');

        const msgResult = await Message.updateMany(
            { read: { $exists: false } },
            { $set: { read: true, readAt: new Date() } }
        );
        console.log(`[Migration] Backfilled ${msgResult.modifiedCount} legacy messages with read: true.`);

        const reqResult = await LoanRequest.updateMany(
            { viewedByLender: { $exists: false } },
            { $set: { viewedByLender: true, viewedAt: new Date() } }
        );
        console.log(`[Migration] Backfilled ${reqResult.modifiedCount} legacy loan requests with viewedByLender: true.`);

        console.log('[Migration] Backfill completed successfully.');
        return { msgModified: msgResult.modifiedCount, reqModified: reqResult.modifiedCount };
    } catch (err) {
        console.error('[Migration] Failed:', err.message);
        throw err;
    }
};

// Standalone execution support
if (require.main === module) {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/money_lender_db';
    mongoose.connect(mongoUri)
        .then(async () => {
            await runMigration();
            await mongoose.disconnect();
            process.exit(0);
        })
        .catch((err) => {
            console.error('[Migration] Connection error:', err.message);
            process.exit(1);
        });
}

module.exports = runMigration;
