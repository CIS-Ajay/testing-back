// authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');
const { body } = require('express-validator');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.get('/protected', authenticateToken, authController.protected);
router.post('/logout', authenticateToken, authController.logout);
router.post('/otp', [ body('email').isEmail().withMessage('Enter a valid email')], authController.generateOtp);

router.post('/otp-verify', [ body('email').isEmail().withMessage('Enter a valid email'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Enter a valid OTP')], authController.verifyOtp);

router.post('/forgot-password', [ body('email').isEmail().withMessage('Enter a valid email') ], authController.forgotPassword);

router.put('/reset-password/:resetToken', [ body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters') ], authController.resetPassword);

module.exports = router;