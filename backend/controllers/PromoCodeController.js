const { PromoCode, Store, User, Category, Product } = require('../models');

// GET all promo codes
exports.getAllPromoCodes = async (req, res) => {
    try {
        const { user_id, role } = req.user;
        let where = {};

        if (role === 'Manager') {
            const currentUser = await User.findByPk(user_id);
            if (currentUser && currentUser.store_id) {
                const { Op } = require('sequelize');
                where = {
                    [Op.or]: [
                        { store_id: currentUser.store_id },
                        { store_id: null }
                    ]
                };
            }
        }

        const codes = await PromoCode.findAll({
            where,
            include: [{ model: Store, attributes: ['store_name'] }],
            order: [['created_at', 'DESC']]
        });

        res.json(codes);
    } catch (error) {
        console.error('Get promo codes error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET promo code by ID
exports.getPromoCodeById = async (req, res) => {
    try {
        const promo = await PromoCode.findByPk(req.params.id);
        if (!promo) return res.status(404).json({ message: 'Promo code not found' });
        res.json(promo);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET categories and products for dropdown
exports.getFormData = async (req, res) => {
    try {
        const categories = await Category.findAll({ order: [['category_name', 'ASC']] });
        const products = await Product.findAll({ where: { is_active: true }, order: [['product_name', 'ASC']] });
        res.json({ categories, products });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST create promo code
exports.createPromoCode = async (req, res) => {
    try {
        const { user_id, role } = req.user;
        const { code, discount_type, value, scope, target_id, min_order_amount, max_discount_amount,
            start_date, end_date, usage_limit, is_active } = req.body;

        if (!code || !discount_type || !value || !scope || !start_date || !end_date) {
            return res.status(400).json({ message: 'Code, discount type, value, scope, start and end dates are required' });
        }

        const existing = await PromoCode.findOne({ where: { code: code.toUpperCase() } });
        if (existing) return res.status(400).json({ message: 'Promo code already exists' });

        let store_id = null;
        if (role === 'Manager') {
            const currentUser = await User.findByPk(user_id);
            store_id = currentUser?.store_id || null;
        }

        const promo = await PromoCode.create({
            code: code.toUpperCase(),
            discount_type,
            value,
            scope: scope || 'Global',
            target_id: target_id || null,
            min_order_amount: min_order_amount || null,
            max_discount_amount: max_discount_amount || null,
            start_date,
            end_date,
            usage_limit: usage_limit || null,
            usage_count: 0,
            is_active: is_active !== undefined ? is_active : true,
            store_id
        });

        res.status(201).json({ message: 'Promo code created successfully', promo });
    } catch (error) {
        console.error('Create promo code error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// PUT update promo code
exports.updatePromoCode = async (req, res) => {
    try {
        const { id } = req.params;
        const promo = await PromoCode.findByPk(id);
        if (!promo) return res.status(404).json({ message: 'Promo code not found' });

        const { code, discount_type, value, scope, target_id, min_order_amount, max_discount_amount,
            start_date, end_date, usage_limit, is_active } = req.body;

        await promo.update({
            code: code ? code.toUpperCase() : promo.code,
            discount_type: discount_type || promo.discount_type,
            value: value !== undefined ? value : promo.value,
            scope: scope || promo.scope,
            target_id: target_id !== undefined ? target_id : promo.target_id,
            min_order_amount: min_order_amount !== undefined ? min_order_amount : promo.min_order_amount,
            max_discount_amount: max_discount_amount !== undefined ? max_discount_amount : promo.max_discount_amount,
            start_date: start_date || promo.start_date,
            end_date: end_date || promo.end_date,
            usage_limit: usage_limit !== undefined ? usage_limit : promo.usage_limit,
            is_active: is_active !== undefined ? is_active : promo.is_active
        });

        res.json({ message: 'Promo code updated successfully', promo });
    } catch (error) {
        console.error('Update promo code error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST toggle promo code status
exports.toggleStatus = async (req, res) => {
    try {
        const promo = await PromoCode.findByPk(req.params.id);
        if (!promo) return res.status(404).json({ message: 'Promo code not found' });

        await promo.update({ is_active: !promo.is_active });
        res.json({ success: true, is_active: promo.is_active });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
