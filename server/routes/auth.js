const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const User = require("../models/user");
const { isLoggedIn } = require("../middleware");

// No try/catch here on purpose. Catching locally and returning res.status(400) meant every
// failure looked like a bad request and echoed the raw driver text straight to the client —
// a duplicate email replied with the collection name, index name, and server address. Letting
// the error through to the central handler routes it via utils/normalizeError instead, which
// knows a taken email is a 409 and that unexpected errors should not be quoted verbatim.
router.post('/register', async (req, res, next) => {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
        if (err) return next(err);
        res.status(201).json({ user: registeredUser });
    });
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ error: info?.message || 'Invalid username/email or password' });
        req.login(user, (err) => {
            if (err) return next(err);
            res.json({ user });
        });
    })(req, res, next);
});

router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.json({ message: 'Logged out successfully' });
    });
});

router.get('/me', isLoggedIn, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
