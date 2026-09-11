const express = require("express");
const router = express.Router();
const Spot = require("../models/spot");
const SpotEntry = require("../models/spotEntry");
const ExpressError = require("../utils/ExpressError");
const { isLoggedIn, isAdmin, findSpot } = require("../middleware");

// ---------------------------------------------------------------------------
// Public reads. Anyone can browse the map, signed in or not — the spots are
// ours, and there's nothing private about them.
// ---------------------------------------------------------------------------

// Not gated by isLoggedIn: this route has to serve signed-out visitors too. So the
// authenticated/anonymous branch is a plain `if` on req.isAuthenticated() here, rather than
// a middleware that would throw 401 on exactly the requests this route needs to allow.
router.get('/', async (req, res) => {
  const spots = await Spot.find({});

  if (!req.isAuthenticated()) {
    return res.json(spots);
  }

  // One query for every entry this user has, rather than one per spot. Keyed by spot id so
  // the map below is a lookup, not a nested query.
  const entries = await SpotEntry.find({ user: req.user._id }, 'spot status');
  const statusBySpot = new Map(entries.map((e) => [e.spot.toString(), e.status]));

  const withStatus = spots.map((spot) => {
    const obj = spot.toObject();
    obj.myStatus = statusBySpot.get(spot._id.toString()) ?? null;
    return obj;
  });
  res.json(withStatus);
});

// findSpot loads the spot into req.spot and throws a 404 if the id matches
// nothing, so every handler below can assume req.spot exists.
router.get('/:id', findSpot, async (req, res) => {
  res.json(req.spot);
});

// Sets the toVisit/visited state for the signed-in user on this spot. Upsert because the
// first status a user ever sets on a spot has no existing SpotEntry to update — and upsert
// (not findOne then create) is what lets the unique index, not a race between two concurrent
// requests, decide who wins. See the index comment in models/spotEntry.js.
router.put('/:id/status', isLoggedIn, findSpot, async (req, res) => {
  const { status } = req.body;
  if (!['want', 'visited'].includes(status)) {
    throw new ExpressError("status must be 'want' or 'visited'", 400);
  }

  const update = { status };
  // Downgrading out of 'visited' has to clear any vote by hand: the pre('validate') hook in
  // spotEntry.js only runs on .save(), not on findOneAndUpdate, so nothing else will catch a
  // stale vote sitting on a 'want' entry.
  if (status === 'want') update.vote = null;

  const entry = await SpotEntry.findOneAndUpdate(
    { user: req.user._id, spot: req.spot._id },
    { $set: update },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json(entry);
});

// ---------------------------------------------------------------------------
// Admin-only writes. Users never create, edit, or delete spots — see
// PROJECT_PLAN.md "Who owns a spot". isLoggedIn runs first so a signed-out
// request gets 401 ("who are you?") rather than 403 ("not allowed"), which is
// the difference between the client showing a login prompt and an error toast.
// ---------------------------------------------------------------------------

router.post('/', isLoggedIn, isAdmin, async (req, res) => {
  const spot = new Spot({ ...(req.body.spot ?? req.body), addedBy: req.user._id });
  await spot.save();
  res.status(201).json(spot);
});

router.put('/:id', isLoggedIn, isAdmin, findSpot, async (req, res) => {
  const payload = { ...(req.body.spot ?? req.body) };
  delete payload.addedBy; // record of who added it, not something a request can rewrite

  // set() + save() rather than findByIdAndUpdate: save() runs the schema's
  // validators (province enum, activityTypes enum, required coordinates) on the
  // whole document. findByIdAndUpdate skips them unless asked, and even then
  // only checks the fields being changed.
  req.spot.set(payload);
  await req.spot.save();
  res.json(req.spot);
});

router.delete('/:id', isLoggedIn, isAdmin, async (req, res) => {
  // findOneAndDelete, not findByIdAndDelete: the cascade hook in models/spot.js
  // that cleans up orphaned entries and reviews is registered on this exact
  // query name.
  const spot = await Spot.findOneAndDelete({ _id: req.params.id });
  if (!spot) throw new ExpressError('Spot not found', 404);
  res.status(204).send();
});

module.exports = router;
