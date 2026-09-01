const mongoose = require('mongoose');

async function connectDB(MONGO_URI = 'mongodb://127.0.0.1:27017/scarlata') {
    await mongoose.connect(MONGO_URI);
}

module.exports = connectDB;
