const Spot = require('./models/spot');
const SpotEntry = require('./models/spotEntry');
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
        throw new ExpressError('Mark this spot as visited before you can rate or review it', 403);
    }
    req.spotEntry = entry;
    next();
};

// Reviews *are* user-owned, so the course's ownership check still applies here — just scoped
// to reviews instead of spots. Admins can remove any review (moderation).
module.exports.isReviewAuthor = async (req, res, next) => {
    const Review = require('./models/review');
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
        throw new ExpressError('Review not found', 404);
    }
    if (!review.author.equals(req.user._id) && req.user.role !== 'admin') {
        throw new ExpressError('You do not have permission to do that', 403);
    }
    req.review = review;
    next();
};
