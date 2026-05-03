const { User, Role, Store } = require('../models');

// GET all staff
exports.getAllStaff = async (req, res) => {
    try {
        const { user_id, role } = req.user;

        let whereClause = {};
        const includeStore = { model: Store, attributes: ['store_id', 'store_name'] };

        if (role === 'Manager') {
            // Manager sees only users in their own store
            const currentUser = await User.findByPk(user_id);
            if (currentUser && currentUser.store_id) {
                whereClause.store_id = currentUser.store_id;
            }
        }

        const staff = await User.findAll({
            where: whereClause,
            include: [
                { model: Role, attributes: ['role_id', 'role_name'] },
                includeStore
            ],
            order: [['full_name', 'ASC']]
        });

        res.json(staff);
    } catch (error) {
        console.error('Get staff error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET staff by ID
exports.getStaffById = async (req, res) => {
    try {
        const staff = await User.findByPk(req.params.id, {
            include: [
                { model: Role, attributes: ['role_id', 'role_name'] },
                { model: Store, attributes: ['store_id', 'store_name'] }
            ]
        });
        if (!staff) return res.status(404).json({ message: 'Staff not found' });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST create staff
exports.createStaff = async (req, res) => {
    try {
        const { full_name, email, password, role_id, store_id, razorpay_key_id, razorpay_key_secret } = req.body;
        const { user_id, role } = req.user;

        if (!full_name || !email || !password || !role_id) {
            return res.status(400).json({ message: 'Full name, email, password, and role are required' });
        }

        if (role === 'Manager') {
            const targetRole = await Role.findByPk(role_id);
            if (targetRole && (targetRole.role_name === 'Admin' || targetRole.role_name === 'Manager')) {
                return res.status(403).json({ message: 'Managers can only create Cashier staff' });
            }
        }

        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const password_hash = password; // Save plaintext password

        let final_store_id = store_id || null;
        if (role === 'Manager') {
            const currentUser = await User.findByPk(user_id);
            final_store_id = currentUser.store_id; // force Manager's own store
        }

        const user = await User.create({
            full_name,
            email,
            password_hash,
            role_id,
            store_id: final_store_id,
            razorpay_key_id: razorpay_key_id || null,
            razorpay_key_secret: razorpay_key_secret || null,
            is_active: 1
        });

        res.status(201).json({ message: 'Staff created successfully', user });
    } catch (error) {
        console.error('Create staff error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// PUT update staff
exports.updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, email, password, role_id, store_id, is_active, razorpay_key_id, razorpay_key_secret } = req.body;
        const { user_id, role } = req.user;

        const user = await User.findByPk(id, { include: [{ model: Role }] });
        if (!user) return res.status(404).json({ message: 'Staff not found' });

        if (role === 'Manager') {
            if (user.Role && (user.Role.role_name === 'Admin' || (user.Role.role_name === 'Manager' && parseInt(id) !== user_id))) {
                return res.status(403).json({ message: 'Managers cannot edit Admins or other Managers' });
            }
            
            // Optionally, prevent Manager from elevating role to Admin or Manager
            const targetRole = await Role.findByPk(role_id);
            if (targetRole && (targetRole.role_name === 'Admin' || targetRole.role_name === 'Manager') && parseInt(id) !== user_id) {
                return res.status(403).json({ message: 'Managers can only assign Cashier roles to staff' });
            }
        }

        const updateData = {
            full_name: full_name || user.full_name,
            email: email || user.email,
            role_id: role_id || user.role_id,
            store_id: store_id !== undefined ? (store_id === '' ? null : store_id) : user.store_id,
            is_active: is_active !== undefined ? (is_active ? 1 : 0) : user.is_active,
            razorpay_key_id: razorpay_key_id !== undefined ? razorpay_key_id : user.razorpay_key_id,
            razorpay_key_secret: razorpay_key_secret !== undefined ? razorpay_key_secret : user.razorpay_key_secret
        };

        if (password) {
            updateData.password_hash = password; // Save plaintext password
        }

        await user.update(updateData);
        res.json({ message: 'Staff updated successfully', user });
    } catch (error) {
        console.error('Update staff error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE staff
exports.deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, role } = req.user;

        if (parseInt(id) === user_id) {
            return res.status(400).json({ message: 'You cannot delete yourself' });
        }

        const user = await User.findByPk(id, { include: [{ model: Role }] });
        if (!user) return res.status(404).json({ message: 'Staff not found' });

        // Manager cannot delete Admin or other Managers
        if (role === 'Manager') {
            if (user.Role && (user.Role.role_name === 'Admin' || user.Role.role_name === 'Manager')) {
                return res.status(403).json({ message: 'Managers cannot delete Admins or other Managers' });
            }
        }

        await user.destroy();
        res.json({ message: 'Staff deleted successfully' });
    } catch (error) {
        console.error('Delete staff error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET all roles
exports.getRoles = async (req, res) => {
    try {
        const roles = await Role.findAll({ order: [['role_name', 'ASC']] });
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
