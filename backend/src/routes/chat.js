const express = require('express');
const router = express.Router();
const { getMessages } = require('../controllers/chatController');

/**
 * Dual-auth middleware
 * Accepts:
 *   1. Authorization: Bearer <JWT>  — lender or portal customer
 *   2. X-Tracking-Token: <token>    — guest customer (no account)
 */
const protectBoth = async (req, res, next) => {
    const jwt = require('jsonwebtoken');
    const { JWT_SECRET } = require('../middleware/auth');
    const User = require('../models/User');
    const Customer = require('../models/Customer');
    const LoanRequest = require('../models/LoanRequest');

    // ── Mode 1: trackingToken header (guest) ────────────────────────────
    const trackingToken = req.headers['x-tracking-token'];
    if (trackingToken) {
        // Quick existence check — full validation happens inside verifyAcceptedAccess
        const exists = await LoanRequest.exists({ trackingToken });
        if (!exists) {
            return res.status(401).json({ success: false, message: 'Invalid tracking token' });
        }
        req.guestTrackingToken = trackingToken;
        return next();
    }

    // ── Mode 2: JWT Bearer token ─────────────────────────────────────────
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Not authorized. Please login.' });
    }

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

// GET /api/chat/:loanRequestId/messages — message history
router.get('/:loanRequestId/messages', protectBoth, getMessages);

module.exports = router;
