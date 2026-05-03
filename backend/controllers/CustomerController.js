const { Customer, Bill, Payment, User } = require('../models');

// GET all customers
exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.findAll({
            include: [{ model: Bill, attributes: ['bill_id', 'total', 'balance'] }],
            order: [['created_at', 'DESC']]
        });
        res.json(customers);
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET customer by ID
exports.getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id, {
            include: [{ model: Bill, include: [{ model: Payment, as: 'payments' }] }]
        });
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET customer by phone
exports.getCustomerByPhone = async (req, res) => {
    try {
        const { phone } = req.query;
        if (!phone) return res.status(400).json({ message: 'Phone number is required' });

        const customer = await Customer.findOne({ 
            where: { phone },
            include: [{ model: Bill, attributes: ['balance'] }]
        });

        if (!customer) return res.json({ success: false });
        
        const totalDebt = customer.Bills ? customer.Bills.reduce((sum, bill) => sum + parseFloat(bill.balance || 0), 0) : 0;
        
        res.json({ success: true, customer, totalDebt });
    } catch (error) {
        console.error('Get customer by phone error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// POST create customer
exports.createCustomer = async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;

        if (!name) return res.status(400).json({ message: 'Name is required' });

        if (phone) {
            const existing = await Customer.findOne({ where: { phone } });
            if (existing) return res.status(400).json({ message: 'Customer with this phone already exists' });
        }

        const customer = await Customer.create({ name, phone, email, address });
        res.status(201).json({ message: 'Customer created successfully', customer });
    } catch (error) {
        console.error('Create customer error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT update customer
exports.updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, email, address } = req.body;

        const customer = await Customer.findByPk(id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });

        await customer.update({ name, phone, email, address });
        res.json({ message: 'Customer updated successfully', customer });
    } catch (error) {
        console.error('Update customer error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE customer
exports.deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        await customer.destroy();
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
