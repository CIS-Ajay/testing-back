// authController.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/userModel');
const Otp = require('../models/otpModel');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokenUtils');
const nodemailer = require('nodemailer');

module.exports = {

    generateOtp : async (req, res) => {
        const { email } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user) {
            return res.status(400).json({ msg: 'User does not exist' });
            }
        
            // const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otp = crypto.randomBytes(3).toString('hex').toUpperCase(); // Generate a 6-digit OTP
            await Otp.create({ userId: user._id, otp });
        
            res.status(200).json({ msg: 'OTP sent' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: 'Server error' });
        }
    },

    verifyOtp : async (req, res) => {
        const { email, otp } = req.body;
        
        try {
            const user = await User.findOne({ email });
            if (!user) {
            return res.status(400).json({ msg: 'User does not exist' });
            }
        
            const otpRecord = await Otp.findOne({ userId: user._id, otp, createdAt: { $gt: Date.now() - 5 * 60 * 1000 } });
            if (!otpRecord) {
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
            }
        
            await Otp.deleteOne({ _id: otpRecord._id });
            res.status(200).json({ msg: 'OTP verified' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: 'Server error' });
        }
    },

    register: async (req, res) => {
        const { username, password, email, firstName, lastName, dateOfBirth, profilePicture } = req.body;
        const user = new User(req.body);
        const validationErrors = user.validateSync();

        if (validationErrors) {
            const errors = [];
            for (const field in validationErrors.errors) {
                errors.push({ message: validationErrors.errors[field].message });
            }
            return res.status(400).json({ message: 'Validation failed', errors });
        }

        try {
            const existingUser = await User.findOne({ username }); 
            if (existingUser) {
                return res.status(400).json({ message: 'Username already exists' });
            }

            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword; // Ensure password is set after validation

            await user.save();
            const user_details = { username, email, firstName, lastName, dateOfBirth, profilePicture };
            res.status(201).json({ message: 'User registered successfully', user_details });

        } catch (error) {
            console.log('error: ', error);
            let errorMessage = 'Internal server error';
            if (error.code === 11000) {
                const duplicateField = Object.keys(error.keyValue)[0];
                if (duplicateField === 'username') {
                    errorMessage = 'Username already exists';
                } else if (duplicateField === 'email') {
                    errorMessage = 'Email already exists';
                }
            }
            res.status(500).json({ message: errorMessage });
        }
    },

    logout: async (req, res) => {
        const { refreshToken } = req.body;
    
        try {
            const user = await User.findOne({ refreshToken });
            if (!user) {
                return res.status(400).json({ message: 'Invalid refresh token' });
            }
    
            if (!user.loggedOut) {
                user.refreshToken = null;
                user.refreshTokenSecret = null;
                user.loggedOut = true;
                await user.save();
    
                res.json({ message: 'Logged out successfully' });
            } else {
                return res.status(400).json({ message: 'Already logged out' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    login: async (req, res) => {
        const { username, password } = req.body;
        // console.log('req.body: ', req.body);
    
        try {
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
    
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
    
            const accessToken = generateAccessToken({ _id: user._id });
            const refreshTokenSecret = crypto.randomBytes(64).toString('hex');
            const refreshToken = generateRefreshToken({ _id: user._id }, refreshTokenSecret);
    
            user.refreshToken = refreshToken;
            user.refreshTokenSecret = refreshTokenSecret;
            user.loggedOut = false;
            await user.save();
    
            res.json({ accessToken, refreshToken, current_user: { username: user.username, _id: user._id } });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    refresh: async (req, res) => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token required' });
        }

        try {
            const user = await User.findOne({ refreshToken });
            if (!user) {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }

            verifyRefreshToken(refreshToken, user.refreshTokenSecret);

            const accessToken = generateAccessToken({ username: user.username });
            res.json({ accessToken });
        } catch (error) {
            res.status(403).json({ message: 'Invalid refresh token' });
        }
    },

    protected: (req, res) => {
        res.json({ message: `Hello ${req.user.username}, you have access to this route` });
    },

    forgotPassword: async (req, res) => {
        const { email } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ msg: 'User does not exist' });
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            const resetPasswordExpire = Date.now() + 10 * 60 * 1000;

            user.resetPasswordToken = resetPasswordToken;
            user.resetPasswordExpire = resetPasswordExpire;
            await user.save();

            const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            const mailOptions = {
                from: process.env.EMAIL,
                to: user.email,
                subject: 'Password reset token',
                text: `You are receiving this email because you (or someone else) have requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error('Error sending email:', err);
                    return res.status(500).json({ msg: 'Error sending email' });
                }
                res.status(200).json({ msg: 'Email sent' });
            });
        } catch (err) {
            console.error('Error in forgotPassword:', err);
            res.status(500).json({ msg: 'Server error' });
        }
    },

    resetPassword: async (req, res) => {
        const { password } = req.body;
        const { resetToken } = req.params;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

            const user = await User.findOne({
                resetPasswordToken,
                resetPasswordExpire: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({ msg: 'Invalid or expired token' });
            }

            user.password = await bcrypt.hash(password, 10);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            res.status(200).json({ msg: 'Password reset successful' });
        } catch (err) {
            console.error('Error in resetPassword:', err);
            res.status(500).json({ msg: 'Server error' });
        }
    }

};
