const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Starter list — you know Costa Rica's outdoor categories better than this does.
// Add/remove freely; just keep it in sync with any validation (Joi) built on top later.
const ACTIVITY_TYPES = [
    'hiking',
    'waterfall',
    'river',
    'camping',
    'viewpoint',
    'hot-springs',
    'hanging-bridges',
    'zipline',
    'rafting',
    'snorkeling'
];

const PROVINCES = [
    'San José',
    'Alajuela',
    'Cartago',
    'Heredia',
    'Guanacaste',
    'Puntarenas',
    'Limón',
];

// Curated gallery. Two sources: photos we ship with the seed data, and standout photos
// promoted out of a user's visit log by an admin (POST /spots/:id/gallery) — `credit` is
// set in the second case so the contributor stays attributed on the spot page.
// `filename` is the Cloudinary public_id, filled in once Phase 5 lands; seeded photos are
// plain URLs and leave it undefined.
const ImageSchema = new Schema({
    url: { type: String, required: true },
    filename: String,
    credit: { type: Schema.Types.ObjectId, ref: 'User' },
}, { _id: false });

// One parent model for every spot on the map, regardless of activity — see PROJECT_PLAN.md
// "Schema modeling" section for the reasoning. A spot can be more than one activityType at
// once (e.g. Cerro Pelado = hiking + camping + viewpoint).
const SpotSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    images: [ImageSchema],
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [lng, lat]
            required: true
        }
    },
    province: {
        type: String,
        enum: PROVINCES,
        required: true
    },
    activityTypes: [
        {
            type: String,
            enum: ACTIVITY_TYPES,
            required: true
        }
    ],
    difficulty: {
        type: String,
        enum: ['easy', 'moderate', 'hard'],
        required: true
    },
    bestTimeOfDay: {
        type: String, // e.g. 'sunrise', 'sunset', 'anytime'
    },

    // Type-specific fields — left undefined on spots where they don't apply.
    trailLengthKm: Number,
    elevationGainM: Number,
    estimatedDurationHrs: Number,
    waterfallHeightM: Number,
    swimmable: Boolean,
    maxOccupancy: Number,
    permitRequired: Boolean,
    oneDayTrip: Boolean,
    guidedTour: Boolean,

    // Spots are CURATED BY US, never user-submitted: there's no way to verify that a
    // user-added spot is a real, reachable, publicly accessible place, and the entire value of
    // the map is that every pin on it is real. Users interact with spots (visit, vote, review,
    // photograph) — they don't create them. See PROJECT_PLAN.md "Who owns a spot".
    //
    // Optional on purpose: the seed script runs against an empty database with no admin user to
    // point at. Only set when a spot is added later through the admin routes.
    addedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// The map view queries by area; the list view filters by province/activity.
SpotSchema.index({ location: '2dsphere' });
SpotSchema.index({ province: 1, activityTypes: 1 });

// Deleting a spot orphans every entry and review pointing at it — same cascade the course
// teaches on campgrounds, just across two collections. Required inside the hook (not at the
// top of the file) to avoid a circular import: both models reference this one.
SpotSchema.post('findOneAndDelete', async function (spot) {
    if (!spot) return;
    const SpotEntry = require('./spotEntry');
    const Review = require('./review');
    await Promise.all([
        SpotEntry.deleteMany({ spot: spot._id }),
        Review.deleteMany({ spot: spot._id }),
    ]);
});

module.exports = mongoose.model('Spot', SpotSchema);
module.exports.ACTIVITY_TYPES = ACTIVITY_TYPES;
module.exports.PROVINCES = PROVINCES;
