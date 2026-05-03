const express = require('express');
const router = express.Router();
const billingController = require('../controllers/BillingController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.post('/checkout', billingController.createBill);
router.get('/', billingController.getBills);
router.get('/invoice/:id', billingController.getInvoice);

module.exports = router;
