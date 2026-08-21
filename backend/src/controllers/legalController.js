const LegalPolicy = require('../models/LegalPolicy');
const Lender = require('../models/Lender');
const { AppError } = require('../middleware/errorHandler');
const { LEGAL_POLICY_TYPE } = require('../config/constants');

// Map policyType to the corresponding Lender.activePolicies field key
const POLICY_TYPE_TO_ACTIVE_KEY = {
    [LEGAL_POLICY_TYPE.TERMS]:           'termsId',
    [LEGAL_POLICY_TYPE.LOAN_AGREEMENT]:  'loanAgreementId',
    [LEGAL_POLICY_TYPE.INTEREST]:        'interestId',
    [LEGAL_POLICY_TYPE.EMI_PAYMENT]:     'emiPaymentId',
    [LEGAL_POLICY_TYPE.FORECLOSURE]:     'foreclosureId',
    [LEGAL_POLICY_TYPE.DEFAULT_OVERDUE]: 'defaultOverdueId',
    [LEGAL_POLICY_TYPE.PRIVACY]:         'privacyId',
    [LEGAL_POLICY_TYPE.CONTACT]:         'contactId',
};

const VALID_TYPES = Object.values(LEGAL_POLICY_TYPE);

/**
 * GET /api/legal/policies
 * Returns the current active version of all 8 policy types for the lender.
 */
exports.getAllPolicies = async (req, res, next) => {
    try {
        const lenderId = req.user?.lenderId;
        if (!lenderId) return next(new AppError('Lender not found', 404));

        const policies = await LegalPolicy.find({ lenderId, isActive: true });

        // Build a map of policyType → policy doc for easy consumption
        const policiesMap = {};
        policies.forEach(p => { policiesMap[p.policyType] = p; });

        res.json({ success: true, policies: policiesMap });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/legal/policies/:type
 * Returns the current active policy for a given type.
 */
exports.getActivePolicy = async (req, res, next) => {
    try {
        const { type } = req.params;
        const lenderId = req.user?.lenderId;

        if (!VALID_TYPES.includes(type)) {
            return next(new AppError(`Invalid policy type: ${type}`, 400));
        }

        const policy = await LegalPolicy.getActive(lenderId, type);

        if (!policy) {
            return res.json({ success: true, policy: null });
        }

        res.json({ success: true, policy });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/legal/policies/:type/history
 * Returns all versions (newest first) for a given policy type.
 */
exports.getPolicyHistory = async (req, res, next) => {
    try {
        const { type } = req.params;
        const lenderId = req.user?.lenderId;

        if (!VALID_TYPES.includes(type)) {
            return next(new AppError(`Invalid policy type: ${type}`, 400));
        }

        const history = await LegalPolicy.find({ lenderId, policyType: type })
            .sort({ createdAt: -1 })
            .select('version content isActive updatedBy createdAt');

        res.json({ success: true, history });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/legal/policies/:type
 * Publishes a new version of a given policy type.
 * Deactivates the old version, creates a new one, updates Lender.activePolicies.
 */
exports.publishPolicy = async (req, res, next) => {
    try {
        const { type } = req.params;
        const { content } = req.body;
        const lenderId = req.user?.lenderId;

        if (!VALID_TYPES.includes(type)) {
            return next(new AppError(`Invalid policy type: ${type}`, 400));
        }

        if (!content || !content.trim()) {
            return next(new AppError('Policy content cannot be empty', 400));
        }

        // Get lender for updatedBy name
        const lender = await Lender.findById(lenderId);
        if (!lender) return next(new AppError('Lender not found', 404));

        // Publish new version via model static
        const newPolicy = await LegalPolicy.publish(lenderId, type, content.trim(), lender.ownerName);

        // Update Lender.activePolicies reference
        const activeKey = POLICY_TYPE_TO_ACTIVE_KEY[type];
        if (activeKey) {
            await Lender.findByIdAndUpdate(lenderId, {
                [`activePolicies.${activeKey}`]: newPolicy._id,
            });
        }

        res.json({
            success: true,
            message: `Policy published as ${newPolicy.version}`,
            policy: newPolicy,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Helper used by loanController.downloadAgreement
 * Fetches all active policies and returns a snapshot object for embedding in the PDF.
 */
exports.buildPolicySnapshot = async (lenderId) => {
    const policies = await LegalPolicy.find({ lenderId, isActive: true });
    const map = {};
    policies.forEach(p => { map[p.policyType] = p; });

    return {
        termsVersion:       map[LEGAL_POLICY_TYPE.TERMS]?.version || 'v1.0',
        termsContent:       map[LEGAL_POLICY_TYPE.TERMS]?.content || '',
        interestPolicy:     map[LEGAL_POLICY_TYPE.INTEREST]?.content || '',
        emiPolicy:          map[LEGAL_POLICY_TYPE.EMI_PAYMENT]?.content || '',
        foreclosurePolicy:  map[LEGAL_POLICY_TYPE.FORECLOSURE]?.content || '',
        defaultPolicy:      map[LEGAL_POLICY_TYPE.DEFAULT_OVERDUE]?.content || '',
        privacyPolicy:      map[LEGAL_POLICY_TYPE.PRIVACY]?.content || '',
    };
};

/**
 * GET /api/legal/public   (no auth required)
 * Returns the latest active version of each policy type from the first available lender.
 * Used by the public-facing Legal Center page (/legal) to display current policy versions.
 */
exports.getPublicPolicies = async (req, res, next) => {
    try {
        // Pick the first lender that has any published policies
        const firstPolicy = await LegalPolicy.findOne({ isActive: true }).sort({ createdAt: -1 });
        if (!firstPolicy) {
            return res.json({ success: true, policies: [] });
        }

        const policies = await LegalPolicy.find({
            lenderId: firstPolicy.lenderId,
            isActive: true,
        }).select('policyType version content createdAt').sort({ policyType: 1 });

        res.json({ success: true, policies });
    } catch (err) {
        next(err);
    }
};

