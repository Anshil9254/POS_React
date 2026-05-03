const { Inventory, Product, Category, StockLog, User } = require('../models');
const { Op } = require('sequelize');

// GET all inventory
exports.getAllInventory = async (req, res) => {
    try {
        const { search, categoryId, status } = req.query;
        const { user_id, role } = req.user;

        let productWhere = {};
        let inventoryWhere = {};

        // Store scoping for non-Admin
        if (role !== 'Admin') {
            const currentUser = await User.findByPk(user_id);
            if (currentUser && currentUser.store_id) {
                productWhere.store_id = currentUser.store_id;
            }
        }

        if (search) {
            productWhere[Op.or] = [
                { product_name: { [Op.iLike]: `%${search}%` } },
                { sku: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (categoryId) {
            productWhere.category_id = categoryId;
        }

        let inventory = await Inventory.findAll({
            where: inventoryWhere,
            include: [
                {
                    model: Product,
                    where: productWhere,
                    include: [{ model: Category, attributes: ['category_name'] }]
                }
            ],
            order: [[Product, 'product_name', 'ASC']]
        });

        // Apply status filter
        if (status === 'instock') {
            inventory = inventory.filter(i => i.quantity > i.low_stock_threshold);
        } else if (status === 'lowstock') {
            inventory = inventory.filter(i => i.quantity > 0 && i.quantity <= i.low_stock_threshold);
        } else if (status === 'outofstock') {
            inventory = inventory.filter(i => i.quantity === 0);
        }

        // Compute stats
        const totalStock = inventory.reduce((sum, i) => sum + i.quantity, 0);
        const lowStockCount = inventory.filter(i => i.quantity > 0 && i.quantity <= i.low_stock_threshold).length;
        const outOfStockCount = inventory.filter(i => i.quantity === 0).length;

        res.json({ inventory, totalStock, lowStockCount, outOfStockCount });
    } catch (error) {
        console.error('Get inventory error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET low stock items
exports.getLowStock = async (req, res) => {
    try {
        const { user_id, role } = req.user;
        let productWhere = {};

        if (role !== 'Admin') {
            const currentUser = await User.findByPk(user_id);
            if (currentUser && currentUser.store_id) {
                productWhere.store_id = currentUser.store_id;
            }
        }

        const inventory = await Inventory.findAll({
            include: [{ model: Product, where: productWhere }]
        });

        const lowStock = inventory.filter(i => i.quantity > 0 && i.quantity <= i.low_stock_threshold);
        res.json(lowStock);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST restock a product
exports.restockProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, note } = req.body;
        const { user_id } = req.user;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Quantity must be a positive number' });
        }

        const inventory = await Inventory.findOne({ where: { product_id: id } });
        if (!inventory) return res.status(404).json({ message: 'Inventory not found for this product' });

        const previousQty = inventory.quantity;
        const newQty = previousQty + parseInt(quantity);

        await inventory.update({ quantity: newQty });

        // Log the restock
        await StockLog.create({
            product_id: id,
            quantity_changed: parseInt(quantity),
            note: note || 'Manual restock',
            changed_by: user_id,
            created_at: new Date()
        });

        res.json({ message: 'Stock restocked successfully', previousQty, newQty });
    } catch (error) {
        console.error('Restock error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET stock log history for a product
exports.getStockHistory = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const logs = await StockLog.findAll({
            where: { product_id: id },
            order: [['created_at', 'DESC']]
        });

        res.json({ product, logs });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
