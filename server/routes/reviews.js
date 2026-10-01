const express = require('express');
const router = express.Router({ mergeParams: true });
const Review = require('../models/review');
const ExpressError = require('../utils/ExpressError');
const schemas = require('../schemas');
const {
    isLoggedIn,
    findSpot,
    hasVisited,
    isReviewAuthor,
    validate,
} = require('../middleware');

router.get('/', findSpot, async (req, res) => {
    const reviews = await Review.find({ spot: req.params.id })
        .populate('author', 'username')
        .sort({ createdAt: -1 });
    res.json(reviews);
});

// hasVisited is the point of the whole feature: every review on a spot comes from someone who
// actually went. Mark the spot visited first, then you get to say something about it.
// Bodies arrive bare or wrapped as { review: {...} }; validate unwraps either into req.body.
router.post(
    '/',
    isLoggedIn,
    findSpot,
    hasVisited,
    validate(schemas.reviewCreate, { unwrap: 'review' }),
    async (req, res) => {
        const { rating, body } = req.body;
        try {
            const review = new Review({
                spot: req.spot._id,
                author: req.user._id,
                rating,
                body,
            });
            await review.save();
            await review.populate('author', 'username');
            res.status(201).json(review);
        } catch (err) {
            // 11000 = the { spot, author } unique index. One review per person per spot: a repeat
            // visitor edits theirs rather than stacking up duplicates and skewing the average.
            if (err.code === 11000) {
                throw new ExpressError(
                    'You have already reviewed this spot, edit that review instead',
                    409,
                );
            }
            throw err;
        }
    },
);

router.put(
    '/:reviewId',
    isLoggedIn,
    isReviewAuthor,
    validate(schemas.reviewUpdate, { unwrap: 'review' }),
    async (req, res) => {
        // The schema allows only rating and body, so the validated value can be set as is.
        req.review.set(req.body);
        await req.review.save();
        await req.review.populate('author', 'username');
        res.json(req.review);
    },
);

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, async (req, res) => {
    await req.review.deleteOne();
    res.status(204).send();
});

module.exports = router;
