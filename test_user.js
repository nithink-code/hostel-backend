
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}).limit(5);
        console.log('Recent Users:', users.map(u => ({ email: u.email, role: u.role })));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

test();
