const express = require('express');
const router = express.Router();
const { getPublicLenders, getLenderById } = require('../controllers/lendersController');
// Lender discovery is public so guests can browse lenders without an account

router.get('/', getPublicLenders);
router.get('/:id', getLenderById);

module.exports = router;
