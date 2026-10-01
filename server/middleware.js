const Spot = require('./models/spot');
const SpotEntry = require('./models/spotEntry');
const Review = require('./models/review');
const ExpressError = require('./utils/ExpressError');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        throw new ExpressError('You must be signed in to do that', 401);
    }
    next();
};

// Replaces the course's `isAuthor`. Spots have no author to compare against — they're
// curated, not user-submitted — so the check is a role on the user, not ownership of the
// document. Gates the write half of /spots (create, edit, delete, gallery curation).
module.exports.isAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        throw new ExpressError('You do not have permission to do that', 403);
    }
    next();
};

// Loads the spot once so the handlers after it don't re-query. Run this before any
// middleware that needs to know the spot exists.
module.exports.findSpot = async (req, res, next) => {
    const spot = await Spot.findById(req.params.id);
    if (!spot) {
        throw new ExpressError('Spot not found', 404);
    }
    req.spot = spot;
    next();
};

// The gate on voting and reviewing: you get to have an opinion on a place once you've been
// there. Assumes isLoggedIn ran first.
module.exports.hasVisited = async (req, res, next) => {
    const entry = await SpotEntry.findOne({
        user: req.user._id,
        spot: req.params.id,
        status: 'visited',
    });
    if (!entry) {
        throw new ExpressError(
            'Mark this spot as visited before you can rate or review it',
            403,
        );
    }
    req.spotEntry = entry;
    next();
};

// Reviews *are* user-owned, so the course's ownership check still applies here — just scoped
// to reviews instead of spots. Admins can remove any review (moderation).
module.exports.isReviewAuthor = async (req, res, next) => {
    // Scoped to the spot in the URL too, so /spots/A/reviews/<a review of B> is a 404 rather
    // than quietly editing a review under the wrong spot's path.
    const review = await Review.findOne({
        _id: req.params.reviewId,
        spot: req.params.id,
    });
    if (!review) {
        throw new ExpressError('Review not found', 404);
    }
    if (!review.author.equals(req.user._id) && req.user.role !== 'admin') {
        throw new ExpressError('You do not have permission to do that', 403);
    }
    req.review = review;
    next();
};

// Runs a schema from schemas.js against the request and replaces req.body (or req.query) with
// the validated value (trimmed strings, ISO dates as Date objects). Goes last in each route's chain, after the
// auth and lookup middleware: a caller who isn't allowed to make the request gets its 401, 403
// or 404, not a tour of the schema.
//
// `schema` is a Joi schema, or a function of req for rules that depend on loaded data (the log
// schemas need req.spot). `unwrap` accepts the `{ spot: {...} }` style envelope alongside a
// bare body.
module.exports.validate =
    (schema, { source = 'body', unwrap } = {}) =>
    (req, res, next) => {
        // No JSON body (missing Content-Type, say) leaves req.body undefined; validating {}
        // turns that into "field is required" rather than a TypeError and a 500.
        let input = req[source] ?? {};
        if (unwrap && input[unwrap] !== undefined) input = input[unwrap];

        const resolved = typeof schema === 'function' ? schema(req) : schema;
        const { error, value } = resolved.validate(input, {
            abortEarly: false, // report every bad field, not just the first
            errors: { wrap: { label: false } }, // `name is required`, not `"name" is required`
        });

        if (error) {
            const details = {};
            for (const { path, message, type } of error.details) {
                // One entry per field: the first problem is the one worth fixing first.
                details[path.join('.') || source] ??= { message, type };
            }
            throw new ExpressError('Validation failed', 400, details);
        }

        // req.query is a getter in Express 5, so plain assignment doesn't stick. Shadowing it on
        // this request lets handlers read the validated (trimmed) value the usual way.
        Object.defineProperty(req, source, {
            value,
            writable: true,
            enumerable: true,
            configurable: true,
        });
        next();
    };
