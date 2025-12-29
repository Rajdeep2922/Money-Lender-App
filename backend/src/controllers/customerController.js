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

        // Search filter
        if (search) {
            filter.$or = [
                { firstName: new RegExp(search, 'i') },
                { lastName: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') },
                { phone: new RegExp(search, 'i') },
            ];
        }

        // Status filter
        if (status) filter.status = status;

        const customers = await Customer.find(filter)
            .sort(sortBy)
            .limit(Math.min(limit * 1, PAGINATION.MAX_LIMIT))
            .skip((page - 1) * limit);

        const total = await Customer.countDocuments(filter);

        res.json({
            success: true,
            customers,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit),
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
 */
exports.createCustomer = async (req, res, next) => {
    try {
        const customerData = { ...req.body };
        // Auto-assign lenderId for data isolation
        if (req.user && req.user.lenderId) {
            customerData.lenderId = req.user.lenderId;
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
 */
exports.updateCustomer = async (req, res, next) => {
    try {
        const filter = { _id: req.params.id, isDeleted: { $ne: true } };
        if (req.user && req.user.lenderId) {
            filter.lenderId = req.user.lenderId;
        }
        const customer = await Customer.findOneAndUpdate(
            filter,
            req.body,
            { new: true, runValidators: true }
        );

        if (!customer) {
            return next(new AppError('Customer not found', 404));
        }

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
