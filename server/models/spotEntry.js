const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// A single trip to the spot. Kept as a subdocument array rather than its own collection
// because logs are only ever read through their parent entry ("show me my visits to Chirripó"),
// never queried on their own — and the array is naturally small (how many times can you
// realistically climb the same mountain?).
const LogSchema = new Schema({
    visitedAt: { type: Date, default: Date.now },
    activitiesDone: [String], // which of the spot's activityTypes you actually did that trip
    notes: String,
    photos: [{
        url: { type: String, required: true },
        filename: String, // Cloudinary public_id, Phase 5
        _id: false,
    }],
}, { timestamps: true });

// ONE document per (user, spot) pair — this is the toVisit / visited mechanic.
//
// Deliberately not two arrays on the User document:
//   - a spot can't be in both lists at once, by construction: `status` is a single field, so
//     moving a spot from toVisit to visited is one field update, not a delete-then-insert
//     across two arrays that can drift out of sync
//   - "who has visited this spot?" (needed for the spot page's counts) stays an indexed query
//     instead of a scan across every user document
//   - a user's history grows without bloating the document that gets loaded on every single
//     request by deserializeUser
//
// `vote` lives here rather than on Spot for the same reason a review does: it belongs to the
// person, not the place. Spot-level tallies are aggregated from this collection on read.
const SpotEntrySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    spot: {
        type: Schema.Types.ObjectId,
        ref: 'Spot',
        required: true
    },
    status: {
        type: String,
        enum: ['want', 'visited'],
        required: true
    },
    // +1 / -1, or null for "visited but hasn't voted". Only meaningful when status is 'visited'.
    vote: {
        type: Number,
        enum: [1, -1, null],
        default: null
    },
    logs: [LogSchema],
}, { timestamps: true });

// The unique index is what actually enforces one entry per person per spot — without it two
// concurrent requests can both find nothing and both insert. Every write path below uses
// findOneAndUpdate with upsert so the database, not application logic, resolves the race.
SpotEntrySchema.index({ user: 1, spot: 1 }, { unique: true });
SpotEntrySchema.index({ spot: 1, status: 1 }); // spot page: visit counts + vote tallies
SpotEntrySchema.index({ user: 1, status: 1 }); // logbook: "my toVisit list" / "my visited list"

// The product rule is "you can only vote on somewhere you've actually been." The hasVisited
// route middleware is what enforces it for real, returning a clean 403.
//
// This is a partial backstop, and it is important to know its limit: Mongoose runs
// pre('validate') on document saves only. It does NOT run on query updates like
// findOneAndUpdate. So it catches a bad .save() (a seed script, a script you write later)
// but it will not catch a findOneAndUpdate that sets a vote on a non-visited entry.
// Any route that downgrades an entry from 'visited' back to 'want' via a query update has
// to clear the vote itself.
SpotEntrySchema.pre('validate', function (next) {
    if (this.status !== 'visited' && this.vote != null) {
        return next(new Error('Only a visited spot can be voted on'));
    }
    next();
});

module.exports = mongoose.model('SpotEntry', SpotEntrySchema);
