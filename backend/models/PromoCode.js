const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PromoCode = sequelize.define('PromoCode', {
    promo_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    discount_type: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'Percentage' }, // 'Percentage' or 'Fixed'
    value: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    scope: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'Global' }, // 'Global', 'Category', 'Product'
    target_id: { type: DataTypes.INTEGER, allowNull: true },
    min_order_amount: { type: DataTypes.DECIMAL(18, 2), allowNull: true },
    max_discount_amount: { type: DataTypes.DECIMAL(18, 2), allowNull: true },
    start_date: { type: DataTypes.DATE, allowNull: false },
    end_date: { type: DataTypes.DATE, allowNull: false },
    usage_limit: { type: DataTypes.INTEGER, allowNull: true },
    usage_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    store_id: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
    tableName: 'promo_codes',
    timestamps: false
});

module.exports = PromoCode;
