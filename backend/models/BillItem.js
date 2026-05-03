const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BillItem = sequelize.define('BillItem', {
    bill_item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    bill_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    total: { type: DataTypes.DECIMAL(18, 2), allowNull: false }
}, {
    tableName: 'bill_items',
    timestamps: false
});

module.exports = BillItem;
