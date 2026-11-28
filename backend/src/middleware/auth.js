const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be set to at least 32 characters');
}
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token for user (lender)
 */
const generateToken = (userId, tokenVersion = 0) => {
    return jwt.sign({ id: userId, role: 'lender', tokenVersion }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

/**
 * Generate JWT token for customer (portal access)
 */
const generateCustomerToken = (customerId, tokenVersion = 0) => {
    return jwt.sign({ id: customerId, role: 'customer', tokenVersion }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

/**
 * Protect routes - verify JWT token (for lenders/users)
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. Please login.',
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);

            if (decoded.role !== 'lender') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token type.',
                });
            }

            // Get user from token
            const user = await User.findById(decoded.id).populate('lenderId');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found. Please login again.',
                });
            }

            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated. Please contact support.',
                });
            }

            if ((decoded.tokenVersion ?? 0) !== (user.tokenVersion ?? 0)) {
                return res.status(401).json({
                    success: false,
                    message: 'Session has been revoked. Please login again.',
                });
            }

            if (!user.lenderId) {
                return res.status(403).json({
                    success: false,
                    message: 'Lender profile not configured.',
                });
            }

            // Attach user to request
            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token is invalid or expired. Please login again.',
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Protect routes for customer portal - verify JWT token for customers
 */
const protectCustomer = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized. Please login to the customer portal.',
            });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);

            // Ensure this is a customer token
            if (decoded.role !== 'customer') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token type. Please use customer portal login.',
                });
            }

            const customer = await Customer.findById(decoded.id);

            if (!customer) {
                return res.status(401).json({
                    success: false,
                    message: 'Customer not found. Please login again.',
                });
            }

            if (!customer.isPortalActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Portal access is not enabled for this account.',
                });
            }

            if (customer.isDeleted) {
                return res.status(401).json({
                    success: false,
                    message: 'Account has been deactivated.',
                });
            }

            if ((decoded.tokenVersion ?? 0) !== (customer.tokenVersion ?? 0)) {
                return res.status(401).json({
                    success: false,
                    message: 'Session has been revoked. Please login again.',
                });
            }

            req.customer = customer;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token is invalid or expired. Please login again.',
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Optional auth - attach user if token present, but don't require it
 */
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                if (decoded.role === 'lender') {
                    const user = await User.findById(decoded.id).populate('lenderId');
                    if (user && user.isActive && (decoded.tokenVersion ?? 0) === (user.tokenVersion ?? 0)) {
                        req.user = user;
                    }
                }
            } catch (error) {
                // Token invalid, but continue without user
            }
        }
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    generateToken,
    generateCustomerToken,
    protect,
    protectCustomer,
    optionalAuth,
    JWT_SECRET,
};

