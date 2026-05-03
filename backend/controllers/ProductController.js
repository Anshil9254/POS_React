const { Product, Category, Inventory } = require('../models');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [
                { model: Category, attributes: ['category_name'] },
                { model: Inventory, attributes: ['quantity'] }
            ]
        });
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                { model: Category, attributes: ['category_name'] },
                { model: Inventory, attributes: ['quantity', 'low_stock_threshold'] }
            ]
        });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        const qty = req.body.quantity !== undefined ? parseInt(req.body.quantity) : 0;

        await Inventory.create({
            product_id: product.product_id,
            quantity: qty,
            low_stock_threshold: req.body.low_stock_threshold || 5
        });

        // Log initial stock
        if (qty > 0) {
            await require('../models').StockLog.create({
                product_id: product.product_id,
                quantity_changed: qty,
                note: 'Initial stock',
                changed_by: req.user ? req.user.user_id : null,
                created_at: new Date()
            });
        }

        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: 'Error creating product', error });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        await product.update(req.body);

        // Update inventory threshold if provided
        if (req.body.low_stock_threshold !== undefined) {
            const inventory = await Inventory.findOne({ where: { product_id: product.product_id } });
            if (inventory) {
                await inventory.update({ low_stock_threshold: req.body.low_stock_threshold });
            }
        }

        res.json(product);
    } catch (error) {
        res.status(400).json({ message: 'Error updating product', error });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Must delete dependent records first
        await Inventory.destroy({ where: { product_id: product.product_id } });
        await require('../models').StockLog.destroy({ where: { product_id: product.product_id } });

        await product.destroy();
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
};
