const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    full_name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role_id: { type: DataTypes.INTEGER, allowNull: false },
    store_id: { type: DataTypes.INTEGER, allowNull: true },
    razorpay_key_id: { type: DataTypes.STRING, allowNull: true },
    razorpay_key_secret: { type: DataTypes.STRING, allowNull: true },
    is_active: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    otp: { type: DataTypes.STRING, allowNull: true },
    otp_expiry: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
    tableName: 'users',
    timestamps: false
});

module.exports = User;
