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

// One parent model for every spot on the map, regardless of activity — see PROJECT_PLAN.md
// "Schema modeling" section for the reasoning. A spot can be more than one activityType at
// once (e.g. Cerro Pelado = hiking + camping + viewpoint).
const SpotSchema = Schema({
    name: {
        type: String,
        require: true
    },
    description: {
        type: String,
    },
    images: [String],
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            require: true
        },
        coordinates: [Number], // [lng, lat]
        require: true
    },
    province: {
        type: String,
        enum: PROVINCES,
        require: true
    },
    activityTypes: [
        {
            type: String,
            enum: ACTIVITY_TYPES,
            require: true
        }
    ],
    difficulty: {
        type: String,
        enum: ['easy', 'moderate', 'hard'],
        require: true
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
    guidedTour: Boolean

    // author: { type: Schema.Types.ObjectId, ref: 'User' }, // uncomment once auth lands
});

module.exports = mongoose.model('Spot', SpotSchema);
