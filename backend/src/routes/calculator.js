/**
 * Public Loan Calculator Routes
 * No authentication required - open to public
 */

const express = require('express');
const router = express.Router();
const { estimateLoan, getFullSchedule } = require('../controllers/calculatorController');

// Public endpoints - no authentication required
router.post('/estimate', estimateLoan);
router.post('/schedule', getFullSchedule);

module.exports = router;
