# Scarlata — Project Plan
*(playing on "escarlata," from the Guacamaya escarlata / Scarlet Macaw — a Costa Rica outdoor-spot
tracker: hiking trails, waterfalls, rivers, camping spots, and other places to connect with
nature. Not a booking platform — a personal record of the ground you've covered, and motivation
to keep covering more.)*

Companion project to Udemy's "The Web Developer Bootcamp 2026," built alongside the YelpCamp
lessons using the same core concepts, but as a different app, with a React/Tailwind/ShadCN
frontend instead of EJS (a MERN split, not a MEEN/EJS stack).

## Concept

Costa Rica's outdoor spots — hiking trails, waterfalls (which often require hiking to reach),
rivers, camping spots, viewpoints, hot springs — with a personal visit log at the center. The core
loop: browse the map, visit a spot, log it, watch your own map fill in over time. It's motivation
to keep exploring new places, framed around *your* progress, not a catalog to buy something from.

**What this explicitly is not:** a tour-booking marketplace like Viator or TripAdvisor. Those
sell paid, guided packages (checked directly against both sites: every listing has a price, a
"Reservar"/Book button, and a commission-based ranking) to tourists who want someone else to
handle logistics. Scarlata has no payments, no guides-for-hire, no commission model — it's for
self-directed spots (many free, like camping at Cerro Pelado on your own for the sunrise) and for
tracking your own outdoor history, not selling anyone else's.

Inspired by real places like Cerro Pelado (camping + hiking + sunrise views, all at once) — real
spots often blend more than one activity, which shaped the schema below.

## Schema modeling: one Spot model, not one model per activity

Reviews, images, location, difficulty, visit logs — nearly every field is shared across a
waterfall, a hiking trail, and a camping spot. Separate models per activity type (`Waterfall`,
`HikingTrail`, `CampingSpot`...) would duplicate that shared structure across N models and N sets
of CRUD routes, and the map view (which needs every spot at once, regardless of type) would have
to query N collections and merge results instead of one `Spot.find({})`.

So: **one `Spot` model**, with an `activityTypes` array rather than a single `type` field — a
single field would force a place like Cerro Pelado to pick just one label (hiking? camping?
viewpoint?) when it's genuinely all three. Type-specific fields (trail length, waterfall height,
max camping occupancy...) live directly on the same schema as plain optional fields — left
`undefined` on documents where they don't apply, no `Mixed` type or discriminators needed. See
`server/models/spot.js` for the actual schema.

Querying is one new operator, not a rabbit hole: `Spot.find({ activityTypes: 'camping' })` for
one type, `Spot.find({ activityTypes: { $in: ['camping', 'hiking'] } })` for several.

The `ACTIVITY_TYPES` and `PROVINCES` lists in `server/models/spot.js` are starting points —
refine them; Costa Rica's category list is something you know better than this doc does.

## Who owns a spot

**Nobody does: spots are curated by us, not submitted by users.** The course's YelpCamp lets any
user create a campground and guards edits with `isAuthor`. That model doesn't fit here. A
user-submitted spot can't be verified as a real, reachable, publicly accessible place, and the
map's whole value is that every pin on it is real.

- **Writes to spots** come from two places only: the seed script (`server/seeds/`) and
  admin-gated routes (`role: 'admin'` on the User). There is no `author` on a spot; `addedBy` is
  a record of which admin created it, and no request can rewrite it. No route grants the admin
  role: promote by hand or with `npm run seed -- --admin <email>`.
- **Users interact with spots**, they don't create them: mark one `want` (to visit) or
  `visited`, vote, review, log trips with photos.
- **Votes and reviews require a visit.** You get an opinion on a place once you've been there.
- **Photos live on the user's visit log.** An admin can promote standouts into the spot's
  curated gallery, and the photo keeps a `credit` to whoever took it.
- **Businesses are allowed as spots**, not just natural features. For rafting the operator *is*
  the access point, so excluding them would leave real activities unmappable.

## How this gets built: backend-first, decoupled from the React client

Your own `YelpCamp` build (route + EJS view, together, exactly as each lesson teaches it) is
**untouched** by any of this — keep doing those lessons exactly as recorded, that's where you get
your EJS/Bootcamp reps.

For Scarlata specifically, the two halves are decoupled in time:

- **Same day as each lesson:** translate the *backend* concept only into `server/` — model,
  route, middleware. Verify it with Postman/Thunder Client (or curl) instead of a rendered page.
- **Later, in a batch:** once several endpoints exist (or once the course is done, whichever you
  prefer), build the matching React pages in `client/` against a finished, already-tested API.

This means you're never learning a new backend concept and translating it to React in the same
sitting — the Scarlata backend stays in lockstep with the course, and the React/Tailwind/ShadCN UI
happens on its own schedule.

## Translation cheat sheet: EJS lesson -> Scarlata backend

It's not just `res.json` instead of `res.render` — a small, fixed set of patterns changes
together. Once you've done it once or twice it's automatic; everything else (models, Mongoose
queries, middleware structure, async error handling, multer/cloudinary) carries over as-is.

| The course does (EJS) | Scarlata does (JSON API) |
|---|---|
| `res.render('campgrounds/index', { campgrounds })` | `res.json(spots)` |
| `res.redirect('/campgrounds')` after create/update | `res.status(201).json(spot)` — no redirect, the client decides where to navigate |
| `res.redirect(...)` after delete | `res.status(204).send()` — no body needed |
| `req.flash('success', '...')` then redirect | Skip `connect-flash` entirely server-side — just return the JSON body/status; the *client* shows a toast based on the response |
| `isLoggedIn` middleware: redirect to `/login` + flash if not authenticated | `res.status(401).json({ error: 'You must be signed in' })` |
| `isAuthor` middleware: redirect + flash if not the owner | `res.status(403).json({ error: 'You do not have permission to do that' })`. Spots have no owner here, so the check is `isAdmin`; only reviews keep an ownership check (`isReviewAuthor`) |
| Joi validation failure -> re-render form with errors | `res.status(400).json({ error: details })` — no re-render logic to write at all |
| `app.use(express.urlencoded({ extended: true }))` for HTML form bodies | `app.use(express.json())` for `fetch()`-sent JSON bodies (already in the scaffold) |
| `method-override` (`_method=PUT` trick for HTML forms) | Not needed — `fetch` can send a real PUT/DELETE directly |
| Central error handler renders an error page | Central error handler returns `res.status(err.statusCode).json({ error: err.message })` |
| Same-origin, no CORS needed | New: `cors` package + `credentials: true`, since the React client runs on a different port than the API (already stubbed in the scaffold) |

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Runtime | Node.js | |
| Backend framework | Express (JSON API, no view engine) | Course teaches EJS-rendered Express; here Express only serves `/api/*` JSON |
| Database | MongoDB + Mongoose | Same as course |
| Auth | passport, passport-local, passport-local-mongoose, express-session, connect-mongo | Session-cookie auth, same model as course — consumed from React via fetch with credentials include + CORS with credentials true |
| Validation | joi (server) | `server/schemas.js` + the `validate` middleware. Consider zod client-side too since React forms want their own validation. `utils/normalizeError.js` stays as the safety net for Mongoose errors |
| Images | multer, multer-storage-cloudinary, cloudinary | Same as course |
| Maps | @mapbox/mapbox-sdk (geocoding) + a rendering library TBD — see Open Decisions | Course only needs geocoding server-side; the rendering library is new since there's no more EJS+Mapbox GL script tag |
| Security | helmet, express-mongo-sanitize, sanitize-html | Same as course |
| Frontend build | Vite + React | New — course doesn't use this |
| Frontend styling | Tailwind CSS | |
| Frontend components | shadcn/ui | |
| Routing (frontend) | react-router-dom | |
| Data fetching | TanStack Query (react-query) | Recommended — mirrors the "don't refetch by hand" convenience EJS gets for free from server rendering |
| Forms | react-hook-form (+ zod resolver) | |

## Repo layout (confirmed)

```
Scarlata/
  server/           Express API, see below
  client/           Vite React app — not yet scaffolded, deferred to the React batch phase
```

One repo, two `package.json`s, run independently in dev (`npm run dev` in each; a root
`concurrently` script can wire them together once `client/` exists).

**`server/` is built out through the whole backend feature set** (everything in the API routes
section below):

```
server/
  app.js               Express app, CORS, sessions, router mounts under /api/v1
  config/passport.js   passport-local strategy
  db/connection.js     mongoose.connect(), db name 'scarlata'
  middleware.js        isLoggedIn, isAdmin, findSpot, hasVisited, isReviewAuthor
  models/              user, spot, spotEntry, review
  routes/              auth, spots, reviews, logs, me
  utils/               ExpressError, normalizeError (Mongoose errors -> honest 400/409)
  seeds/               seed script, 8 fake users, 34 curated spots
  postman/             collection + local environment covering every route
```

Run `npm install`, then `npm run dev` inside `server/` (needs local MongoDB and a `.env`, see
`.env.example`), and `npm run seed -- --with-activity` for a populated database. `client/` is
intentionally not created yet.

## Data models

**User** — username, email, password (via passport-local-mongoose), `role` (`user` | `admin`,
default `user`; nothing in the API grants admin).

**Spot** — name, description, images[] (`url`, `filename`, `credit`), location (GeoJSON Point),
province, activityTypes[], difficulty, bestTimeOfDay, plus optional type-specific fields
(trailLengthKm, elevationGainM, waterfallHeightM, swimmable, maxOccupancy, permitRequired...),
`addedBy` (ref User, set only when an admin creates it through the API). Curated, never
user-submitted; see "Who owns a spot". See `server/models/spot.js` for the current shape.

**Review** — spot (ref), author (ref User), rating (1-5), body. Same shape as YelpCamp's review,
with two Scarlata rules: one per person per spot (unique index), and you must have visited.

**SpotEntry** — one document per (user, spot): `status` (`want` | `visited`), `vote` (+1, -1 or
null, only on a visited spot), and `logs[]`, the "bitácora entries". Each log is a trip:
visitedAt, activitiesDone (from the spot's activityTypes), notes, photos[]. This one collection
is the whole "fill the spots on the map" mechanic: the to-visit list, the visited list, votes
and trip history are all views onto it, and a user's own map of Costa Rica fills in as their
visited entries accumulate. Logs are a subdocument array, not a collection, because they're
only ever read through their entry.

## API routes (sketch)

All under `/api/v1`. Every route below exists; `server/postman/` has a request for each.

```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
GET    /auth/me

GET    /spots                       public; adds myStatus per spot when signed in
                                    (?activityType / ?province filtering not built yet)
GET    /spots/:id                   public; includes votes: { up, down }
POST   /spots                       admin
PUT    /spots/:id                   admin
DELETE /spots/:id                   admin (cascades to entries and reviews)

PUT    /spots/:id/status            auth; { status: 'want' | 'visited' }
POST   /spots/:id/vote              auth + visited; { vote: 1 | -1 }
DELETE /spots/:id/vote              auth + visited

GET    /spots/:id/reviews           public
POST   /spots/:id/reviews           auth + visited
PUT    /spots/:id/reviews/:reviewId     review author or admin
DELETE /spots/:id/reviews/:reviewId     review author or admin

GET    /spots/:id/logs              auth; my logs for this spot
POST   /spots/:id/logs              auth + visited
PUT    /spots/:id/logs/:logId       auth + visited (my log only)
DELETE /spots/:id/logs/:logId       auth + visited (my log only)

GET    /spots/:id/log-photos        admin; every user photo on this spot
POST   /spots/:id/gallery           admin; promote a log photo into the gallery
DELETE /spots/:id/gallery?url=      admin

GET    /me/lists                    auth; { want: [...], visited: [...] }
GET    /me/progress                 auth; visited/total overall, by province, by activity
```

## Frontend pages (sketch — build these in the React batch phase, not lesson-by-lesson)

- `/` — home / hero
- `/spots` — list + map view (grid of cards + map markers, filterable by activityType/province)
- `/spots/:id` — spot detail: photos, description, votes, want/visited toggle, tabs for Reviews /
  My visit logs
- `/logbook` — the user's personal visit history ("mi bitácora") — the filling-in map lives here,
  fed by `/me/lists` and `/me/progress`, filterable by activity
- `/login`, `/register`
- No spot create/edit pages: spots are curated. An admin UI (spot editing, gallery promotion) is
  a possible later addition on top of the admin routes, not a user-facing form.

## Phased roadmap (mapped to where the course will take you)

Each phase below: build the backend piece alongside the matching course lesson (verify with
Postman); the "-> React" note is what gets batched into `client/` later, not done same-day.

Backend status: phases 1, 3, 4 and 7 are done; 5, 6 and 8 are partly done or not started, as
noted. Phase 2 (React) hasn't started.

1. **Express API + Mongoose CRUD for Spot** — done, and 34 curated spots are seeded. -> React:
   spot list + detail pages.
2. **Vite + React scaffold** — first React batch: wire up `client/`, list + detail pages against
   the API. Not started.
3. **Auth** — done: passport-local + sessions on the server. -> React: login/register pages + an
   "am I logged in" context/hook.
4. **Authorization** — done, but not the course's `isAuthor`: spots aren't user-owned (see "Who
   owns a spot"), so spot writes are gated by `isAdmin`, and `isReviewAuthor` is the only
   ownership check left. -> React: hide admin-only controls from non-admins.
5. **Images** — multer + cloudinary upload. Not started: images are URLs for now, and
   `ImageSchema` already carries `url` and `filename` (Cloudinary `public_id`) so the switch
   isn't a migration. -> React: multi-image upload form.
6. **Maps** — geocode spot addresses server-side (mapbox SDK). Not started (seeded spots carry
   hand-sourced coordinates). -> React: render markers/clusters, with whichever rendering
   library you land on (see Open Decisions), and an activityType filter.
7. **Nested resources: Reviews + visit logs + progress** — done. This is where Scarlata earns its
   keep beyond a YelpCamp reskin, and where the "fill the map" mechanic actually comes alive:
   want/visited status, votes, reviews, visit logs with photos, admin gallery promotion, and the
   `/me` logbook endpoints. -> React: review form, visit-log entry form, logbook/progress page.
8. **Validation & hardening** — **Joi is done** (pulled forward and built before image uploads,
   since uploads need the file and photo checks anyway). What stays here: zod + react-hook-form client-side, helmet, mongo-sanitize,
   sanitize-html, rate limiting.
9. **Deployment** — API + static client, per your project's "deployment" focus.

## Open decisions for later

- **`ACTIVITY_TYPES` / `PROVINCES` lists** — the ones in `server/models/spot.js` are a starting
  guess (ten activity types, from hiking and waterfall to rafting and snorkeling, plus the seven
  provinces). Refine freely as you think through the concept more — this is local knowledge, not
  a technical decision. Every activity type now has at least one seeded spot, so removing one
  has a data cost.
- **Spanish** (settled): spot content is stored in Spanish only, enum values stay English keys
  that the frontend maps to Spanish labels. Frontend details in TODO.md, step 5.
- **Mapping/rendering library** — you want to research this yourself once you get there. The
  course's Mapbox geocoding API call (server-side, turning an address into coordinates) is worth
  keeping regardless of what you pick for rendering — that part isn't the expensive one. What's
  open is the *client-side rendering* layer (the actual interactive map with pins). Options worth
  comparing when you get to Phase 6: Mapbox GL JS (what the course itself uses — still has a free
  tier but ties you to a Mapbox account/token), MapLibre GL JS (open-source fork of Mapbox GL,
  no account needed, works with free OpenStreetMap tiles), and Leaflet + OpenStreetMap (older,
  very well documented, lighter weight). No need to decide now.
- Optional stretch (post-course): AI-generated spot summaries, or natural-language search over
  spots, per the project's "ai integrations" focus.

## Naming history

- Settled on Scarlata — wordplay on "escarlata"/Guacamaya escarlata (Scarlet Macaw), checked
  clean against existing apps/companies, and "scarlet" carries a bold, vivid connotation in
  English on its own even without the bird reference.
