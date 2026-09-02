require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db/connection');
const { MongoStore } = require('connect-mongo');

const session = require("express-session");
const passport = require("./config/passport");

const ExpressError = require('./utils/ExpressError');
const normalizeError = require('./utils/normalizeError');
const authRouter = require('./routes/auth');
const spotsRouter = require('./routes/spots');

const app = express();

async function main() {
    await connectDB(process.env.MONGO_URI);
}

main().catch((err) => console.log(`Connection error: ${err}`));

// *********************************************************************
app.use(cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
}));

app.use(express.json());

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      touchAfter: 24 * 3600, // only re-save an unchanged session once a day
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // Cookie expires in 24 hours
      secure: process.env.NODE_ENV === 'production', // HTTPS-only once actually deployed; plain http in dev
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// *********************************************************************
app.get('/', (req, res) => {
    res.send('Scarlata API running.');
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/spots', spotsRouter);

app.use((req, res, next) => {
    next(new ExpressError('Page not found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode, message, details } = normalizeError(err);
    // A 5xx means we did not anticipate this one — it still has to be visible to us on the
    // server even though the client only gets a generic message back.
    if (statusCode >= 500) console.error(err);
    res.status(statusCode).json({ error: message, ...(details && { details }) });
});

app.listen(3001, () => {
    console.log('Scarlata API listening on port 3001');
});
