const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/userModel');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokenUtils');
const passport = require('passport');

module.exports = {
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
        console.log('req.body: ', req.body);
    
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

};
