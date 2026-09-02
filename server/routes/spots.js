const express = require("express");
const router = express.Router();
const Spot = require("../models/spot");
const ExpressError = require("../utils/ExpressError");
const { isLoggedIn, isAdmin, findSpot } = require("../middleware");

// ---------------------------------------------------------------------------
// Public reads. Anyone can browse the map, signed in or not — the spots are
// ours, and there's nothing private about them.
// ---------------------------------------------------------------------------

router.get('/', async (req, res) => {
  const spots = await Spot.find({});
  res.json(spots);
});

// findSpot loads the spot into req.spot and throws a 404 if the id matches
// nothing, so every handler below can assume req.spot exists.
router.get('/:id', findSpot, async (req, res) => {
  res.json(req.spot);
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
