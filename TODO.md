# Scarlata — working to-do

Scratch file for cross-session continuity. Not the plan — [PROJECT_PLAN.md](PROJECT_PLAN.md) is.
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

## Parts

- [x] **1 — Ownership correction.** `routes/spots.js`: public reads, admin-gated writes, `author`
      gone. Verified: 200 signed-out read, 401 signed-out write, 403 non-admin write, 201/200/204
      as admin.
- [x] **1.5 — Honest error codes.** `utils/normalizeError.js` — Mongoose validation -> 400 with
      per-field details, CastError -> 400, duplicate key -> 409. `routes/auth.js` register no
      longer swallows errors into a local 400 that leaked raw driver text.
- [ ] **2 — Seeds + an admin account.** `seeds/` script, real Costa Rica spots, a way to promote
      an account to admin. *Coordinates and provinces need Samuel's eyes — local knowledge.*
- [ ] **3 — toVisit / visited.** `PUT /spots/:id/status`, plus `myStatus` on the list route so the
      map can cross spots out in one request.
- [ ] **4 — Votes.** `POST /spots/:id/vote` behind `hasVisited`; tallies on the detail route.
- [ ] **5 — Reviews.** `routes/reviews.js` is written but **not mounted** — currently dead code.
      Mount at `/spots/:id/reviews` and verify.
- [ ] **6 — Visit logs + photos.** Writes into `SpotEntry.logs[]`; admin gallery-promotion route.
- [ ] **7 — Progress / logbook.** `GET /me/lists`, `GET /me/progress` — per-province and
      per-activity completion counts. This is the motivation loop.
- [ ] **8 — Correct PROJECT_PLAN.md.** It still documents the wrong model: `POST /api/spots
      (auth required)` in the routes sketch, `/spots/new` and `/spots/:id/edit` in the pages
      sketch. Fix so the doc stops pulling us back toward user-created spots.

## Known debt

- `ACTIVITY_TYPES` / `PROVINCES` in `models/spot.js` are still a guess — Samuel to refine.
- No request validation yet (Joi, plan Phase 8). `normalizeError` is a safety net at the database
  layer, not a substitute: it catches bad data late, with Mongoose's wording, not ours.
- No rate limiting, helmet, or mongo-sanitize yet (plan Phase 8).
- Image upload isn't wired (multer/cloudinary, plan Phase 5). `images[].filename` and
  `logs[].photos[].filename` exist for Cloudinary's public_id but stay undefined until then.
- Admin promotion is manual (edit the document in the database). Deliberate — no route grants it.
- Spot-level vote and visit tallies are aggregated on read. Fine at this scale; denormalize onto
  Spot only if the map view actually gets slow.

## Running it

```
cd server && npm install && npm run dev     # needs local MongoDB, port 3001
```

Postman collection: `server/postman/` — import both files, pick the "Scarlata — Local"
environment. Session cookies are handled automatically once you run Login.
