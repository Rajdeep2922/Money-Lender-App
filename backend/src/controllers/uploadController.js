/**
 * File Upload Controller
 * Uploads to Cloudinary and returns the file URL.
 * Requires an accepted loan request membership for authorization.
 */
const LoanRequest = require('../models/LoanRequest');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage — auto-detect resource type
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        const loanRequestId = req.query.loanRequestId;
        const isImage = file.mimetype.startsWith('image/');
        return {
            folder: `moneylender/chat/${loanRequestId}`,
            resource_type: isImage ? 'image' : 'raw',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx'],
            public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`,
        };
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type. Allowed: images, PDF, DOC, DOCX'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

/**
 * Dual-auth middleware
 */
const protectBoth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const jwt = require('jsonwebtoken');
    const { JWT_SECRET } = require('../middleware/auth');
    const User = require('../models/User');
    const Customer = require('../models/Customer');
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role === 'lender') {
            const user = await User.findById(decoded.id).populate('lenderId');
            if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'Unauthorized' });
            req.user = user;
        } else if (decoded.role === 'customer') {
            const customer = await Customer.findById(decoded.id);
            if (!customer || customer.isDeleted || !customer.isPortalActive)
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            req.customer = customer;
        } else {
            return res.status(401).json({ success: false, message: 'Unknown role' });
        }
        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Token invalid or expired' });
    }
};

/**
 * Verify the uploading user is a participant in an accepted loan request
 */
const verifyUploadAccess = async (req, res, next) => {
    const { loanRequestId } = req.query;
    if (!loanRequestId) {
        return res.status(400).json({ success: false, message: 'loanRequestId query param is required' });
    }

    const loanRequest = await LoanRequest.findById(loanRequestId);
    if (!loanRequest) {
        return res.status(404).json({ success: false, message: 'Loan request not found' });
    }

    if (loanRequest.status !== 'accepted') {
        return res.status(403).json({
            success: false,
            message: 'File uploads are only allowed for accepted loan requests',
        });
    }

    let userId;
    if (req.customer) {
        userId = req.customer._id.toString();
    } else if (req.user) {
        userId = (req.user.lenderId?._id || req.user.lenderId)?.toString();
    }

    const isParticipant =
        loanRequest.customerId.toString() === userId ||
        loanRequest.lenderId.toString() === userId;

    if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Access denied' });
    }

    req.loanRequest = loanRequest;
    next();
};

/**
 * @desc    Upload file to Cloudinary
 * @route   POST /api/upload?loanRequestId=xxx
 * @access  Private (participant + accepted)
 */
const uploadFile = [
    protectBoth,
    verifyUploadAccess,
    upload.single('file'),
    (req, res) => {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const fileUrl = req.file.path; // Cloudinary URL
        const isImage = req.file.mimetype.startsWith('image/');
        const fileType = req.file.mimetype === 'application/pdf'
            ? 'pdf'
            : isImage
                ? 'image'
                : 'document';

        res.json({
            success: true,
            data: {
                fileUrl,
                fileType,
                originalName: req.file.originalname,
                size: req.file.size,
            },
        });
    },
];

module.exports = { uploadFile };
