const { sequelize } = require('./models');

const testDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        // Don't sync, just test definitions
        console.log('Models loaded successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

testDb();
