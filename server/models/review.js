const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Reviews are gated on having actually visited the spot (see the hasVisited middleware), so
// every review on a spot page comes from someone who was really there. That's the whole
// trustworthiness argument for a tracker built on real places.
const ReviewSchema = new Schema({
    spot: {
        type: Schema.Types.ObjectId,
        ref: 'Spot',
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    body: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
}, { timestamps: true });

// One review per person per spot — a repeat visitor edits their existing review rather than
// stacking up new ones and skewing the average. Enforced by the database, same reasoning as
// the SpotEntry index.
ReviewSchema.index({ spot: 1, author: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
