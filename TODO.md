# Scarlata, working to-do

Scratch file for cross-session continuity. Not the plan; [PROJECT_PLAN.md](PROJECT_PLAN.md) is.
Delete once the parts below are done and the plan doc is corrected.

## The correction in progress

Phases 3-4 built spots on the course's YelpCamp ownership model: users create spots, `author` on
the document, `isAuthor` guarding edits. **That is wrong for Scarlata.** Spots are curated by us
(seed script + admin routes) because a user-submitted spot can't be verified as a real, reachable
place, and the map's whole value is that every pin on it is real.

Users don't create spots. They *interact* with them: mark toVisit / visited, vote, review,
photograph. Decisions taken:

- Spot writes: seed script **and** admin-gated routes (`role: 'admin'` on User).
- Reviews require a visit, same as votes.
- Photos live on the user's visit log; admins can promote standouts into the curated gallery.
- Businesses are allowed as spots, not just natural features. For rafting the operator *is* the
  access point, so excluding them would leave real activities unmappable.

## House style

**No em dashes.** Anywhere: code comments, seed content, docs, commit messages. Repunctuate the
sentence instead of substituting a lookalike character. A parenthetical break becomes commas or
parentheses, an explanatory break becomes a colon, a hard clause turn becomes a new sentence.
Check the result still parses as a sentence afterwards.

Seeds, `db/connection.js` and `package.json` are clean. Roughly 108 remain in files committed
before the rule existed: `PROJECT_PLAN.md` (62), the models/routes/utils (26), `README.md` (1).
Sweep `PROJECT_PLAN.md` as part of Part 8 rather than as its own commit.

## Parts

- [x] **1, Ownership correction.** `routes/spots.js`: public reads, admin-gated writes, `author`
      gone. Verified: 200 signed-out read, 401 signed-out write, 403 non-admin write, 201/200/204
      as admin.
- [x] **1.5, Honest error codes.** `utils/normalizeError.js`: Mongoose validation -> 400 with
      per-field details, CastError -> 400, duplicate key -> 409. `routes/auth.js` register no
      longer swallows errors into a local 400 that leaked raw driver text.
- [x] **2, Seeds + an admin account.** `seeds/index.js` with four modes (plain, `--with-activity`,
      `--admin <email>`, `--force`), 8 fake users, 34 curated spots covering all 7 provinces and
      all 10 activity types. `npm run seed`. Verified against local mongod: schema validation
      passes on all 34, the 2dsphere index answers the map query, vote aggregation returns
      sensible tallies, and `--with-activity` is reproducible across runs.
      Also fixed `db/connection.js`, whose default arg read `config.MONGO_URI` when
      `dotenv.config()` returns `{ parsed, error }`, so the default was always undefined.
- [ ] **3, toVisit / visited.** `PUT /spots/:id/status`, plus `myStatus` on the list route so the
      map can cross spots out in one request. **Next up.** The seeded `SpotEntry` data already
      exercises both states, so this can be verified against real rows immediately.
- [ ] **4, Votes.** `POST /spots/:id/vote` behind `hasVisited`; tallies on the detail route.
- [ ] **5, Reviews.** `routes/reviews.js` is written but **not mounted**, currently dead code.
      Mount at `/spots/:id/reviews` and verify. 37 seeded reviews are waiting for it.
- [ ] **6, Visit logs + photos.** Writes into `SpotEntry.logs[]`; admin gallery-promotion route.
- [ ] **7, Progress / logbook.** `GET /me/lists`, `GET /me/progress`, per-province and
      per-activity completion counts. This is the motivation loop.
- [ ] **8, Correct PROJECT_PLAN.md.** It still documents the wrong model: `POST /api/spots
      (auth required)` in the routes sketch, `/spots/new` and `/spots/:id/edit` in the pages
      sketch. Fix so the doc stops pulling us back toward user-created spots. Sweep its em
      dashes in the same pass.

## Open decisions, worth settling before the frontend

- **Spanish.** Production language should be Spanish; everything seeded so far is English. The
  decision worth making before content grows: does `description` become `{ es, en }`? Enum values
  (`difficulty`, `activityTypes`) stay English keys and get translated in the frontend, never in
  the database. Converting 34 hand-written entries later is real work.
- **Images.** URLs now, uploads later. `ImageSchema` already carries both `url` and `filename`
  (Cloudinary `public_id`), and that pairing is what makes the switch a non-migration: seeded
  photos have a URL and no public_id, uploads have both. Gap: `credit` is an ObjectId ref to a
  User, so an externally-licensed photo has nowhere to store attribution.
- **Spot data quality.** `grep -n "VERIFY:" server/seeds/spots.js`. What is flagged is only what
  would make a pin *wrong*, not imprecise:
  - 7 park pins are polygon centroids rather than entrances. Corcovado is the one that matters,
    since Sirena vs La Leona is a different trip, not a different parking lot.
  - 2 rafting pins (Pacuare, Sarapiquí) are river nodes, not put-ins.
  - 3 contested provinces: Chirripó, Rincón de la Vieja, Río Celeste.
  - 2 spots whose access may have closed: Cerro Chato (private land), Volcán Turrialba (activity).
  - Lowest confidence entry: Cerro Pelado. OSM has two by that name.

## Known debt

- `ACTIVITY_TYPES` / `PROVINCES` in `models/spot.js` are still a guess, Samuel to refine.
  All 10 activity types now have at least one spot, so removing one has a data cost.
- Optional numeric specs in the seeds (`trailLengthKm`, `waterfallHeightM`, `maxOccupancy`,
  elevation, duration) are indicative and deliberately **not** individually verified. They are
  display detail for a frontend that doesn't exist yet. Don't promote them to trip-planning data
  without a research pass. The file header is the only thing recording this.
- No request validation yet (Joi, plan Phase 8). `normalizeError` is a safety net at the database
  layer, not a substitute: it catches bad data late, with Mongoose's wording, not ours.
- No rate limiting, helmet, or mongo-sanitize yet (plan Phase 8).
- Image upload isn't wired (multer/cloudinary, plan Phase 5). `images[]` is empty on every seeded
  spot on purpose: a fabricated photo URL is a broken image, which is worse than none.
- Admin promotion is manual by design. `npm run seed -- --admin <email>` promotes without wiping;
  no route grants the role.
- Spot-level vote and visit tallies are aggregated on read. Fine at this scale; denormalize onto
  Spot only if the map view actually gets slow.

## Running it

```
cd server && npm install && npm run dev     # needs local MongoDB, port 3001
npm run seed                                # users + spots
npm run seed -- --with-activity             # plus fake visits, votes, reviews
npm run seed -- --admin <email>             # promote one account, wipes nothing
```

`npm run seed` wipes users, spots, entries and reviews. It refuses to run against a non-local
`MONGO_URI` unless you pass `--force`, because a stray Atlas string in `.env` would empty a real
database with no undo. Seeded logins are in `seeds/users.js`; `samuel@scarlata.test` is admin.

Postman collection: `server/postman/`, import both files and pick the "Scarlata, Local"
environment. Session cookies are handled automatically once you run Login.
