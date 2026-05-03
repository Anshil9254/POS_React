const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const { authMiddleware } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
