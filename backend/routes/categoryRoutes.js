const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/CategoryController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// All roles can read categories
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Only Admin/Manager can write
router.post('/', roleMiddleware(['Admin', 'Manager']), categoryController.createCategory);
router.put('/:id', roleMiddleware(['Admin', 'Manager']), categoryController.updateCategory);
router.delete('/:id', roleMiddleware(['Admin', 'Manager']), categoryController.deleteCategory);

module.exports = router;
