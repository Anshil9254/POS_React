const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/DashboardController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;
