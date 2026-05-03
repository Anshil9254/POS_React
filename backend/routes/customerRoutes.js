const express = require('express');
const router = express.Router();
const customerController = require('../controllers/CustomerController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', customerController.getAllCustomers);
router.get('/phone', customerController.getCustomerByPhone);
router.get('/:id', customerController.getCustomerById);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
