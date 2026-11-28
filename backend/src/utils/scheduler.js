const cron = require('node-cron');
const Lock = require('../models/Lock');
const Lender = require('../models/Lender');
const { generateMonthlyInvoicesForLender } = require('../controllers/invoiceController');

async function withLock(name, ttlMs, fn) {
    const now = new Date();
    const lock = await Lock.findOneAndUpdate(
        { _id: name, lockedUntil: { $lt: now } },
        { $set: { lockedUntil: new Date(now.getTime() + ttlMs) } },
        { upsert: true, new: true }
    ).catch((e) => {
        if (e.code === 11000) return null;
        throw e;
    });

    if (!lock) return;

    try {
        await fn();
    } finally {
        await Lock.updateOne({ _id: name }, { $set: { lockedUntil: new Date(0) } });
    }
}

/**
 * Initialize all scheduled tasks
 */
const initSchedulers = () => {
    console.log('Initializing System Schedulers...');

    // Daily at Midnight: Generate EMI Invoices per lender under a distributed lock
    cron.schedule('0 0 * * *', async () => {
        console.log(`[${new Date().toISOString()}] Running Daily Invoicing Cycle...`);
        try {
            await withLock('daily-invoicing', 10 * 60 * 1000, async () => {
                const lenders = await Lender.find().select('_id').lean();
                let totalGenerated = 0;
                for (const l of lenders) {
                    totalGenerated += await generateMonthlyInvoicesForLender(l._id);
                }
                console.log(`Invoicing Result: generated ${totalGenerated} invoices across ${lenders.length} lenders`);
            });
        } catch (error) {
            console.error('Invoicing Scheduler Failed:', error);
        }
    });
};

module.exports = initSchedulers;
module.exports.withLock = withLock;
