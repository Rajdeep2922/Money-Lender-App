const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

router.get('/customers', exportController.exportCustomers);
router.get('/loans', exportController.exportLoans);
router.get('/payments', exportController.exportPayments);

module.exports = router;
