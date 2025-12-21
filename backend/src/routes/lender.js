const express = require('express');
const router = express.Router();
const lenderController = require('../controllers/lenderController');
const { validateLender } = require('../middleware/validation');

// Get lender details
router.get('/', lenderController.getLender);

// Update lender details
router.put('/', validateLender, lenderController.updateLender);

module.exports = router;
