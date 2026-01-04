const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');

// JWT Secret - should be in environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token for user (lender)
 */
const generateToken = (userId) => {
    return jwt.sign({ id: userId, role: 'lender' }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

/**
 * Generate JWT token for customer (portal access)
 */
const generateCustomerToken = (customerId) => {
    return jwt.sign({ id: customerId, role: 'customer' }, JWT_SECRET, {
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
                const user = await User.findById(decoded.id).populate('lenderId');
                if (user && user.isActive) {
                    req.user = user;
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

