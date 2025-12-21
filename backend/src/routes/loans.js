const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { validateLoan } = require('../middleware/validation');

// List/Search
router.get('/', loanController.listLoans);

// Single Loan
router.get('/:id', loanController.getLoan);

// Create new loan
router.post('/', validateLoan, loanController.createLoan);

// Loan Actions
router.post('/:id/approve', loanController.approveLoan);
router.post('/:id/cancel', loanController.cancelLoan);
router.post('/:id/foreclose', loanController.forecloseLoan);

// Update loan (before approval)
router.put('/:id', loanController.updateLoan);

// Manual Status Toggle
router.patch('/:id/status', loanController.updateLoanStatus);

// Documents
router.get('/:id/agreement', loanController.downloadAgreement);
router.get('/:id/statement', loanController.downloadStatement);
router.get('/:id/noc', loanController.downloadNOC);

module.exports = router;
