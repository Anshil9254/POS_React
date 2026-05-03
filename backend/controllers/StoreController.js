const { Store, User, Role } = require('../models');

// GET all stores (Admin only)
exports.getAllStores = async (req, res) => {
    try {
        const stores = await Store.findAll({
            include: [{ model: User, include: [{ model: Role, attributes: ['role_name'] }], attributes: ['user_id', 'full_name', 'email', 'is_active'] }],
            order: [['store_name', 'ASC']]
        });
        res.json(stores);
    } catch (error) {
        console.error('Get stores error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET store by ID
exports.getStoreById = async (req, res) => {
    try {
        const store = await Store.findByPk(req.params.id, {
            include: [{ model: User, include: [{ model: Role }] }]
        });
        if (!store) return res.status(404).json({ message: 'Store not found' });
        res.json(store);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST create store + manager
exports.createStore = async (req, res) => {
    try {
        const { store_name, address, contact_number, gst_number, razorpay_key_id, razorpay_key_secret, is_active,
            manager_name, manager_email, manager_password } = req.body;

        if (!store_name) return res.status(400).json({ message: 'Store name is required' });

        // Create store
        const store = await Store.create({
            store_name, address, contact_number, gst_number,
            razorpay_key_id: razorpay_key_id || null,
            razorpay_key_secret: razorpay_key_secret || null,
            is_active: is_active !== undefined ? is_active : true
        });

        // Create manager if provided
        if (manager_name && manager_email && manager_password) {
            const managerRole = await Role.findOne({ where: { role_name: 'Manager' } });
            if (managerRole) {
                const password_hash = manager_password; // Save plaintext password
                await User.create({
                    full_name: manager_name,
                    email: manager_email,
                    password_hash,
                    role_id: managerRole.role_id,
                    store_id: store.store_id,
                    is_active: true
                });
            }
        }

        res.status(201).json({ message: 'Store created successfully', store });
    } catch (error) {
        console.error('Create store error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// PUT update store
exports.updateStore = async (req, res) => {
    try {
        const { id } = req.params;
        const { store_name, address, contact_number, gst_number, razorpay_key_id, razorpay_key_secret, is_active } = req.body;

        const store = await Store.findByPk(id);
        if (!store) return res.status(404).json({ message: 'Store not found' });

        await store.update({ store_name, address, contact_number, gst_number, razorpay_key_id, razorpay_key_secret, is_active });
        res.json({ message: 'Store updated successfully', store });
    } catch (error) {
        console.error('Update store error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
