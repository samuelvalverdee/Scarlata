const mongoose = require('mongoose');
const config = require('dotenv').config();

async function connectDB(MONGO_URI = config.MONGO_URI) {
    await mongoose.connect(MONGO_URI);
}

module.exports = connectDB;