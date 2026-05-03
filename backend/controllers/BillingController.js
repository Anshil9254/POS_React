const { Bill, BillItem, Payment, Inventory, Product, Customer, User, Store, sequelize, PromoCode } = require('../models');

exports.createBill = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { items, subtotal, tax, total, payment_method, amount_paid, customer_id, promo_code, discount_amount } = req.body;
        const user_id = req.user.user_id;

        // Generate bill number (e.g. INV-YYMMDD-XXXX)
        const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const count = await Bill.count() + 1;
        const bill_number = `INV-${dateStr}-${count.toString().padStart(4, '0')}`;

        const isBnpl = payment_method === 'BNPL';
        // Auto-fix amount for BNPL if it comes as total
        let paid = amount_paid !== undefined ? parseFloat(amount_paid) : parseFloat(total);
        if (isBnpl && paid === parseFloat(total)) {
            paid = 0; // If BNPL is selected and amount is full, assume 0 paid.
        }
        
        const balance = parseFloat(total) - paid;
        const userRole = req.user.role; // Verify we have this via token

        // Validate Partial Payment
        if (paid < parseFloat(total)) {
            if (userRole !== 'Admin' && userRole !== 'Manager' && !isBnpl) {
                return res.status(403).json({ message: 'Partial payments are restricted to Admins and Managers. Cashiers must collect full payment or use BNPL.' });
            }
            if (!customer_id) {
                return res.status(400).json({ message: 'Customer selection is mandatory for Partial Payments (Credit).' });
            }
        }

        // Validate BNPL
        if (isBnpl && !customer_id) {
            return res.status(400).json({ message: 'Customer is required for BNPL payment' });
        }

        // 1. Create Bill
        const bill = await Bill.create({
            bill_number,
            user_id,
            customer_id: customer_id || null,
            subtotal,
            tax,
            total,
            paid_amount: paid,
            balance: balance > 0 ? balance : 0,
            created_at: new Date()
        }, { transaction: t });

        // 2. Create Bill Items & Update Inventory
        for (let item of items) {
            await BillItem.create({
                bill_id: bill.bill_id,
                product_id: item.product_id,
                price: item.price,
                quantity: item.quantity,
                total: item.total
            }, { transaction: t });

            const inventory = await Inventory.findOne({ where: { product_id: item.product_id }, transaction: t });
            if (inventory) {
                if (inventory.quantity < item.quantity) {
                    throw new Error(`Insufficient stock for product ID ${item.product_id}`);
                }
                inventory.quantity -= item.quantity;
                await inventory.save({ transaction: t });
            }
        }

        // 3. Create Payment record
        await Payment.create({
            bill_id: bill.bill_id,
            payment_method: payment_method || 'Cash',
            amount: paid,
            transaction_id: req.body.razorpay_payment_id || null,
            payment_status: balance > 0 ? 'Pending' : 'Completed',
            payment_date: new Date()
        }, { transaction: t });

        // 4. Handle Promo Code usage
        if (promo_code) {
            const promo = await PromoCode.findOne({ where: { code: promo_code.toUpperCase() }, transaction: t });
            if (promo) {
                promo.usage_count = (promo.usage_count || 0) + 1;
                await promo.save({ transaction: t });
            }
        }

        await t.commit();
        res.status(201).json({ message: 'Bill created successfully', bill, billId: bill.bill_id, billNumber: bill.bill_number });
    } catch (error) {
        await t.rollback();
        console.error('Billing error:', error);
        res.status(500).json({ message: error.message || 'Error processing bill' });
    }
};

exports.getBills = async (req, res) => {
    try {
        const bills = await Bill.findAll({
            include: [
                { model: BillItem, include: [Product] },
                { model: Payment, as: 'payments' },
                { model: Customer },
                { model: User, include: [{ model: Store }] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(bills);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getInvoice = async (req, res) => {
    try {
        const bill = await Bill.findByPk(req.params.id, {
            include: [
                { model: BillItem, include: [Product] },
                { model: Payment, as: 'payments' },
                { model: Customer },
                { model: User, include: [{ model: Store }] }
            ]
        });
        if (!bill) return res.status(404).json({ message: 'Bill not found' });
        res.json(bill);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
