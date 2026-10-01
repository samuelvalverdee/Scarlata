const express = require('express');
// mergeParams: mounted at /spots/:id/logs, so :id belongs to the parent.
const router = express.Router({ mergeParams: true });
const SpotEntry = require('../models/spotEntry');
const ExpressError = require('../utils/ExpressError');
const schemas = require('../schemas');
const { isLoggedIn, findSpot, hasVisited, validate } = require('../middleware');

// Visit logs are the user's own record of a trip, so unlike reviews they are private to the
// owner: every route here reads and writes through the caller's own SpotEntry, and there is
// no way to name someone else's. Admins see photos (not logs) through GET /spots/:id/log-photos.

router.get('/', isLoggedIn, findSpot, async (req, res) => {
    // No hasVisited: someone who has only marked the spot 'want' simply has no logs yet, which
    // is an empty list, not a 403.
    const entry = await SpotEntry.findOne({
        user: req.user._id,
        spot: req.spot._id,
    });
    res.json(entry?.logs ?? []);
});

// The log schemas are built from req.spot (a log can only list that spot's activities), so
// validate takes a function of req and runs after findSpot. Bodies arrive bare or wrapped as
// { log: {...} }. PUT sets only the keys that were sent, so it never wipes fields it didn't name.
router.post(
    '/',
    isLoggedIn,
    findSpot,
    hasVisited,
    validate((req) => schemas.logCreate(req.spot), { unwrap: 'log' }),
    async (req, res) => {
        req.spotEntry.logs.push(req.body);
        await req.spotEntry.save();
        res.status(201).json(req.spotEntry.logs.at(-1));
    },
);

router.put(
    '/:logId',
    isLoggedIn,
    findSpot,
    hasVisited,
    validate((req) => schemas.logUpdate(req.spot), { unwrap: 'log' }),
    async (req, res) => {
        const log = req.spotEntry.logs.id(req.params.logId);
        if (!log) throw new ExpressError('Log not found', 404);

        log.set(req.body);
        await req.spotEntry.save();
        res.json(log);
    },
);

router.delete('/:logId', isLoggedIn, findSpot, hasVisited, async (req, res) => {
    const log = req.spotEntry.logs.id(req.params.logId);
    if (!log) throw new ExpressError('Log not found', 404);

    log.deleteOne();
    await req.spotEntry.save();
    res.status(204).send();
});

module.exports = router;
