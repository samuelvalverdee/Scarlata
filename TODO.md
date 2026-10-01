# Scarlata, backlog

Scratch file for cross-session continuity. Not the plan; [PROJECT_PLAN.md](PROJECT_PLAN.md) is.
Project rules (git, content style) live in [CLAUDE.md](CLAUDE.md).

The backend feature set is finished, request validation included. Spots are curated by us and users
interact with them (see "Who owns a spot" in the plan). This file holds what comes next and the
known debt.

## Next steps, in order

1. **Gallery cascade.** A gallery image promoted from a visit log is removed from the gallery when
   its source photo goes away: the log is deleted, or an edit drops that photo from it. Match by
   `url` (plus `filename` once uploads exist). Seeded or external gallery images have no source log
   and are unaffected. Small, and it has to land before step 2 wires Cloudinary deletion.
2. **Cloudinary image uploads** (plan Phase 5). Multer plus `multer-storage-cloudinary`; the server
   receives the file and only the returned `url` and `public_id` (`filename`) reach MongoDB.
   - Config: Cloudinary keys in `.env` and `.env.example`, never sent to the client.
   - Server-side limits: real MIME type (not just extension), `limits.fileSize` (about 5 MB), a max
     number of files per request. Multer supports all three.
   - Privacy: strip EXIF and GPS metadata. Users photograph real places, and phone photos carry
     coordinates.
   - Cleanup: an asset lives as long as its log photo. Deleting a log, or a photo from a log,
     deletes the asset (and its gallery copy, via step 1), and so does a failed DB save after a
     successful upload. Removing an image from the gallery only unlinks it, since the log still
     owns the asset.
   - `credit` stays optional: only photos promoted from a log have one. If an externally licensed
     photo ever needs attribution text (CC BY), add an optional free-text field then.
   - Frontend later: previews, per-file errors, progress, and resizing before upload on mobile.
3. **The rest of Phase 8 hardening:** helmet, express-mongo-sanitize, sanitize-html, rate limiting
   (auth and upload routes first).
4. **Maps and filtering:** Mapbox geocoding server-side, `?activityType` and `?province` on
   `GET /spots`. Add them to `schemas.spotList` next to `q`, and combine them with the search filter.
5. **`client/` scaffold.** Things the backend already assumes:
   - Enum values are stable English keys (`difficulty`, `activityTypes`, `bestTimeOfDay`, the
     `want` and `visited` statuses); the frontend maps them to Spanish labels. Provinces are
     proper nouns and need no mapping.
   - UI copy lives in the frontend (a react-i18next resource file, or a plain constants map).
   - API error messages are developer-facing English. Show Spanish text keyed by status and by
     `details[field].type` from a 400.
   - Writes reject unknown keys, `_id`, `createdAt` and `__v` included: send back only the
     editable fields on an update, not the object you fetched.
   - User-written content (reviews, log notes) is shown as typed, never translated.

## Known debt

- **Usernames are case-sensitive.** Emails are not (stored lowercased, login by email works in any
  case), but `Ana` and `ana` can still register as two usernames. Decide whether that matters
  before real signups: the fix is a case-insensitive unique index on `username` (collation
  strength 2) rather than lowercasing, so people keep the capitalisation they chose.
- **Log photos are unmoderated URLs** until uploads land: user-supplied http(s) links (at most 10
  per log, 2048 characters each), with no check beyond the admin choosing which ones to promote
  into the gallery. Uploads narrow this (allowed types, size limits) but do not replace admin
  review.
- **Moving a spot back to `want` keeps its reviews and logs.** Downgrading from `visited` clears
  the vote but keeps the visit logs and the review. Deliberate for now (nothing is lost if someone
  taps the wrong button), but the spot page will show a review from someone whose status says they
  haven't been. Decide when the frontend needs it.
- **No rate limiting, helmet or mongo-sanitize yet** (step 3). Joi already closes the
  operator-injection paths (login `username` and gallery `entryId` must be strings), so
  mongo-sanitize is defence in depth now, not the only guard.
- **The coordinate box is mainland only.** Isla del Coco (about -87.0, 5.5) is rejected; widen
  `CR_BOUNDS` in `schemas.js` if a spot there is ever curated.
- **`ACTIVITY_TYPES` and `PROVINCES`** in `models/spot.js` are still a starting guess. All 10
  activity types have at least one spot, so removing one has a data cost.
- **Seed pins are map-ready, not trip-accurate.** The `VERIFY:` comments in `seeds/spots.js`
  (park centroids vs entrances, rafting river nodes, contested provinces, possibly closed access,
  Cerro Pelado) are notes for a later curation pass and block nothing.
- **Seeded numeric specs are indicative.** `trailLengthKm`, `waterfallHeightM`, `maxOccupancy`,
  elevation and duration are deliberately not individually verified. Don't promote them to
  trip-planning data without a research pass.
- **Vote tallies and progress are computed on read.** `GET /spots/:id` aggregates the votes, and
  `/me/progress` is computed in JS from two flat queries. `byActivity` counts a multi-activity spot
  once per activity, so its totals exceed the overall total by design. Fine at this scale;
  denormalize onto Spot or move to a pipeline only if the map view or the logbook gets slow.
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
Indexes (including the Spanish name index and the `spot_search` text index) are built by Mongoose
when the app connects.

Postman collection: `server/postman/`, import both files and pick the "Scarlata, Local"
environment. Session cookies are handled automatically once you run Login. The "Validation" folder
holds one bad request per route.
