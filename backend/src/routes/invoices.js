const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

router.get('/', invoiceController.listInvoices);
router.post('/generate', invoiceController.generateMonthlyInvoices);
router.get('/:id/download', invoiceController.downloadInvoice);
router.delete('/:id', invoiceController.deleteInvoice);

module.exports = router;
