const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const sequelize = require('./config/database');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static('C:\\anshil\\New folder\\ASP.NET\\POS\\mvc\\pos_billing_system\\wwwroot\\images'));

// Main App Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/bills', require('./routes/billingRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/stores', require('./routes/storeRoutes'));
app.use('/api/promocodes', require('./routes/promoCodeRoutes'));
app.use('/api/bnpl', require('./routes/bnplRoutes'));
app.use('/api/razorpay', require('./routes/razorpayRoutes'));

const testDbConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL Database connected successfully.');

        // Sync missing models non-destructively
        await sequelize.sync();
        console.log('Database synchronized.');

        // Ensure OTP columns exist for the new Auth flow (fallback if alter fails on specific constraints)
        try {
            await sequelize.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp VARCHAR(255);');
            await sequelize.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP WITH TIME ZONE;');
        } catch (e) {
            console.log('OTP columns might already exist or error altering table:', e.message);
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}.`);
    await testDbConnection();
});
