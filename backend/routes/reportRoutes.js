const express = require('express');
const router = express.Router();
const reportController = require('../controllers/ReportController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.use(roleMiddleware(['Admin', 'Manager']));

router.get('/daily', reportController.getDailyReport);
router.get('/monthly', reportController.getMonthlyReport);
router.get('/custom', reportController.getCustomReport);
router.get('/stock', reportController.getStockReport);
router.get('/lowstock', reportController.getLowStockReport);

module.exports = router;
