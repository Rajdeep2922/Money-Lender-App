/**
 * Customer Portal Routes
 * Protected routes for customer portal access - all read-only
 */

const express = require('express');
const router = express.Router();
const {
    getMyLoans,
    getLoanDetails,
    getMyPayments,
    getLoanSchedule,
} = require('../controllers/customerPortalController');
const { protectCustomer } = require('../middleware/auth');

// All routes require customer authentication
router.use(protectCustomer);

// Loan routes
router.get('/loans', getMyLoans);
router.get('/loans/:id', getLoanDetails);
router.get('/loans/:id/schedule', getLoanSchedule);

// Payment routes
router.get('/payments', getMyPayments);

module.exports = router;
