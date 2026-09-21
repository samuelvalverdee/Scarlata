const express = require('express');
// mergeParams: mounted at /spots/:id/logs, so :id belongs to the parent.
const router = express.Router({ mergeParams: true });
const SpotEntry = require('../models/spotEntry');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn, findSpot, hasVisited } = require('../middleware');

// Visit logs are the user's own record of a trip, so unlike reviews they are private to the
// owner: every route here reads and writes through the caller's own SpotEntry, and there is
// no way to name someone else's. Admins see photos (not logs) through GET /spots/:id/log-photos.

// Picks the writable fields out of a request body and checks the parts the schema can't.
// Only keys actually present are returned, so the same helper serves POST (whole log) and PUT
// (partial update) without a PUT wiping fields it didn't mention.
function logFields(body, spot) {
    const { visitedAt, activitiesDone, notes, photos } = body.log ?? body;
    const fields = {};

    if (visitedAt !== undefined) fields.visitedAt = visitedAt;
    if (notes !== undefined) fields.notes = notes;

    if (activitiesDone !== undefined) {
        if (
            !Array.isArray(activitiesDone) ||
            !activitiesDone.every((a) => spot.activityTypes.includes(a))
        ) {
            throw new ExpressError(
                `activitiesDone must be a list drawn from this spot's activities: ${spot.activityTypes.join(', ')}`,
                400,
            );
        }
        fields.activitiesDone = activitiesDone;
    }

    if (photos !== undefined) {
        // URLs only until uploads land (multer + Cloudinary). Restricted to http(s) so a log
        // can't smuggle a javascript: or data: URI into an <img src> on someone's screen.
        if (
            !Array.isArray(photos) ||
            !photos.every(
                (p) =>
                    typeof p?.url === 'string' && /^https?:\/\//i.test(p.url),
            )
        ) {
            throw new ExpressError(
                'photos must be a list of { url } with http(s) URLs',
                400,
            );
        }
        fields.photos = photos.map(({ url, filename }) => ({ url, filename }));
    }

    return fields;
}

router.get('/', isLoggedIn, findSpot, async (req, res) => {
    // No hasVisited: someone who has only marked the spot 'want' simply has no logs yet, which
    // is an empty list, not a 403.
    const entry = await SpotEntry.findOne({
        user: req.user._id,
        spot: req.spot._id,
    });
    res.json(entry?.logs ?? []);
});

router.post('/', isLoggedIn, findSpot, hasVisited, async (req, res) => {
    req.spotEntry.logs.push(logFields(req.body, req.spot));
    await req.spotEntry.save();
    res.status(201).json(req.spotEntry.logs.at(-1));
});

router.put('/:logId', isLoggedIn, findSpot, hasVisited, async (req, res) => {
    const log = req.spotEntry.logs.id(req.params.logId);
    if (!log) throw new ExpressError('Log not found', 404);

    log.set(logFields(req.body, req.spot));
    await req.spotEntry.save();
    res.json(log);
});

router.delete('/:logId', isLoggedIn, findSpot, hasVisited, async (req, res) => {
    const log = req.spotEntry.logs.id(req.params.logId);
    if (!log) throw new ExpressError('Log not found', 404);

    log.deleteOne();
    await req.spotEntry.save();
    res.status(204).send();
});

module.exports = router;
