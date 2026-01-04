/**
 * Customer Authentication Controller
 * Handles customer portal login and profile management
 */

const Customer = require('../models/Customer');
const { generateCustomerToken } = require('../middleware/auth');

/**
 * @desc    Customer portal login
 * @route   POST /api/customer-auth/login
 * @access  Public
 */
const customerLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        // Find customer with password field
        const customer = await Customer.findOne({ email, isDeleted: false }).select('+password');

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Check if portal access is enabled
        if (!customer.isPortalActive) {
            return res.status(401).json({
                success: false,
                message: 'Portal access is not enabled for this account. Please contact your lender.',
            });
        }

        // Check if password is set
        if (!customer.password) {
            return res.status(401).json({
                success: false,
                message: 'Password not set. Please contact your lender to set up portal access.',
            });
        }

        // Verify password
        const isMatch = await customer.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Update last login
        customer.lastPortalLogin = new Date();
        await customer.save({ validateBeforeSave: false });

        // Generate token
        const token = generateCustomerToken(customer._id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                customer: {
                    id: customer._id,
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    email: customer.email,
                    fullName: customer.fullName,
                },
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get current customer profile
 * @route   GET /api/customer-auth/me
 * @access  Private (Customer)
 */
const getCustomerProfile = async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.customer._id);

        res.json({
            success: true,
            data: {
                customer: {
                    id: customer._id,
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    email: customer.email,
                    phone: customer.phone,
                    fullName: customer.fullName,
                    lastPortalLogin: customer.lastPortalLogin,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Activate customer portal access (called by lender)
 * @route   POST /api/customers/:id/activate-portal
 * @access  Private (Lender)
 */
const activatePortal = async (req, res, next) => {
    try {
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters',
            });
        }

        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found',
            });
        }

        if (customer.isDeleted) {
            return res.status(400).json({
                success: false,
                message: 'Cannot activate portal for deleted customer',
            });
        }

        // Set password and activate portal
        customer.password = password;
        customer.isPortalActive = true;
        await customer.save();

        res.json({
            success: true,
            message: 'Customer portal access activated successfully',
            data: {
                customerId: customer._id,
                email: customer.email,
                isPortalActive: customer.isPortalActive,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Deactivate customer portal access (called by lender)
 * @route   POST /api/customers/:id/deactivate-portal
 * @access  Private (Lender)
 */
const deactivatePortal = async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found',
            });
        }

        customer.isPortalActive = false;
        await customer.save({ validateBeforeSave: false });

        res.json({
            success: true,
            message: 'Customer portal access deactivated',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    customerLogin,
    getCustomerProfile,
    activatePortal,
    deactivatePortal,
};
