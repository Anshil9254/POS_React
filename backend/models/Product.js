const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    product_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_name: { type: DataTypes.STRING, allowNull: false },
    sku: { type: DataTypes.STRING, allowNull: false, unique: true },
    category_id: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    image_url: { type: DataTypes.STRING, allowNull: false },
    is_active: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
    tableName: 'products',
    timestamps: false
});

module.exports = Product;
