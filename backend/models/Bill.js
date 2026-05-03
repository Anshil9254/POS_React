const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bill = sequelize.define('Bill', {
    bill_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    bill_number: { type: DataTypes.STRING, allowNull: false, unique: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    customer_id: { type: DataTypes.INTEGER, allowNull: true },
    subtotal: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    tax: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    discount: { type: DataTypes.DECIMAL(18, 2), allowNull: true },
    total: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    paid_amount: { type: DataTypes.DECIMAL(18, 2), allowNull: true },
    balance: { type: DataTypes.DECIMAL(18, 2), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
    tableName: 'bills',
    timestamps: false
});

module.exports = Bill;
