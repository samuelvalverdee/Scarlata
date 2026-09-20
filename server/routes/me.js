const express = require('express');
const router = express.Router();
const Spot = require('../models/spot');
const SpotEntry = require('../models/spotEntry');
const { isLoggedIn } = require('../middleware');

const { ACTIVITY_TYPES, PROVINCES } = Spot;

// The signed-in user's logbook ("mi bitacora"). Read-only: everything here is derived from the
// SpotEntry documents that PUT /spots/:id/status and the log routes already write.

// The two lists, split by status. The keys are the SpotEntry status values ('want' is the
// to-visit list), so the client can index straight in with entry.status.
router.get('/lists', isLoggedIn, async (req, res) => {
    const entries = await SpotEntry.find({ user: req.user._id })
        .populate('spot', 'name province activityTypes difficulty location images')
        .sort({ updatedAt: -1 });

    const lists = { want: [], visited: [] };
    for (const entry of entries) {
        // A null spot means it was deleted between the cascade hook and this read. Skip it
        // rather than hand the client an entry pointing at nothing.
        if (!entry.spot) continue;
        lists[entry.status].push({
            spot: entry.spot,
            vote: entry.vote,
            logs: entry.logs,
            updatedAt: entry.updatedAt,
        });
    }
    res.json(lists);
});

// Visited / total, overall and per province and per activity type: the numbers behind the
// "watch your map fill in" loop.
//
// Computed in JS from two flat queries rather than a $lookup pipeline. At curated-map scale
// (tens to low hundreds of spots) that is one small read of the spots plus one of this user's
// entries, and it is far easier to follow than a pipeline. Revisit if the spot count grows by
// orders of magnitude. A spot with several activityTypes counts once toward each of them, so
// byActivity totals add up to more than the overall total by design.
router.get('/progress', isLoggedIn, async (req, res) => {
    const [spots, entries] = await Promise.all([
        Spot.find({}, 'province activityTypes').lean(),
        SpotEntry.find({ user: req.user._id }, 'spot status').lean(),
    ]);

    const visitedIds = new Set(
        entries.filter((e) => e.status === 'visited').map((e) => e.spot.toString()),
    );

    // Seeded from the enums so a province or activity with no spots yet still shows up as 0/0
    // instead of vanishing from the response.
    const byProvince = new Map(PROVINCES.map((p) => [p, { province: p, visited: 0, total: 0 }]));
    const byActivity = new Map(
        ACTIVITY_TYPES.map((a) => [a, { activityType: a, visited: 0, total: 0 }]),
    );

    for (const spot of spots) {
        const seen = visitedIds.has(spot._id.toString()) ? 1 : 0;
        const province = byProvince.get(spot.province);
        province.total += 1;
        province.visited += seen;
        for (const type of spot.activityTypes) {
            const activity = byActivity.get(type);
            activity.total += 1;
            activity.visited += seen;
        }
    }

    res.json({
        visited: visitedIds.size,
        want: entries.filter((e) => e.status === 'want').length,
        total: spots.length,
        byProvince: [...byProvince.values()],
        byActivity: [...byActivity.values()],
    });
});

module.exports = router;
