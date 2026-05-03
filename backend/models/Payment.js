const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
    payment_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    bill_id: { type: DataTypes.INTEGER, allowNull: false },
    payment_method: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    payment_status: { type: DataTypes.STRING, allowNull: false },
    transaction_id: { type: DataTypes.STRING, allowNull: true },
    payment_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
    tableName: 'payments',
    timestamps: false
});

module.exports = Payment;
