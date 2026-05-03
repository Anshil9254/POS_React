const { Product, Inventory, Bill, BillItem, User, Payment } = require('../models');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res) => {
    try {
        const { user_id, role } = req.user;

        let productWhere = {};
        let billWhere = {};
        let userWhere = {};

        if (role !== 'Admin') {
            const currentUser = await User.findByPk(user_id);
            if (currentUser && currentUser.store_id) {
                productWhere.store_id = currentUser.store_id;
                userWhere.store_id = currentUser.store_id;
            }
        }

        // 1. Total Products
        const totalProducts = await Product.count({ where: productWhere });

        // 2. Low Stock Count
        const inventory = await Inventory.findAll({
            include: [{ model: Product, where: productWhere }]
        });
        const lowStockProducts = inventory.filter(i => i.quantity > 0 && i.quantity <= i.low_stock_threshold).length;

        // 3. Today's Sales & Transactions
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const todayBills = await Bill.findAll({
            where: {
                created_at: { [Op.between]: [startOfDay, endOfDay] }
            },
            include: [{ model: User, where: Object.keys(userWhere).length ? userWhere : undefined, required: true }]
        });

        const todaySales = todayBills.reduce((sum, b) => sum + parseFloat(b.total || 0), 0);
        const todayTransactions = todayBills.length;

        // 4. Recent Sales (Top 5)
        const recentSalesRaw = await Bill.findAll({
            where: billWhere, // no date filter, just recent global/store
            include: [
                { model: User, where: Object.keys(userWhere).length ? userWhere : undefined, required: true },
                { model: Payment, as: 'payments' }
            ],
            order: [['created_at', 'DESC']],
            limit: 5
        });

        const recentSales = recentSalesRaw.map(b => {
            const timeStr = new Date(b.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            return {
                id: b.bill_id,
                billNumber: b.bill_number,
                total: parseFloat(b.total),
                paymentMethod: b.payments && b.payments.length > 0 ? b.payments[0].payment_method : 'Unpaid',
                time: timeStr
            };
        });

        // 5. Low Stock Alerts (Top 5 items)
        const lowStockAlerts = inventory
            .filter(i => i.quantity > 0 && i.quantity <= i.low_stock_threshold)
            .slice(0, 5)
            .map(i => ({
                id: i.product_id,
                productName: i.Product ? i.Product.product_name : 'Unknown Product',
                sku: i.Product ? i.Product.sku : 'N/A',
                currentStock: i.quantity
            }));

        res.json({
            totalProducts,
            lowStockProducts,
            todaySales,
            todayTransactions,
            recentSales,
            lowStockAlerts
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
