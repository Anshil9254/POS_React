const { Bill, BillItem, Product, Category, User, Store, Inventory, Payment } = require('../models');
const { Op } = require('sequelize');

const getStoreWhere = async (user, storeIdParam) => {
    if (user.role === 'Admin') {
        return storeIdParam ? { store_id: storeIdParam } : {};
    } else {
        const currentUser = await User.findByPk(user.user_id);
        return currentUser && currentUser.store_id ? { store_id: currentUser.store_id } : {};
    }
};

// GET daily report
exports.getDailyReport = async (req, res) => {
    try {
        const { date, storeId } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

        const userWhere = await getStoreWhere(req.user, storeId);

        const bills = await Bill.findAll({
            where: { created_at: { [Op.between]: [startOfDay, endOfDay] } },
            include: [
                { model: User, where: Object.keys(userWhere).length ? userWhere : undefined, attributes: ['full_name', 'user_id'] },
                { model: BillItem, as: 'items' },
                { model: Payment, as: 'payments' }
            ]
        });

        const totalSales = bills.reduce((sum, b) => sum + parseFloat(b.total || 0), 0);
        const totalTax = bills.reduce((sum, b) => sum + parseFloat(b.tax || 0), 0);
        const totalBills = bills.length;

        // Compile payment methods from the bills we already fetched
        const paymentsByMethod = {};
        bills.forEach(bill => {
            if (bill.payments) {
                bill.payments.forEach(p => {
                    paymentsByMethod[p.payment_method] = (paymentsByMethod[p.payment_method] || 0) + parseFloat(p.amount || 0);
                });
            }
        });

        res.json({ totalSales, totalTax, totalBills, paymentsByMethod, bills });
    } catch (error) {
        console.error('Daily report error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET monthly report
exports.getMonthlyReport = async (req, res) => {
    try {
        const { year, month, storeId } = req.query;
        const targetYear = year ? parseInt(year) : new Date().getFullYear();
        const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();

        const startOfMonth = new Date(targetYear, targetMonth, 1);
        const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

        const userWhere = await getStoreWhere(req.user, storeId);

        const bills = await Bill.findAll({
            where: { created_at: { [Op.between]: [startOfMonth, endOfMonth] } },
            include: [
                { model: User, where: Object.keys(userWhere).length ? userWhere : undefined, attributes: ['full_name', 'user_id'] },
                { model: BillItem, as: 'items' },
                { model: Payment, as: 'payments' }
            ]
        });

        const totalSales = bills.reduce((sum, b) => sum + parseFloat(b.total || 0), 0);
        const totalTax = bills.reduce((sum, b) => sum + parseFloat(b.tax || 0), 0);
        const totalBills = bills.length;

        // Compile payment methods from fetched bills
        const paymentsByMethod = {};
        bills.forEach(bill => {
            if (bill.payments) {
                bill.payments.forEach(p => {
                    paymentsByMethod[p.payment_method] = (paymentsByMethod[p.payment_method] || 0) + parseFloat(p.amount || 0);
                });
            }
        });

        res.json({ totalSales, totalTax, totalBills, paymentsByMethod, bills });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET custom date range report
exports.getCustomReport = async (req, res) => {
    try {
        const { startDate, endDate, storeId } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required' });
        }

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const userWhere = await getStoreWhere(req.user, storeId);

        const bills = await Bill.findAll({
            where: { created_at: { [Op.between]: [start, end] } },
            include: [
                { model: User, where: Object.keys(userWhere).length ? userWhere : undefined, attributes: ['full_name', 'user_id'] },
                { model: BillItem, as: 'items' },
                { model: Payment, as: 'payments' }
            ]
        });

        const totalSales = bills.reduce((sum, b) => sum + parseFloat(b.total || 0), 0);
        const totalTax = bills.reduce((sum, b) => sum + parseFloat(b.tax || 0), 0);
        const totalBills = bills.length;

        // Compile payment methods for custom range
        const paymentsByMethod = {};
        bills.forEach(bill => {
            if (bill.payments) {
                bill.payments.forEach(p => {
                    paymentsByMethod[p.payment_method] = (paymentsByMethod[p.payment_method] || 0) + parseFloat(p.amount || 0);
                });
            }
        });

        res.json({ totalSales, totalTax, totalBills, bills, paymentsByMethod });
    } catch (error) {
        console.error('Custom report error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET stock report
exports.getStockReport = async (req, res) => {
    try {
        const { storeId } = req.query;
        // The frontend expects similar output to getAllInventory
        const { getAllInventory } = require('./InventoryController');

        // Mocking the req/res objects to reuse inventory logic
        const mockReq = { query: { status: 'all' }, user: req.user };
        // Need to pass through the specific call

        // Custom implementation for report
        let productWhere = {};
        const userWhere = await getStoreWhere(req.user, storeId);
        if (userWhere.store_id) {
            productWhere.store_id = userWhere.store_id;
        }

        const inventory = await Inventory.findAll({
            include: [
                {
                    model: Product,
                    where: productWhere,
                    include: [{ model: Category, attributes: ['category_name'] }]
                }
            ],
            order: [[Product, 'product_name', 'ASC']]
        });

        const totalValue = inventory.reduce((sum, i) => sum + (i.quantity * parseFloat(i.Product?.price || 0)), 0);

        res.json({ inventory, totalValue });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET low stock report
exports.getLowStockReport = async (req, res) => {
    try {
        const { storeId } = req.query;
        let productWhere = {};
        const userWhere = await getStoreWhere(req.user, storeId);
        if (userWhere.store_id) {
            productWhere.store_id = userWhere.store_id;
        }

        const inventory = await Inventory.findAll({
            include: [{ model: Product, where: productWhere, include: [Category] }]
        });

        const lowStock = inventory.filter(i => i.quantity > 0 && i.quantity <= i.low_stock_threshold);
        res.json(lowStock);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
