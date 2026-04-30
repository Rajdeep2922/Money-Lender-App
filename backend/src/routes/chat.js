const express = require('express');
const router = express.Router();
const { getMessages } = require('../controllers/chatController');

/**
 * Dual-auth middleware (same as in loanRequests.js)
 * Accepts either lender or customer JWT
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

// GET /api/chat/:loanRequestId/messages — message history (participant + accepted only)
router.get('/:loanRequestId/messages', protectBoth, getMessages);

module.exports = router;
