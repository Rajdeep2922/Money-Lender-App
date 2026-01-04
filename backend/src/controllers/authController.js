const User = require('../models/User');
const Lender = require('../models/Lender');
const Customer = require('../models/Customer');
const { generateToken, generateCustomerToken } = require('../middleware/auth');

/**
 * @desc    Register new lender user
 * @route   POST /api/auth/register
 * @access  Public
 * 
 * NOTE: This is ONLY for lender registration.
 * Customers cannot self-register - their credentials are created by lenders.
 */
const register = async (req, res, next) => {
    try {
        const { username, email, password, businessName, ownerName, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email
                    ? 'Email already registered'
                    : 'Username already taken',
            });
        }

        // Also check if email exists as a customer (prevent conflicts)
        const existingCustomer = await Customer.findOne({ email, isDeleted: false });
        if (existingCustomer) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered as a customer',
            });
        }

        // Create lender profile
        const lender = await Lender.create({
            businessName: businessName || `${username}'s Business`,
            ownerName: ownerName || username,
            email,
            phone: phone || '+91-0000000000',
            address: {
                street: '',
                city: '',
                state: '',
                country: 'India',
            },
        });

        // Create user with lender reference
        const user = await User.create({
            username,
            email,
            password,
            lenderId: lender._id,
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: 'lender',
                },
                token,
                role: 'lender',
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Unified login - works for both lenders and customers
 * @route   POST /api/auth/login
 * @access  Public
 * 
 * EMAIL DETERMINES ROLE:
 * - If email exists in User table -> Lender login
 * - If email exists in Customer table with password -> Customer login
 * - No role selector needed - email alone determines identity
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        // STEP 1: Try to find as Lender (User table)
        const user = await User.findOne({ email }).select('+password').populate('lenderId');

        if (user) {
            // Check if account is active
            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated. Please contact support.',
                });
            }

            // Check password
            const isMatch = await user.comparePassword(password);

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials',
                });
            }

            // Update last login
            user.lastLogin = new Date();
            await user.save({ validateBeforeSave: false });

            // Generate lender token
            const token = generateToken(user._id);

            return res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        lender: user.lenderId,
                        role: 'lender',
                    },
                    token,
                    role: 'lender',
                    redirectTo: '/', // Lender dashboard
                },
            });
        }

        // STEP 2: Try to find as Customer
        const customer = await Customer.findOne({ email, isDeleted: false }).select('+password');

        if (customer) {
            // Check if customer has portal access enabled
            if (!customer.isPortalActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Portal access is not enabled. Please contact your lender.',
                });
            }

            // Check if password is set
            if (!customer.password) {
                return res.status(401).json({
                    success: false,
                    message: 'No password set for this account. Please contact your lender.',
                });
            }

            // Check password
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

            // Generate customer token
            const token = generateCustomerToken(customer._id);

            return res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: customer._id,
                        firstName: customer.firstName,
                        lastName: customer.lastName,
                        email: customer.email,
                        fullName: customer.fullName,
                        role: 'customer',
                    },
                    token,
                    role: 'customer',
                    redirectTo: '/portal', // Customer portal
                },
            });
        }

        // No user found with this email
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials',
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get current logged in user (lender only)
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('lenderId');

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    lender: user.lenderId,
                    lastLogin: user.lastLogin,
                    role: 'lender',
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Logout user (client-side token removal)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
    try {
        // JWT is stateless, so we just send success
        // Client should remove the token
        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe,
    logout,
};

