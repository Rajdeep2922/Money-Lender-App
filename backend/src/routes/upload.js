const express = require('express');
const router = express.Router();
const { uploadFile } = require('../controllers/uploadController');

// POST /api/upload?loanRequestId=xxx
router.post('/', uploadFile);

module.exports = router;
