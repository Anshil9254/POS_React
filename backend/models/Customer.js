const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
    customer_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    full_name: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.name;
        }
    }
}, {
    tableName: 'customers',
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = Customer;
