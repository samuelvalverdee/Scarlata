const express = require('express');
const router = express.Router();
const Spot = require('../models/spot');
const SpotEntry = require('../models/spotEntry');
const ExpressError = require('../utils/ExpressError');
const schemas = require('../schemas');
const {
    isLoggedIn,
    isAdmin,
    findSpot,
    hasVisited,
    validate,
} = require('../middleware');

// ---------------------------------------------------------------------------
// Public reads. Anyone can browse the map, signed in or not — the spots are
// ours, and there's nothing private about them.
// ---------------------------------------------------------------------------

// Not gated by isLoggedIn: this route has to serve signed-out visitors too. So the
// authenticated/anonymous branch is a plain `if` on req.isAuthenticated() here, rather than
// a middleware that would throw 401 on exactly the requests this route needs to allow.
//
// Without ?q the list is alphabetical by Spanish rules (see SPANISH in models/spot.js). With it,
// it's a text search ranked by relevance; MongoDB doesn't allow a collation on a $text query,
// and relevance is the order a search wants anyway.
router.get(
    '/',
    validate(schemas.spotList, { source: 'query' }),
    async (req, res) => {
        const { q } = req.query;
        const spots = q
            ? await Spot.find({ $text: { $search: q } }).sort({
                  score: { $meta: 'textScore' },
              })
            : await Spot.find({}).collation(Spot.SPANISH).sort({ name: 1 });

        if (!req.isAuthenticated()) {
            return res.json(spots);
        }

        // One query for every entry this user has, rather than one per spot. Keyed by spot id so
        // the map below is a lookup, not a nested query.
        const entries = await SpotEntry.find(
            { user: req.user._id },
            'spot status',
        );
        const statusBySpot = new Map(
            entries.map((e) => [e.spot.toString(), e.status]),
        );

        const withStatus = spots.map((spot) => {
            const obj = spot.toObject();
            obj.myStatus = statusBySpot.get(spot._id.toString()) ?? null;
            return obj;
        });
        res.json(withStatus);
    },
);

// findSpot loads the spot into req.spot and throws a 404 if the id matches
// nothing, so every handler below can assume req.spot exists.
router.get('/:id', findSpot, async (req, res) => {
    // Not a join: we already have req.spot._id, so this is a filter + group on the child
    // collection's foreign key, one round trip, no $lookup needed. See TODO.md's "Known debt"
    // note on why this is aggregated on read instead of denormalized onto Spot.
    const [tally] = await SpotEntry.aggregate([
        { $match: { spot: req.spot._id, vote: { $ne: null } } },
        {
            $group: {
                _id: null,
                up: { $sum: { $cond: [{ $eq: ['$vote', 1] }, 1, 0] } },
                down: { $sum: { $cond: [{ $eq: ['$vote', -1] }, 1, 0] } },
            },
        },
    ]);

    const obj = req.spot.toObject();
    obj.votes = { up: tally?.up ?? 0, down: tally?.down ?? 0 };
    res.json(obj);
});

// Sets the want/visited state for the signed-in user on this spot. Upsert because the
// first status a user ever sets on a spot has no existing SpotEntry to update — and upsert
// (not findOne then create) is what lets the unique index, not a race between two concurrent
// requests, decide who wins. See the index comment in models/spotEntry.js.
router.put(
    '/:id/status',
    isLoggedIn,
    findSpot,
    validate(schemas.status),
    async (req, res) => {
        const { status } = req.body;
        const update = { status };
        // Downgrading out of 'visited' has to clear any vote by hand: the pre('validate') hook in
        // spotEntry.js only runs on .save(), not on findOneAndUpdate, so nothing else will catch a
        // stale vote sitting on a 'want' entry.
        if (status === 'want') update.vote = null;

        const entry = await SpotEntry.findOneAndUpdate(
            { user: req.user._id, spot: req.spot._id },
            { $set: update },
            { upsert: true, new: true, setDefaultsOnInsert: true },
        );
        res.json(entry);
    },
);

// ---------------------------------------------------------------------------
// Admin-only writes. Users never create, edit, or delete spots — see
// PROJECT_PLAN.md "Who owns a spot". isLoggedIn runs first so a signed-out
// request gets 401 ("who are you?") rather than 403 ("not allowed"), which is
// the difference between the client showing a login prompt and an error toast.
// ---------------------------------------------------------------------------

// Bodies arrive bare or wrapped as { spot: {...} }; validate unwraps either into req.body.
router.post(
    '/',
    isLoggedIn,
    isAdmin,
    validate(schemas.spotCreate, { unwrap: 'spot' }),
    async (req, res) => {
        const spot = new Spot({ ...req.body, addedBy: req.user._id });
        await spot.save();
        res.status(201).json(spot);
    },
);

// The schema rejects `addedBy` and `images`: who added a spot is a record, not something a
// request can rewrite, and the gallery has its own routes.
router.put(
    '/:id',
    isLoggedIn,
    isAdmin,
    findSpot,
    validate(schemas.spotUpdate, { unwrap: 'spot' }),
    async (req, res) => {
        // set() + save() rather than findByIdAndUpdate: save() runs the schema's
        // validators (province enum, activityTypes enum, required coordinates) on the
        // whole document. findByIdAndUpdate skips them unless asked, and even then
        // only checks the fields being changed.
        req.spot.set(req.body);
        await req.spot.save();
        res.json(req.spot);
    },
);

router.delete('/:id', isLoggedIn, isAdmin, async (req, res) => {
    // findOneAndDelete, not findByIdAndDelete: the cascade hook in models/spot.js
    // that cleans up orphaned entries and reviews is registered on this exact
    // query name.
    const spot = await Spot.findOneAndDelete({ _id: req.params.id });
    if (!spot) throw new ExpressError('Spot not found', 404);
    res.status(204).send();
});

router.post(
    '/:id/vote',
    isLoggedIn,
    findSpot,
    hasVisited,
    validate(schemas.vote),
    async (req, res) => {
        const { vote } = req.body;

        // req.spotEntry was loaded by hasVisited, already scoped to this user + this spot. set() +
        // save() (not findOneAndUpdate) so the pre('validate') hook in spotEntry.js actually runs.
        req.spotEntry.set({ vote });
        await req.spotEntry.save();
        res.json(req.spotEntry);
    },
);

// Undoes a vote (the client's "click the active vote again" action), leaving the visit itself
// intact. Same hasVisited gate as casting one, since the entry has to exist to clear it anyway.
router.delete(
    '/:id/vote',
    isLoggedIn,
    findSpot,
    hasVisited,
    async (req, res) => {
        req.spotEntry.set({ vote: null });
        await req.spotEntry.save();
        res.json(req.spotEntry);
    },
);

// ---------------------------------------------------------------------------
// Gallery curation (admin). Photos start life on a user's visit log; an admin promotes the
// standouts into the spot's curated gallery, crediting the photographer.
// ---------------------------------------------------------------------------

// Every photo users have attached to their logs for this spot: the pool an admin picks from.
router.get(
    '/:id/log-photos',
    isLoggedIn,
    isAdmin,
    findSpot,
    async (req, res) => {
        const entries = await SpotEntry.find(
            { spot: req.spot._id, 'logs.photos.0': { $exists: true } },
            'user logs',
        ).populate('user', 'username');

        const photos = entries.flatMap((entry) =>
            entry.logs.flatMap((log) =>
                log.photos.map((photo) => ({
                    entryId: entry._id,
                    logId: log._id,
                    user: entry.user,
                    url: photo.url,
                    filename: photo.filename,
                })),
            ),
        );
        res.json(photos);
    },
);

// Body: { entryId, logId, url }. The photo is looked up on the stored log rather than taken
// from the request, so an admin can only promote something a user really uploaded, and the
// credit always points at the real owner instead of whatever the client claims.
router.post(
    '/:id/gallery',
    isLoggedIn,
    isAdmin,
    findSpot,
    validate(schemas.galleryPromote),
    async (req, res) => {
        const { entryId, logId, url } = req.body;

        const entry = await SpotEntry.findOne({
            _id: entryId,
            spot: req.spot._id,
        });
        const photo = entry?.logs.id(logId)?.photos.find((p) => p.url === url);
        if (!photo)
            throw new ExpressError('No such photo on that visit log', 404);

        if (req.spot.images.some((image) => image.url === photo.url)) {
            throw new ExpressError('That photo is already in the gallery', 409);
        }

        req.spot.images.push({
            url: photo.url,
            filename: photo.filename,
            credit: entry.user,
        });
        await req.spot.save();
        res.status(201).json(req.spot.images.at(-1));
    },
);

// Gallery images have no _id of their own (see ImageSchema), so they are identified by url, in
// the query string because DELETE bodies are unreliable across clients and proxies.
router.delete(
    '/:id/gallery',
    isLoggedIn,
    isAdmin,
    findSpot,
    validate(schemas.galleryDelete, { source: 'query' }),
    async (req, res) => {
        const { url } = req.query;
        const image = req.spot.images.find((i) => i.url === url);
        if (!image) throw new ExpressError('No such image in the gallery', 404);

        req.spot.images.pull(image);
        await req.spot.save();
        res.status(204).send();
    },
);

module.exports = router;
