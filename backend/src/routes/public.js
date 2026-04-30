const express = require('express');
const router = express.Router();
const { createPublicLoanRequest, trackLoanRequest } = require('../controllers/publicLoanController');

// POST /api/public/loan-request  — no auth
router.post('/loan-request', createPublicLoanRequest);

// GET /api/public/loan-request/track?phone=XXXXXXXXXX  — no auth
router.get('/loan-request/track', trackLoanRequest);

module.exports = router;
