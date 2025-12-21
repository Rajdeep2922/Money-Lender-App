const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { validatePayment } = require('../middleware/validation');

// List all payments with filtering & pagination
router.get('/', paymentController.listPayments);

// Get single payment
router.get('/:id', paymentController.getPayment);

// Download payment receipt
router.get('/:id/receipt', paymentController.downloadReceipt);

// Record new payment
router.post('/', validatePayment, paymentController.recordPayment);

// Get payments for a specific loan
router.get('/loan/:loanId', paymentController.getPaymentsForLoan);

// Get payments for a specific customer
router.get('/customer/:customerId', paymentController.getPaymentsForCustomer);

// Update payment (if recent)
router.put('/:id', paymentController.updatePayment);

// Delete payment (if recent)
router.delete('/:id', paymentController.deletePayment);

module.exports = router;
