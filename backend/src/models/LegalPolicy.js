const mongoose = require('mongoose');
const { LEGAL_POLICY_TYPE } = require('../config/constants');

const legalPolicySchema = new mongoose.Schema({
    lenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lender',
        required: true,
        index: true,
    },
    policyType: {
        type: String,
        enum: Object.values(LEGAL_POLICY_TYPE),
        required: true,
        index: true,
    },
    version: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: false,
        index: true,
    },
    updatedBy: {
        type: String,
        default: 'System Admin',
    },
}, {
    timestamps: true,
});

// Compound unique index for lender, policyType, and version
legalPolicySchema.index({ lenderId: 1, policyType: 1, version: 1 }, { unique: true });
// Fast lookup index for active policies
legalPolicySchema.index({ lenderId: 1, policyType: 1, isActive: 1 });

/**
 * Get active policy doc for a lender and policyType
 */
legalPolicySchema.statics.getActive = async function (lenderId, policyType) {
    return await this.findOne({ lenderId, policyType, isActive: true });
};

/**
 * Publish a new policy version
 */
legalPolicySchema.statics.publish = async function (lenderId, policyType, content, updatedBy = 'Lender Admin') {
    // Find highest version number for this policyType & lender
    const existingPolicies = await this.find({ lenderId, policyType }).sort({ createdAt: -1 });
    
    let nextVersion = 'v1.0';
    if (existingPolicies.length > 0) {
        const lastVersion = existingPolicies[0].version; // e.g. "v1.2"
        const numPart = parseFloat(lastVersion.replace('v', ''));
        if (!isNaN(numPart)) {
            nextVersion = `v${(numPart + 0.1).toFixed(1)}`;
        }
    }

    // Deactivate previous active versions for this policyType
    await this.updateMany({ lenderId, policyType, isActive: true }, { isActive: false });

    // Create new active policy
    const newPolicy = await this.create({
        lenderId,
        policyType,
        version: nextVersion,
        content,
        isActive: true,
        updatedBy,
    });

    return newPolicy;
};

module.exports = mongoose.model('LegalPolicy', legalPolicySchema);
