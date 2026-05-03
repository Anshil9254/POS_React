const express = require('express');
const router = express.Router();
const razorpayController = require('../controllers/RazorpayController');
const { authMiddleware } = require('../middleware/auth');

router.post('/create-order', authMiddleware, razorpayController.createOrder);

module.exports = router;
