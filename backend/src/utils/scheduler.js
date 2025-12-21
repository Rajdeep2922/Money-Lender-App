const cron = require('node-cron');
const invoiceController = require('../controllers/invoiceController');

/**
 * Initialize all scheduled tasks
 */
const initSchedulers = () => {
    console.log('Initializing System Schedulers...');

    // Daily at Midnight: Generate EMI Invoices for upcoming month
    // Syntax: minute hour day month day-of-week
    cron.schedule('0 0 * * *', async () => {
        console.log(`[${new Date().toISOString()}] Running Daily Invoicing Cycle...`);
        try {
            // Mocking req/res/next for internal controller call
            const mockReq = { query: {} };
            const mockRes = { json: (data) => console.log('Invoicing Result:', data) };
            const next = (err) => err && console.error('Scheduler Error:', err);

            await invoiceController.generateMonthlyInvoices(mockReq, mockRes, next);
        } catch (error) {
            console.error('Invoicing Scheduler Failed:', error);
        }
    });

    // You can add more cleanup tasks here (e.g., clearing old temp files)
};

module.exports = initSchedulers;
