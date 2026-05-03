const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// All roles can read products
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Only Admin/Manager can write
router.post('/', roleMiddleware(['Admin', 'Manager']), productController.createProduct);
router.put('/:id', roleMiddleware(['Admin', 'Manager']), productController.updateProduct);
router.delete('/:id', roleMiddleware(['Admin', 'Manager']), productController.deleteProduct);

module.exports = router;
