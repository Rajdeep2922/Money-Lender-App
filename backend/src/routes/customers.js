const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { activatePortal, deactivatePortal } = require('../controllers/customerAuthController');
const { validateCustomer } = require('../middleware/validation');

// List customers with pagination & search
router.get('/', customerController.listCustomers);

// Get single customer
router.get('/:id', customerController.getCustomer);

// Create new customer
router.post('/', validateCustomer, customerController.createCustomer);

// Update customer
router.put('/:id', customerController.updateCustomer);

// Delete customer (soft delete)
router.delete('/:id', customerController.deleteCustomer);

// Portal activation routes (lender-controlled)
router.post('/:id/activate-portal', activatePortal);
router.post('/:id/deactivate-portal', deactivatePortal);

module.exports = router;
