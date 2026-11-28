/**
 * File Upload Controller
 * Validates magic bytes, limits size to 5 MB and 3 files, uses UUID public_id,
 * and uploads to Cloudinary. Requires accepted loan request membership.
 */
const crypto = require('crypto');
const LoanRequest = require('../models/LoanRequest');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Inspect file magic bytes to prevent MIME/extension spoofing.
 * Allows only JPEG, PNG, and PDF.
 */
function detectMagicMime(buf) {
    if (!Buffer.isBuffer(buf) || buf.length < 4) return null;
    if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) {
        return 'image/jpeg';
    }
    if (
        buf.length >= 8 &&
        buf[0] === 0x89 &&
        buf[1] === 0x50 &&
        buf[2] === 0x4E &&
        buf[3] === 0x47 &&
        buf[4] === 0x0D &&
        buf[5] === 0x0A &&
        buf[6] === 0x1A &&
        buf[7] === 0x0A
    ) {
        return 'image/png';
    }
    if (buf.subarray(0, 4).toString('ascii') === '%PDF') {
        return 'application/pdf';
    }
    return null;
}

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type. Allowed: JPEG, PNG, PDF'), false);
    }
};

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024, files: 3 }, // 5 MB max, max 3 files
});

/**
 * Dual-auth middleware — JWT or trackingToken
 */
const protectBoth = async (req, res, next) => {
    const LoanRequestModel = require('../models/LoanRequest');

    // Mode 1: trackingToken header (guest)
    const trackingToken = req.headers['x-tracking-token'];
    if (trackingToken) {
        const loanReq = await LoanRequestModel.findOne({ trackingToken });
        if (!loanReq) return res.status(401).json({ success: false, message: 'Invalid tracking token' });
        req.guestTrackingToken = trackingToken;
        req.guestLoanRequestId = loanReq._id.toString();
        req.loanRequest = loanReq;
        return next();
    }

    // Mode 2: JWT Bearer
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
            if (!user || !user.isActive || (decoded.tokenVersion ?? 0) !== (user.tokenVersion ?? 0)) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            req.user = user;
        } else if (decoded.role === 'customer') {
            const customer = await Customer.findById(decoded.id);
            if (
                !customer ||
                customer.isDeleted ||
                !customer.isPortalActive ||
                (decoded.tokenVersion ?? 0) !== (customer.tokenVersion ?? 0)
            ) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
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

    const loanRequest = req.loanRequest || (await LoanRequest.findById(loanRequestId));
    if (!loanRequest || loanRequest._id.toString() !== loanRequestId) {
        return res.status(404).json({ success: false, message: 'Loan request not found' });
    }

    if (loanRequest.status !== 'accepted') {
        return res.status(403).json({
            success: false,
            message: 'File uploads are only allowed for accepted loan requests',
        });
    }

    if (req.guestTrackingToken) {
        if (loanRequest.trackingToken !== req.guestTrackingToken) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        req.loanRequest = loanRequest;
        return next();
    }

    let userId;
    if (req.customer) {
        userId = req.customer._id.toString();
    } else if (req.user) {
        userId = req.user._id.toString();
    }

    const isCustomer = loanRequest.customerId && loanRequest.customerId.toString() === userId;
    const isLender = loanRequest.lenderId.toString() === (req.user?.lenderId?._id || req.user?.lenderId)?.toString();

    if (!isCustomer && !isLender) {
        return res.status(403).json({ success: false, message: 'Access denied' });
    }

    req.loanRequest = loanRequest;
    next();
};

function uploadBufferToCloudinary(buffer, options) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
        stream.end(buffer);
    });
}

/**
 * @desc    Upload file to Cloudinary
 * @route   POST /api/upload?loanRequestId=xxx
 * @access  Private (participant + accepted)
 */
const uploadFile = [
    protectBoth,
    verifyUploadAccess,
    upload.single('file'),
    async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            const detectedMime = detectMagicMime(req.file.buffer);
            if (!detectedMime) {
                return res.status(400).json({
                    success: false,
                    message: 'Unsupported or invalid file content. Allowed: JPEG, PNG, PDF',
                });
            }

            const isImage = detectedMime.startsWith('image/');
            const result = await uploadBufferToCloudinary(req.file.buffer, {
                folder: `moneylender/chat/${req.loanRequest._id}`,
                resource_type: isImage ? 'image' : 'raw',
                public_id: crypto.randomUUID(),
            });

            const safeOriginalName = (req.file.originalname || 'file')
                .replace(/[^\w.\- ]/g, '_')
                .slice(0, 120);

            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.json({
                success: true,
                data: {
                    fileUrl: result.secure_url,
                    fileType: detectedMime === 'application/pdf' ? 'pdf' : 'image',
                    originalName: safeOriginalName,
                    size: req.file.size,
                },
            });
        } catch (err) {
            next(err);
        }
    },
];

module.exports = { uploadFile, detectMagicMime };
