require('dotenv').config();
const { Product, Category, Store } = require('./models');

async function checkDb() {
    try {
        console.log('Products Count:', await Product.count());
        console.log('Categories Count:', await Category.count());
        console.log('Stores Count:', await Store.count());
    } catch (err) {
        console.error('Error counting:', err.message);
    }
    process.exit(0);
}

checkDb();
