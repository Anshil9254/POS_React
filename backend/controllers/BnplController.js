const { Bill, BillItem, Customer, User, Store, Payment } = require('../models');
const { Op } = require('sequelize');

// GET BNPL debtors list (customers with balance > 0)
exports.getBnplDebtors = async (req, res) => {
    try {
        const { user_id, role } = req.user;

        let userWhere = {};
        if (role !== 'Admin') {
            const currentUser = await User.findByPk(user_id);
            if (currentUser && currentUser.store_id) {
                userWhere.store_id = currentUser.store_id;
            }
        }

        const bills = await Bill.findAll({
            where: { balance: { [Op.gt]: 0 }, customer_id: { [Op.ne]: null } },
            include: [
                { model: Customer },
                {
                    model: User,
                    where: Object.keys(userWhere).length ? userWhere : undefined,
                    include: [{ model: Store, attributes: ['store_id', 'store_name'] }],
                    attributes: ['user_id', 'full_name', 'store_id']
                }
            ]
        });

        // Group by customer
        const customerMap = {};
        for (const bill of bills) {
            if (!bill.Customer) continue;
            const cid = bill.customer_id;
            if (!customerMap[cid]) {
                customerMap[cid] = {
                    customer: bill.Customer,
                    totalDebt: 0,
                    storeName: bill.User?.Store?.store_name || 'N/A',
                    store_id: bill.User?.store_id
                };
            }
            customerMap[cid].totalDebt += parseFloat(bill.balance || 0);
        }

        const debtors = Object.values(customerMap).sort((a, b) => b.totalDebt - a.totalDebt);
        res.json(debtors);
    } catch (error) {
        console.error('BNPL debtors error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET customer bill history (for BNPL detail view)
exports.getCustomerHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const { store_id } = req.query;
        const { role, user_id } = req.user;

        let userWhere = {};
        if (role !== 'Admin') {
            const currentUser = await User.findByPk(user_id);
            if (currentUser && currentUser.store_id) {
                userWhere.store_id = currentUser.store_id;
            }
        } else if (store_id) {
            userWhere.store_id = store_id;
        }

        const customer = await Customer.findByPk(id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });

        const bills = await Bill.findAll({
            where: { customer_id: id },
            include: [
                {
                    model: User,
                    where: Object.keys(userWhere).length ? userWhere : undefined,
                    include: [{ model: Store }]
                },
                { model: Payment, as: 'payments' }
            ],
            order: [['created_at', 'DESC']]
        });

        // Compute total debt for this store/context
        const totalDebt = bills.reduce((sum, b) => sum + parseFloat(b.balance || 0), 0);

        // Find applicable razorpay keys
        let razorpayKeyId = null;
        let storeName = 'Admin View';

        if (bills.length > 0 && bills[0].User?.Store) {
            const store = bills[0].User.Store;
            storeName = store.store_name;
            razorpayKeyId = store.razorpay_key_id;

            if (!razorpayKeyId) {
                const manager = await User.findOne({
                    where: { store_id: store.store_id },
                    include: [{ model: require('../models').Role, where: { role_name: 'Manager' } }]
                });
                razorpayKeyId = manager?.razorpay_key_id;
            }
        }

        res.json({
            customer,
            bills,
            totalDebt,
            storeName,
            razorpayKeyId
        });
    } catch (error) {
        console.error('BNPL history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST settle payment
exports.settlePayment = async (req, res) => {
    try {
        const { billId, amount, paymentMethod, razorpayPaymentId } = req.body;
        const { role } = req.user;
        console.log('SettlePayment Request:', { billId, amount, paymentMethod, role });

        if (role !== 'Admin' && role !== 'Manager' && paymentMethod !== 'Cash') {
            return res.status(403).json({ message: 'Cashiers are restricted to Cash settlements only.' });
        }

        const bill = await Bill.findByPk(billId);
        if (!bill) return res.status(404).json({ message: 'Bill not found' });

        if (parseFloat(amount) > parseFloat(bill.balance)) {
            return res.status(400).json({ message: 'Payment amount exceeds remaining balance.' });
        }

        // Apply payment
        await Payment.create({
            bill_id: billId,
            amount: amount,
            payment_method: paymentMethod,
            transaction_id: razorpayPaymentId || null,
            payment_status: 'Completed',
            payment_date: new Date()
        });

        const newBalance = parseFloat(bill.balance) - parseFloat(amount);
        await bill.update({ balance: newBalance });

        res.json({ message: 'Payment settled successfully', newBalance });
    } catch (error) {
        console.error('BNPL settle error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
