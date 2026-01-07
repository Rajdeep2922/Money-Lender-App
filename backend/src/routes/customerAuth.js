/**
 * Customer Authentication Routes
 * Public routes for customer portal login
 */

const express = require('express');
const router = express.Router();
const { customerLogin, getCustomerProfile } = require('../controllers/customerAuthController');
const { protectCustomer } = require('../middleware/auth');

// Public routes
router.post('/login', customerLogin);

// Protected customer routes
router.get('/me', protectCustomer, getCustomerProfile);

module.exports = router;
