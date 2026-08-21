const express = require('express');
const router = express.Router();
const {
    getAllPolicies,
    getActivePolicy,
    getPolicyHistory,
    publishPolicy,
    getPublicPolicies,
} = require('../controllers/legalController');

// ── Public (no auth) ──────────────────────────────────────────────────────────
// Returns the latest active policy versions for public display on /legal page
router.get('/public', getPublicPolicies);

// ── Authenticated routes ───────────────────────────────────────────────────────
// Get all current active policies (all 8 types)
router.get('/policies', getAllPolicies);

// Get current active policy for a specific type
router.get('/policies/:type', getActivePolicy);

// Get full version history for a policy type
router.get('/policies/:type/history', getPolicyHistory);

// Publish a new policy version (creates new version, deactivates old)
router.put('/policies/:type', publishPolicy);

module.exports = router;
