require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = jwt.sign(
    { user_id: 2, role: 'Cashier', store_id: 1 },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '1h' }
);

console.log('--- TOKEN START ---');
console.log(token);
console.log('--- TOKEN END ---');

// Try a fetch request to products with this token
fetch('http://localhost:5000/api/products', {
    headers: { 'Authorization': `Bearer ${token}` }
})
    .then(res => {
        console.log('Products Status:', res.status);
        return res.json();
    })
    .then(data => {
        console.log(`Products Count: ${Array.isArray(data) ? data.length : 'Not an array'}`);

        // Try categories
        return fetch('http://localhost:5000/api/categories', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    })
    .then(res => {
        console.log('Categories Status:', res.status);
        return res.json();
    })
    .then(data => {
        console.log(`Categories Count: ${Array.isArray(data) ? data.length : 'Not an array'}`);
    })
    .catch(err => console.error(err));
