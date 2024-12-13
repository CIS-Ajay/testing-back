const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.get('/protected', authenticateToken, authController.protected);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;