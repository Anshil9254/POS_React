const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/InventoryController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// All roles can read inventory and history
router.get('/', inventoryController.getAllInventory);
router.get('/history/:id', inventoryController.getStockHistory);

// Only Admin/Manager can view lowstock alerts and restock
router.get('/lowstock', roleMiddleware(['Admin', 'Manager']), inventoryController.getLowStock);
router.post('/restock/:id', roleMiddleware(['Admin', 'Manager']), inventoryController.restockProduct);

module.exports = router;
