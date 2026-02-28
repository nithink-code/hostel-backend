
require('dotenv').config();
const mongoose = require('mongoose');
const Announcement = require('./models/Announcement');
const User = require('./models/User');

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const anns = await Announcement.find({}).populate('createdBy', 'name role');
        console.log('Announcements:', anns.map(a => ({ title: a.title, creator: a.createdBy?.name, role: a.createdBy?.role })));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

test();
