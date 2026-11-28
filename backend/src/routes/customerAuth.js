/**
 * Customer Authentication Routes
 * Public routes for customer portal login
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { customerLogin, getCustomerProfile } = require('../controllers/customerAuthController');
const { protectCustomer } = require('../middleware/auth');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    skipSuccessfulRequests: true,
    message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});

// Public routes
router.post('/login', authLimiter, customerLogin);

// Protected customer routes
router.get('/me', protectCustomer, getCustomerProfile);

module.exports = router;
