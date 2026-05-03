const express = require('express');
const router = express.Router();
const promoCodeController = require('../controllers/PromoCodeController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.use(roleMiddleware(['Admin', 'Manager']));

router.get('/', promoCodeController.getAllPromoCodes);
router.get('/form-data', promoCodeController.getFormData); // For dropdowns
router.get('/:id', promoCodeController.getPromoCodeById);
router.post('/', promoCodeController.createPromoCode);
router.put('/:id', promoCodeController.updatePromoCode);
router.post('/toggle/:id', promoCodeController.toggleStatus);

module.exports = router;
