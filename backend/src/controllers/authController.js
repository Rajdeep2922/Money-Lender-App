const mongoose = require('mongoose');
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
    const session = await mongoose.startSession();
    try {
        const { username, email, password, businessName, ownerName, phone } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Cross-collection check: prevent customer email from registering as lender
        const existingCustomer = await Customer.findOne({ email: normalizedEmail, isDeleted: false });
        if (existingCustomer) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered as a customer',
            });
        }

        let finalUsername = (username || '').trim();
        if (!finalUsername) {
            const baseHandle = normalizedEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'lender';
            finalUsername = baseHandle.length < 3 ? `${baseHandle}_usr` : baseHandle;
        }

        let createdUser;
        await session.withTransaction(async () => {
            const [lender] = await Lender.create([{
                businessName: businessName || `${finalUsername}'s Business`,
                ownerName: ownerName || finalUsername,
                email: normalizedEmail,
                phone: phone || '+91-0000000000',
                address: {
                    street: '',
                    city: '',
                    state: '',
                    country: 'India',
                },
            }], { session });

            const [user] = await User.create([{
                username: finalUsername,
                email: normalizedEmail,
                password,
                lenderId: lender._id,
            }], { session });

            createdUser = user;
        });

        // Generate token
        const token = generateToken(createdUser._id, createdUser.tokenVersion);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: {
                    id: createdUser._id,
                    username: createdUser.username,
                    email: createdUser.email,
                    role: 'lender',
                },
                token,
                role: 'lender',
            },
        });
    } catch (error) {
        if (error?.code === 11000) {
            const key = Object.keys(error.keyPattern || error.keyValue || {})[0];
            if (key === 'username') {
                return res.status(409).json({ success: false, message: 'Username already taken' });
            }
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        next(error);
    } finally {
        await session.endSession();
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
        const { email, username, identifier, password } = req.body;
        const loginIdentifier = (identifier || email || username || '').trim();

        // Validate input
        if (!loginIdentifier || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email or username and password',
            });
        }

        // STEP 1: Try to find as Lender (User table) by email or username
        const isEmail = loginIdentifier.includes('@');
        let user;
        if (isEmail) {
            user = await User.findOne({ email: loginIdentifier.toLowerCase() }).select('+password').populate('lenderId');
        } else {
            const escapedIdentifier = loginIdentifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            user = await User.findOne({
                $or: [
                    { username: { $regex: new RegExp(`^${escapedIdentifier}$`, 'i') } },
                    { email: loginIdentifier.toLowerCase() },
                ]
            }).select('+password').populate('lenderId');
        }

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
            const token = generateToken(user._id, user.tokenVersion);

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
        const customer = await Customer.findOne({
            $or: [
                { email: loginIdentifier.toLowerCase() },
                { phone: loginIdentifier }
            ],
            isDeleted: false
        }).select('+password');

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
            const token = generateCustomerToken(customer._id, customer.tokenVersion);

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
        // Increment tokenVersion to revoke existing JWTs for this user
        if (req.user?._id) {
            await User.findByIdAndUpdate(req.user._id, { $inc: { tokenVersion: 1 } });
        }
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

