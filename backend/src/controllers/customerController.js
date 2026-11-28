const Customer = require('../models/Customer');
const { AppError } = require('../middleware/errorHandler');
const { PAGINATION } = require('../config/constants');

/**
 * List all customers with pagination and search
 */
/**
 * List all customers with pagination and search
 */
exports.listCustomers = async (req, res, next) => {
    try {
        const {
            page = PAGINATION.DEFAULT_PAGE,
            limit = PAGINATION.DEFAULT_LIMIT,
            search,
            status,
            sortBy = '-createdAt'
        } = req.query;

        const filter = { isDeleted: { $ne: true } }; // Filter out deleted customers (handle missing field for legacy)

        // SECURITY: Filter by lender to isolate user data
        if (req.user && req.user.lenderId) {
            filter.lenderId = req.user.lenderId;
        }

        const safePage = Math.max(1, parseInt(page, 10) || PAGINATION.DEFAULT_PAGE);
        const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT), PAGINATION.MAX_LIMIT);

        // Search filter using existing text index
        let sortOption = sortBy;
        let projection = undefined;
        if (search && String(search).trim()) {
            filter.$text = { $search: String(search).trim() };
            projection = { score: { $meta: 'textScore' } };
            sortOption = { score: { $meta: 'textScore' } };
        }

        // Status filter
        if (status) filter.status = status;

        const [customers, total] = await Promise.all([
            Customer.find(filter, projection)
                .sort(sortOption)
                .limit(safeLimit)
                .skip((safePage - 1) * safeLimit),
            Customer.countDocuments(filter),
        ]);

        res.json({
            success: true,
            customers,
            pagination: {
                page: safePage,
                limit: safeLimit,
                total,
                pages: Math.ceil(total / safeLimit),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single customer by ID
 */
exports.getCustomer = async (req, res, next) => {
    try {
        const filter = { _id: req.params.id, isDeleted: { $ne: true } };
        if (req.user && req.user.lenderId) {
            filter.lenderId = req.user.lenderId;
        }
        const customer = await Customer.findOne(filter);

        if (!customer) {
            return next(new AppError('Customer not found', 404));
        }

        res.json({
            success: true,
            customer,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new customer
 * Lender can optionally set portal credentials during creation
 */
exports.createCustomer = async (req, res, next) => {
    try {
        const {
            enablePortal,
            portalPassword,
            firstName,
            lastName,
            email,
            phone,
            address,
            governmentId,
            aadhaarNumber,
            panNumber,
            bankDetails,
            notes,
            signature,
            photo,
            status,
        } = req.body;

        const customerData = {
            firstName,
            lastName,
            email,
            phone,
            address,
            governmentId,
            aadhaarNumber,
            panNumber,
            bankDetails,
            notes,
            signature,
            photo,
            status,
        };

        // Remove undefined keys so schema defaults apply cleanly
        Object.keys(customerData).forEach((k) => customerData[k] === undefined && delete customerData[k]);

        // Auto-assign lenderId for data isolation
        if (req.user && req.user.lenderId) {
            customerData.lenderId = req.user.lenderId._id || req.user.lenderId;
        }

        // Handle portal access if requested
        if (enablePortal && portalPassword) {
            customerData.isPortalActive = true;
            customerData.password = portalPassword; // Will be hashed by pre-save hook
        }

        const customer = new Customer(customerData);
        await customer.save();

        res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            customer,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update customer
 * Lender can update portal credentials
 */
exports.updateCustomer = async (req, res, next) => {
    try {
        const { enablePortal, portalPassword } = req.body;

        const filter = { _id: req.params.id, isDeleted: { $ne: true } };
        if (req.user && req.user.lenderId) {
            filter.lenderId = req.user.lenderId._id || req.user.lenderId;
        }

        // Find customer first to handle password update properly
        const customer = await Customer.findOne(filter);
        if (!customer) {
            return next(new AppError('Customer not found', 404));
        }

        // Explicit whitelist — never allow lenderId, password, isPortalActive, isDeleted, tokenVersion via spread
        const ALLOWED_CUSTOMER_FIELDS = [
            'firstName', 'lastName', 'email', 'phone', 'address',
            'governmentId', 'aadhaarNumber', 'panNumber', 'bankDetails',
            'notes', 'signature', 'photo', 'status',
        ];
        for (const field of ALLOWED_CUSTOMER_FIELDS) {
            if (req.body[field] !== undefined) {
                customer[field] = req.body[field];
            }
        }

        // Handle portal access changes explicitly
        if (typeof enablePortal === 'boolean') {
            customer.isPortalActive = enablePortal;
            if (!enablePortal) {
                customer.tokenVersion = (customer.tokenVersion || 0) + 1;
            }
        }

        // Update password only if a new one is provided
        if (portalPassword && portalPassword.length >= 6) {
            customer.password = portalPassword; // Will be hashed by pre-save hook
            customer.tokenVersion = (customer.tokenVersion || 0) + 1;
        }

        await customer.save();

        res.json({
            success: true,
            message: 'Customer updated successfully',
            customer,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete customer (soft delete by setting isDeleted: true)
 */
exports.deleteCustomer = async (req, res, next) => {
    try {
        const filter = { _id: req.params.id };
        if (req.user && req.user.lenderId) {
            filter.lenderId = req.user.lenderId;
        }
        const customer = await Customer.findOneAndUpdate(
            filter,
            { isDeleted: true }, // Mark as deleted
            { new: true }
        );

        if (!customer) {
            return next(new AppError('Customer not found', 404));
        }

        res.json({
            success: true,
            message: 'Customer deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
