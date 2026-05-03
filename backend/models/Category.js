const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
    category_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    category_name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true }
}, {
    tableName: 'categories',
    timestamps: false
});

module.exports = Category;
