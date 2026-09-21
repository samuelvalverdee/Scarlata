# Scarlata, backlog

Scratch file for cross-session continuity. Not the plan; [PROJECT_PLAN.md](PROJECT_PLAN.md) is.
Project rules (git, content style) live in [CLAUDE.md](CLAUDE.md).

The backend feature set is finished. Spots are curated by us and users interact with them (see
"Who owns a spot" in the plan). This file holds what comes next, the open decisions, and known debt.

## Status

Everything in the plan's API section is built and was verified against a local mongod with the
seeded data: status, vote, review and log gates (401 signed out, 403 not visited or not admin, 404,
409 duplicate review or gallery photo, 400 schema validation), vote tallies on `GET /spots/:id`, and
`/me/lists` plus `/me/progress` (cross-checked against direct collection counts). The Postman
collection has a request for each route.

Status values are `want` and `visited` in the model, the routes and the API responses (`/me/lists`
returns `{ want, visited }`).

Not built yet: request validation, hardening, image uploads, map/geocoding, spot filtering
(`?activityType`, `?province` on `GET /spots`), and everything under `client/`.

## Next steps, in order

1. **Joi validation** (pulled forward from plan Phase 8). A `schemas.js` plus a `validate`
   middleware, applied before the handlers.
   - Schemas for: register and login, spot create (required fields) and spot update (all fields
     optional), status, vote, review create and update, visit log create and update, gallery
     promote, and the gallery delete query.
   - Spot rules: `province`, `activityTypes` and `difficulty` drawn from the model's lists (import
     them, don't copy them), coordinates as `[lng, lat]` inside a Costa Rica bounding box, positive
     numbers for the specs. `images` and `addedBy` are rejected in the body: the gallery routes own
     the first and the server owns the second.
   - Log rule that needs the spot: `activitiesDone` must come from that spot's `activityTypes`, so
     the schema is built per request from `req.spot`.
   - Photos are `{ url }` only, http(s), with a length cap. Reject client-supplied `filename`
     (see the Cloudinary item: it will become a `public_id` the server deletes by).
   - Replace the hand-rolled checks in `routes/logs.js` (`logFields`) and the status and vote
     checks in `routes/spots.js`. Keep the `req.body.spot ?? req.body` style unwrapping the routes
     accept today.
   - Errors: 400 with `details` keyed by field path, the same shape `normalizeError` already
     returns for Mongoose. It only forwards the message today, so it needs to pass `details`
     through for our own errors. Include Joi's error `type` per field so the Spanish frontend can
     map it to its own copy instead of showing English text.
   - Verify: every schema against the 34 seeded spots (they must all pass), plus a bad-input
     request per route. Add those cases to Postman.
2. **Cloudinary image uploads** (plan Phase 5). Multer plus `multer-storage-cloudinary`; the server
   receives the file and only the returned `url` and `public_id` (`filename`) reach MongoDB.
   - Config: Cloudinary keys in `.env` and `.env.example`, never sent to the client.
   - Server-side limits: real MIME type (not just extension), `limits.fileSize` (about 5 MB), a max
     number of files per request. Multer supports all three.
   - Privacy: strip EXIF and GPS metadata. Users photograph real places, and phone photos carry
     coordinates.
   - Cleanup: deleting a log, or a photo from a log, must delete the Cloudinary asset, and so must a
     failed DB save after a successful upload. See the debt entry on gallery copies before wiring
     this.
   - Frontend later: previews, per-file errors, progress, and resizing before upload on mobile.
3. **The rest of Phase 8 hardening:** helmet, express-mongo-sanitize, sanitize-html, rate limiting
   (auth and upload routes first).
4. **Maps and filtering:** Mapbox geocoding server-side, `?activityType` and `?province` on
   `GET /spots`.
5. **Spanish content pass** (see the decision below), then the `client/` scaffold.

## Open decisions

- **Spanish and translations.** The app is Spanish-only in production; the seeded content is
  English. Proposed approach, not yet confirmed:
  - **One language in the database, no duplicated translations.** Curated spot content (`name`,
    `description`) is stored in Spanish. Do not add `{ es, en }` unless English becomes a real
    requirement; if it does, that is a migration then, not a cost now.
  - **Enum values stay stable English keys** (`difficulty`, `activityTypes`, `bestTimeOfDay`, the
    `want` and `visited` statuses) and the frontend maps them to Spanish labels from a dictionary.
    Provinces are proper nouns already, so they need no mapping.
  - **UI copy lives in the frontend** (a react-i18next resource file, or a plain constants map),
    bundled with the app. It needs no server-side caching: the browser caches the bundle.
  - **User-written content** (reviews, log notes) is stored as typed and never translated.
  - **API error messages are developer-facing English.** The frontend shows its own Spanish text,
    keyed by status and by the field and error `type` that Joi will return.
  - Rewriting the 34 seeded descriptions and the seeded review and log text in Spanish is a
    one-time job. Do it before the content grows, and keep the em dash rule in CLAUDE.md in mind.
  - For sorting and search, use a Spanish collation and text index so accents and `ñ` behave.
- **Images and attribution.** `ImageSchema` carries both `url` and `filename` (Cloudinary
  `public_id`), so the switch to uploads is not a migration: seeded photos have a URL and no
  `public_id`, uploads have both. Gap: `credit` is an ObjectId ref to a User, so an
  externally-licensed photo has nowhere to store attribution.
- **Spot data quality.** `grep -n "VERIFY:" server/seeds/spots.js`. What is flagged is only what
  would make a pin wrong, not imprecise:
  - 7 park pins are polygon centroids rather than entrances. Corcovado is the one that matters,
    since Sirena vs La Leona is a different trip, not a different parking lot.
  - 2 rafting pins (Pacuare, Sarapiquí) are river nodes, not put-ins.
  - 3 contested provinces: Chirripó, Rincón de la Vieja, Río Celeste.
  - 2 spots whose access may have closed: Cerro Chato (private land), Volcán Turrialba (activity).
  - Lowest confidence entry: Cerro Pelado. OSM has two by that name.
- **`ACTIVITY_TYPES` and `PROVINCES`** in `models/spot.js` are still a starting guess, to be refined.
  All 10 activity types have at least one spot, so removing one has a data cost.

## Known debt

- **Deleting a log photo can break a gallery image.** Promoting a photo copies its `url` and
  `filename` into the spot gallery. Once uploads exist, deleting the original log would delete the
  Cloudinary asset the gallery copy still points at. Before wiring asset cleanup, either skip the
  delete when the same `public_id` is in a gallery, or copy the asset to a new `public_id` on
  promotion.
- **Hand-rolled request validation.** The checks in `routes/logs.js` (activities, photo URLs) and
  the status and vote checks in `routes/spots.js` are stopgaps. `normalizeError` is a safety net at
  the database layer: it catches bad data late, with Mongoose's wording. Both go away with the
  Joi step.
- **Log photos are unmoderated URLs** until uploads land: user-supplied http(s) links, with no
  check beyond the admin choosing which ones to promote into the gallery. Uploads narrow this
  (allowed types, size limits) but do not replace admin review.
- **Moving a spot back to `want` keeps its reviews and logs.** Downgrading from `visited` clears
  the vote but keeps the visit logs and the review. Deliberate for now (nothing is lost if someone
  taps the wrong button), but the spot page will show a review from someone whose status says they
  haven't been. Decide when the frontend needs it.
- **No rate limiting, helmet or mongo-sanitize yet** (step 3).
- **Vote tallies and progress are computed on read.** `GET /spots/:id` aggregates the votes, and
  `/me/progress` is computed in JS from two flat queries. `byActivity` counts a multi-activity spot
  once per activity, so its totals exceed the overall total by design. Fine at this scale;
  denormalize onto Spot or move to a pipeline only if the map view or the logbook gets slow.
- **Seeded numeric specs are indicative.** `trailLengthKm`, `waterfallHeightM`, `maxOccupancy`,
  elevation and duration are deliberately not individually verified. They are display detail for a
  frontend that doesn't exist yet. Don't promote them to trip-planning data without a research
  pass. The header of `seeds/spots.js` is the only other place recording this.
- **`images[]` is empty on every seeded spot on purpose.** A fabricated photo URL is a broken
  image, which is worse than none.
- **Admin promotion is manual by design.** `npm run seed -- --admin <email>` promotes without
  wiping; no route grants the role.

## Running it

```
cd server && npm install && npm run dev     # needs local MongoDB, port 3001, API under /api/v1
npm run seed                                # users + spots
npm run seed -- --with-activity             # plus fake visits, votes, reviews
npm run seed -- --admin <email>             # promote one account, wipes nothing
npm run format                              # Prettier; format:check to verify (4 spaces, single quotes)
```

`npm run seed` wipes users, spots, entries and reviews. It refuses to run against a non-local
`MONGO_URI` unless you pass `--force`, because a stray Atlas string in `.env` would empty a real
database with no undo. Seeded logins are in `seeds/users.js`; `samuel@scarlata.test` is admin.

Postman collection: `server/postman/`, import both files and pick the "Scarlata, Local"
environment. Session cookies are handled automatically once you run Login.
