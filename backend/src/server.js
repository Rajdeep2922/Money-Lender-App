const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const initSchedulers = require('./utils/scheduler');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Initialize Schedulers
initSchedulers();

// Security middleware
app.use(helmet());

// Rate limiting - configurable via environment
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || (process.env.NODE_ENV === 'production' ? 100 : 500),
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);



// CORS
// CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? (process.env.FRONTEND_URL || 'http://localhost:5173')
        : true, // Allow any origin in development (enables mobile testing)
    credentials: true,
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
// Auth routes (public)
app.use('/api/auth', require('./routes/auth'));

// Protected routes - require authentication
const { protect } = require('./middleware/auth');
app.use('/api/customers', protect, require('./routes/customers'));
app.use('/api/loans', protect, require('./routes/loans'));
app.use('/api/payments', protect, require('./routes/payments'));
app.use('/api/lender', protect, require('./routes/lender'));
app.use('/api/stats', protect, require('./routes/stats'));
app.use('/api/invoices', protect, require('./routes/invoices'));
app.use('/api/export', protect, require('./routes/export'));

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Loan Lender API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            customers: '/api/customers',
            loans: '/api/loans',
            payments: '/api/payments',
            lender: '/api/lender',
            stats: '/api/stats',
            health: '/api/health',
        },
    });
});


// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║     Loan Lender API Server                     ║
║     Running on port ${PORT}                        ║
║     Environment: ${process.env.NODE_ENV || 'development'}               ║
╚════════════════════════════════════════════════╝
  `);
});

module.exports = app;
