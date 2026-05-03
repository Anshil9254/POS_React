const express = require('express');
const router = express.Router();
const storeController = require('../controllers/StoreController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.use(roleMiddleware(['Admin']));

router.get('/', storeController.getAllStores);
router.get('/:id', storeController.getStoreById);
router.post('/', storeController.createStore);
router.put('/:id', storeController.updateStore);

module.exports = router;
