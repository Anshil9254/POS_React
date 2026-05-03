const { Category, Product } = require('../models');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        // Calculate product counts
        const products = await Product.findAll();

        const enhancedCategories = categories.map(cat => {
            const count = products.filter(p => p.category_id === cat.category_id).length;
            return {
                ...cat.toJSON(),
                productCount: count
            };
        });

        res.json(enhancedCategories);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: 'Error creating category', error });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        await category.update(req.body);
        res.json(category);
    } catch (error) {
        res.status(400).json({ message: 'Error updating category', error });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        await category.destroy();
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Cannot delete category in use', error: error.message });
    }
};
