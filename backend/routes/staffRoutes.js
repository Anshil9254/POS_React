const express = require('express');
const router = express.Router();
const staffController = require('../controllers/StaffController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.use(roleMiddleware(['Admin', 'Manager']));

router.get('/', staffController.getAllStaff);
router.get('/roles', staffController.getRoles);
router.get('/:id', staffController.getStaffById);
router.post('/', staffController.createStaff);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);

module.exports = router;
