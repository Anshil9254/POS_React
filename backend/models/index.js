const sequelize = require('../config/database');
const Category = require('./Category');
const Role = require('./Role');
const Product = require('./Product');
const User = require('./User');
const Inventory = require('./Inventory');
const StockLog = require('./StockLog');
const Bill = require('./Bill');
const BillItem = require('./BillItem');
const Payment = require('./Payment');
const Customer = require('./Customer');
const PromoCode = require('./PromoCode');
const Store = require('./Store');

// Associations

// Product & Category
Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

// User & Role
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

// User & Store
Store.hasMany(User, { foreignKey: 'store_id' });
User.belongsTo(Store, { foreignKey: 'store_id' });

// Inventory & Product
Product.hasOne(Inventory, { foreignKey: 'product_id' });
Inventory.belongsTo(Product, { foreignKey: 'product_id' });

// StockLog & Product
Product.hasMany(StockLog, { foreignKey: 'product_id' });
StockLog.belongsTo(Product, { foreignKey: 'product_id' });

// Bill & User
User.hasMany(Bill, { foreignKey: 'user_id' });
Bill.belongsTo(User, { foreignKey: 'user_id' });

// Bill & Customer
Customer.hasMany(Bill, { foreignKey: 'customer_id' });
Bill.belongsTo(Customer, { foreignKey: 'customer_id' });

// BillItem & Bill
Bill.hasMany(BillItem, { foreignKey: 'bill_id', as: 'items' });
BillItem.belongsTo(Bill, { foreignKey: 'bill_id' });

// BillItem & Product
Product.hasMany(BillItem, { foreignKey: 'product_id' });
BillItem.belongsTo(Product, { foreignKey: 'product_id' });

// Payment & Bill
Bill.hasMany(Payment, { foreignKey: 'bill_id', as: 'payments' });
Payment.belongsTo(Bill, { foreignKey: 'bill_id' });

// Product & Store (optional scoping)
Store.hasMany(Product, { foreignKey: 'store_id' });
Product.belongsTo(Store, { foreignKey: 'store_id' });

// PromoCode & Store
Store.hasMany(PromoCode, { foreignKey: 'store_id' });
PromoCode.belongsTo(Store, { foreignKey: 'store_id' });

module.exports = {
    sequelize,
    Category,
    Role,
    Product,
    User,
    Inventory,
    StockLog,
    Bill,
    BillItem,
    Payment,
    Customer,
    PromoCode,
    Store
};
