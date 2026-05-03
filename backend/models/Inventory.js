const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventory = sequelize.define('Inventory', {
    inventory_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    low_stock_threshold: { type: DataTypes.INTEGER, allowNull: false },
    last_updated: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
    tableName: 'inventory',
    timestamps: false
});

module.exports = Inventory;
