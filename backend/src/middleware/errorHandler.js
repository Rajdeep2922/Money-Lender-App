/**
 * Error handling middleware
 */

const crypto = require('crypto');

// Custom error class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Not Found handler
const notFound = (req, res, next) => {
    const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
    next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
    const isProd = process.env.NODE_ENV === 'production';
    const requestId = req.headers['x-request-id'] || crypto.randomUUID();
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        statusCode = 400;
        if (isProd) {
            message = 'Duplicate value conflict';
        } else {
            const field = Object.keys(err.keyValue || {})[0] || 'field';
            message = `Duplicate value for ${field}. Please use another value.`;
        }
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        if (isProd) {
            message = 'Validation failed';
        } else {
            const errors = Object.values(err.errors).map(e => e.message);
            message = errors.join('. ');
        }
    }

    // Log error server-side
    if (process.env.NODE_ENV !== 'test') {
        console.error(`[Error:${requestId}]`, err);
    }

    if (isProd && !err.isOperational && statusCode >= 500) {
        message = 'Internal Server Error';
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(isProd ? { requestId } : {}),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = {
    AppError,
    notFound,
    errorHandler,
};
