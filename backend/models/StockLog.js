const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockLog = sequelize.define('StockLog', {
    log_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    change_type: { type: DataTypes.STRING, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    remarks: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
    tableName: 'stock_logs',
    timestamps: false
});

module.exports = StockLog;
