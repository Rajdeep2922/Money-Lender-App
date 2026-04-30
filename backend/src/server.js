const express = require('express');
const http = require('http');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/database');
const initSchedulers = require('./utils/scheduler');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { initSocketManager } = require('./socket/socketManager');

// Initialize express app
const app = express();

// Create HTTP server (required for Socket.IO)
const httpServer = http.createServer(app);

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
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? (process.env.FRONTEND_URL || 'http://localhost:5173')
        : true,
    credentials: true,
};
app.use(cors(corsOptions));

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

// Customer portal auth (public)
app.use('/api/customer-auth', require('./routes/customerAuth'));

// Public loan calculator (no auth required)
app.use('/api/calculator', require('./routes/calculator'));

// Protected routes - require lender authentication
const { protect } = require('./middleware/auth');
app.use('/api/customers', protect, require('./routes/customers'));
app.use('/api/loans', protect, require('./routes/loans'));
app.use('/api/payments', protect, require('./routes/payments'));
app.use('/api/lender', protect, require('./routes/lender'));
app.use('/api/stats', protect, require('./routes/stats'));
app.use('/api/invoices', protect, require('./routes/invoices'));
app.use('/api/export', protect, require('./routes/export'));

// Customer portal routes (customer authentication)
app.use('/api/portal', require('./routes/customerPortal'));

// ── NEW: Lender Discovery, Loan Requests, Chat, File Upload ───────────────
app.use('/api/lenders', require('./routes/lenders'));
app.use('/api/loan-request', require('./routes/loanRequests'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/upload', require('./routes/upload'));
// ── PUBLIC (no auth) — guest loan requests & tracking ─────────────────────
app.use('/api/public', require('./routes/public'));
// ─────────────────────────────────────────────────────────────────────────

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Loan Lender API',
        version: '2.0.0',
        endpoints: {
            auth: '/api/auth',
            customers: '/api/customers',
            loans: '/api/loans',
            payments: '/api/payments',
            lender: '/api/lender',
            lenders: '/api/lenders',
            loanRequests: '/api/loan-request',
            chat: '/api/chat',
            upload: '/api/upload',
            stats: '/api/stats',
            health: '/api/health',
        },
    });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// ── Socket.IO Initialization ────────────────────────────────────────────
const io = new Server(httpServer, {
    cors: corsOptions,
    pingTimeout: 60000,
    pingInterval: 25000,
});

// Make io accessible in route controllers via app locals
app.set('io', io);

initSocketManager(io);
// ────────────────────────────────────────────────────────────────────────

// Start server (use httpServer, not app.listen)
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║     Loan Lender API Server v2.0                ║
║     Running on port ${PORT}                        ║
║     Environment: ${process.env.NODE_ENV || 'development'}               ║
║     WebSocket: Socket.IO enabled               ║
╚════════════════════════════════════════════════╝
  `);
});

module.exports = app;
