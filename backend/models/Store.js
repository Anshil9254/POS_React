const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Store = sequelize.define('Store', {
    store_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    store_name: { type: DataTypes.STRING(100), allowNull: false },
    address: { type: DataTypes.TEXT, allowNull: true },
    contact_number: { type: DataTypes.STRING(20), allowNull: true },
    upi_id: { type: DataTypes.STRING(50), allowNull: true },
    razorpay_key_id: { type: DataTypes.STRING(100), allowNull: true },
    razorpay_key_secret: { type: DataTypes.STRING(100), allowNull: true },
    gst_number: { type: DataTypes.STRING(50), allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
    tableName: 'stores',
    timestamps: false
});

module.exports = Store;
