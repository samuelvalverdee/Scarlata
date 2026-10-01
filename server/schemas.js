const Joi = require('joi');
const { ACTIVITY_TYPES, PROVINCES, DIFFICULTIES } = require('./models/spot');
const { STATUSES } = require('./models/spotEntry');

// Request validation. Every body the API accepts has a schema here, applied by the `validate`
// middleware right before the route handler. The Mongoose schemas still guard the database;
// these guard the door, which is where a bad request should be turned away: with a message about
// the field the client actually sent, and before any query sees it.
//
// Unknown keys are rejected (Joi's default) rather than stripped. For writes that spread the
// body into a model, that is what stops mass assignment of `_id`, `images` or `role`, and a
// misspelt field fails loudly instead of being silently dropped.
//
// Every value must also be the type it claims to be. That matters beyond tidy data: login hands
// `username` straight to a Mongo query, so `{ "username": { "$ne": null } }` would be an operator
// injection if it reached passport as an object.

const objectId = Joi.string().hex().length(24);

// URLs only until uploads land (multer + Cloudinary). Restricted to http(s) so nothing can
// smuggle a javascript: or data: URI into an <img src> on someone's screen.
const photoUrl = Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .max(2048);

// Mainland Costa Rica with a little margin. Its main job is catching swapped coordinates:
// [lat, lng] puts a positive number where the longitude belongs and fails at once. Isla del
// Coco (about -87.0, 5.5) falls outside; widen the box if a spot there is ever curated.
const CR_BOUNDS = { lng: [-86.0, -82.5], lat: [8.0, 11.25] };
const inRange = ([min, max], name) =>
    Joi.number()
        .min(min)
        .max(max)
        .required()
        .messages({
            'number.min': `${name} must be inside Costa Rica (${min} to ${max})`,
            'number.max': `${name} must be inside Costa Rica (${min} to ${max})`,
        });

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

module.exports.register = Joi.object({
    // No '@': login matches the identifier against username OR email, so a username that looks
    // like someone else's email would make their email login ambiguous.
    username: Joi.string()
        .trim()
        .min(3)
        .max(30)
        .pattern(/^[a-zA-Z0-9._-]+$/)
        .required()
        .messages({
            'string.pattern.base':
                'username may only contain letters, numbers, dots, dashes and underscores',
        }),
    // tlds off: Joi's IANA list would reject the seeded `.test` accounts, and deliverability is
    // an email-confirmation problem, not a format one.
    // Lowercased here and again by the User model, so the response shows what was stored.
    email: Joi.string()
        .trim()
        .lowercase()
        .email({ tlds: { allow: false } })
        .max(254)
        .required(),
    // Capped so a megabyte password can't make pbkdf2 chew on it.
    password: Joi.string().min(8).max(128).required(),
});

// No rules beyond "a string of sane length": a login that fails format rules would tell an
// attacker which accounts predate those rules. `username` accepts a username or an email.
module.exports.login = Joi.object({
    username: Joi.string().max(254).required(),
    password: Joi.string().max(128).required(),
});

// ---------------------------------------------------------------------------
// Spots
// ---------------------------------------------------------------------------

// GET /spots?q=. The province and activity filters join this when they're built.
module.exports.spotList = Joi.object({
    q: Joi.string().trim().min(1).max(100),
});

// Every field optional here; spotCreate marks the ones the model requires. `null` clears an
// optional field on update (a spec that turned out wrong, say).
const spotFields = {
    name: Joi.string().trim().min(1).max(120),
    description: Joi.string().trim().max(3000).allow('', null),
    location: Joi.object({
        type: Joi.string().valid('Point'),
        coordinates: Joi.array()
            .ordered(
                inRange(CR_BOUNDS.lng, 'longitude'),
                inRange(CR_BOUNDS.lat, 'latitude'),
            )
            .length(2)
            .required(),
    }),
    province: Joi.string().valid(...PROVINCES),
    activityTypes: Joi.array()
        .items(Joi.string().valid(...ACTIVITY_TYPES))
        .min(1)
        .unique(),
    difficulty: Joi.string().valid(...DIFFICULTIES),
    bestTimeOfDay: Joi.string().trim().max(50).allow(null),

    trailLengthKm: Joi.number().positive().allow(null),
    elevationGainM: Joi.number().min(0).allow(null), // 0 is real: Poás and Irazú are drive-up craters
    estimatedDurationHrs: Joi.number().positive().allow(null),
    waterfallHeightM: Joi.number().positive().allow(null),
    maxOccupancy: Joi.number().integer().positive().allow(null),
    swimmable: Joi.boolean().allow(null),
    permitRequired: Joi.boolean().allow(null),
    oneDayTrip: Joi.boolean().allow(null),
    guidedTour: Joi.boolean().allow(null),

    // Owned elsewhere: the gallery routes curate `images`, and the server sets `addedBy` from
    // the session. Named here (not just left unknown) so the rejection reads as deliberate.
    images: Joi.any().forbidden(),
    addedBy: Joi.any().forbidden(),
};

module.exports.spotCreate = Joi.object(spotFields).fork(
    ['name', 'location', 'province', 'activityTypes', 'difficulty'],
    (field) => field.required(),
);

module.exports.spotUpdate = Joi.object(spotFields).min(1);

// ---------------------------------------------------------------------------
// A user's activity on a spot
// ---------------------------------------------------------------------------

module.exports.status = Joi.object({
    status: Joi.string()
        .valid(...STATUSES)
        .required(),
});

module.exports.vote = Joi.object({
    vote: Joi.number().valid(1, -1).required(),
});

const reviewFields = {
    // Whole stars. The model alone would accept 4.5.
    rating: Joi.number().integer().min(1).max(5),
    body: Joi.string().trim().min(1).max(2000),
};

module.exports.reviewCreate = Joi.object(reviewFields).fork(
    ['rating', 'body'],
    (field) => field.required(),
);

module.exports.reviewUpdate = Joi.object(reviewFields).min(1);

// Built per request: which activities a log may list depends on the spot it belongs to, so the
// route passes req.spot in (findSpot has to run before validate on those routes).
//
// Nothing is required on create; the model defaults visitedAt to now and the lists to empty.
function logFields(spot) {
    return {
        // Date-only strings ('2026-09-30') parse as UTC midnight, which is never in the future
        // for a user in Costa Rica, so max('now') doesn't reject "today".
        visitedAt: Joi.date().iso().max('now'),
        activitiesDone: Joi.array()
            .items(Joi.string().valid(...spot.activityTypes))
            .unique()
            .messages({
                'any.only': `activitiesDone must be drawn from this spot's activities: ${spot.activityTypes.join(', ')}`,
            }),
        notes: Joi.string().trim().max(5000).allow(''),
        // `{ url }` only. A client-supplied `filename` is rejected as unknown: once uploads land
        // it becomes the Cloudinary public_id the server deletes by, so it can only ever come
        // from the server's own upload result.
        photos: Joi.array()
            .items(Joi.object({ url: photoUrl.required() }))
            .max(10),
    };
}

module.exports.logCreate = (spot) => Joi.object(logFields(spot));
module.exports.logUpdate = (spot) => Joi.object(logFields(spot)).min(1);

// ---------------------------------------------------------------------------
// Gallery curation (admin)
// ---------------------------------------------------------------------------

module.exports.galleryPromote = Joi.object({
    entryId: objectId.required(),
    logId: objectId.required(),
    url: photoUrl.required(),
});

module.exports.galleryDelete = Joi.object({
    url: photoUrl.required(),
});
