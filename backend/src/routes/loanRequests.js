const express = require('express');
const router = express.Router();
const {
    createLoanRequest,
    getLoanRequests,
    getLoanRequestById,
    respondToLoanRequest,
} = require('../controllers/loanRequestController');
const { protect, protectCustomer } = require('../middleware/auth');

/**
 * Dual-auth middleware: accepts either a lender token or a customer token.
 * Attaches req.user (lender) or req.customer (customer).
 */
const protectBoth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Not authorized. Please login.' });
    }

    const jwt = require('jsonwebtoken');
    const { JWT_SECRET } = require('../middleware/auth');
    const User = require('../models/User');
    const Customer = require('../models/Customer');

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.role === 'lender') {
            const user = await User.findById(decoded.id).populate('lenderId');
            if (!user || !user.isActive) {
                return res.status(401).json({ success: false, message: 'User not found or inactive' });
            }
            req.user = user;
            return next();
        } else if (decoded.role === 'customer') {
            const customer = await Customer.findById(decoded.id);
            if (!customer || customer.isDeleted || !customer.isPortalActive) {
                return res.status(401).json({ success: false, message: 'Customer not authorized' });
            }
            req.customer = customer;
            return next();
        } else {
            return res.status(401).json({ success: false, message: 'Unknown role' });
        }
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token invalid or expired' });
    }
};

// POST /api/loan-request — customer creates a request
router.post('/', protectCustomer, createLoanRequest);

// GET /api/loan-request — list (customer: own | lender: incoming)
router.get('/', protectBoth, getLoanRequests);

// GET /api/loan-request/:id — single request (participant only)
router.get('/:id', protectBoth, getLoanRequestById);

// POST /api/loan-request/:id/respond — lender accepts/rejects
router.post('/:id/respond', protect, respondToLoanRequest);

module.exports = router;
