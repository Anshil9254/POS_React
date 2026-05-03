const express = require('express');
const router = express.Router();
const bnplController = require('../controllers/BnplController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', bnplController.getBnplDebtors);
router.get('/customer/:id', bnplController.getCustomerHistory);
router.post('/settle', bnplController.settlePayment);

module.exports = router;
