const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Secret - should be in environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token for user
 */
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

/**
 * Protect routes - verify JWT token
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
    protect,
    optionalAuth,
    JWT_SECRET,
};
