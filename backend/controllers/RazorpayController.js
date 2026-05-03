const Razorpay = require('razorpay');
const { Store, User, Role } = require('../models');

exports.createOrder = async (req, res) => {
    try {
        const { amount } = req.body; // Amount in INR rupees (we will convert to paise)
        const { user_id, role } = req.user;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Valid amount is required' });
        }

        let razorpayKeyId = null;
        let razorpayKeySecret = null;
        let storeName = 'POS System'; // default fallback

        // Get user details to find associated store
        const currentUser = await User.findByPk(user_id, {
            include: [{ model: Store }]
        });

        if (currentUser && currentUser.store_id && currentUser.Store) {
            const store = currentUser.Store;
            storeName = store.store_name;
            razorpayKeyId = store.razorpay_key_id;
            razorpayKeySecret = store.razorpay_key_secret;

            // Priority 2: Manager Razorpay Key if Store doesn't have one
            if (!razorpayKeyId || !razorpayKeySecret) {
                const manager = await User.findOne({
                    where: { store_id: store.store_id },
                    include: [{ model: Role, where: { role_name: 'Manager' } }]
                });

                if (manager && manager.razorpay_key_id && manager.razorpay_key_secret) {
                    razorpayKeyId = manager.razorpay_key_id;
                    razorpayKeySecret = manager.razorpay_key_secret;
                }
            }
        }

        if (!razorpayKeyId || !razorpayKeySecret) {
             console.error(`Razorpay keys missing for Store ID: ${currentUser?.store_id}`);
             return res.status(400).json({ message: 'Razorpay keys not configured for your store. Please contact admin.' });
        }

        // Initialize Razorpay
        const razorpay = new Razorpay({
            key_id: razorpayKeyId,
            key_secret: razorpayKeySecret
        });

        const options = {
            amount: Math.round(amount * 100), // convert to paise
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: razorpayKeyId, // Send key ID to frontend
            storeName: storeName
        });
    } catch (error) {
        console.error('Razorpay Create Order Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create payment order.' });
    }
};
