const mongoose = require('mongoose');
require('dotenv').config();

// dotenv.config() returns `{ parsed, error }`. It does *not* return the variables. It puts
// them on process.env. The default argument has to read from there, or every caller that
// relies on it (the seed script) connects to `undefined`. app.js happened to work only
// because it passes process.env.MONGO_URI explicitly.
async function connectDB(MONGO_URI = process.env.MONGO_URI) {
    if (!MONGO_URI) {
        throw new Error('MONGO_URI is not set. Copy server/.env.example to server/.env');
    }
    await mongoose.connect(MONGO_URI);
}

module.exports = connectDB;
