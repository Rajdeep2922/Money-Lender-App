const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { createPublicLoanRequest, trackLoanRequest } = require('../controllers/publicLoanController');

const publicRequestLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    skipSuccessfulRequests: true,
    message: { success: false, message: 'Too many requests, please try again later.' },
});

// POST /api/public/loan-request  — no auth
router.post('/loan-request', publicRequestLimiter, createPublicLoanRequest);

// GET /api/public/loan-request/track?phone=XXXXXXXXXX  — no auth
router.get('/loan-request/track', trackLoanRequest);

module.exports = router;
