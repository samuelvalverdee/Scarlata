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

Reviews, images, location, difficulty, author, visit-logs — nearly every field is shared across a
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
| `isAuthor` middleware: redirect + flash if not the owner | `res.status(403).json({ error: 'Not authorized' })` |
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
| Validation | joi (server) | Course's approach; consider zod client-side too since React forms want their own validation |
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
  server/           Express API — scaffolded, see below
  client/           Vite React app — not yet scaffolded, deferred to the React batch phase
```

One repo, two `package.json`s, run independently in dev (`npm run dev` in each; a root
`concurrently` script can wire them together once `client/` exists). Samuel is initializing the
git repo himself.

**`server/` is already scaffolded** with a Phase 1 starting point, matching where your `YelpCamp`
build currently is (basic CRUD, pre-auth):

```
server/
  app.js               Express app + CORS (origin http://localhost:5173 for the future Vite client)
  db/connection.js     mongoose.connect(), mirrors YelpCamp/db/connection.js — db name 'scarlata'
  models/spot.js       Spot schema — see "Schema modeling" above
  package.json         express, mongoose, cors + nodemon
  .gitignore
```

`GET/POST /api/spots` and `GET/PUT/DELETE /api/spots/:id` are wired up and return JSON — run
`npm install` then `npm run dev` inside `server/` (with local MongoDB running) and hit them from
Postman/Thunder Client. `client/` is intentionally not created yet.

## Data models

**User** — username, email, password (via passport-local-mongoose)

**Spot** — name, description, images[], location (GeoJSON Point), province, activityTypes[],
difficulty, bestTimeOfDay, plus optional type-specific fields (trailLengthKm, elevationGainM,
waterfallHeightM, swimmable, maxOccupancy, permitRequired...), author (ref User). See
`server/models/spot.js` for the current shape — extend as needed.

**Review** — spot (ref), author (ref User), rating (1-5), body — same shape as YelpCamp's review.

**VisitLog** ("bitácora entry" / a footprint left on the map) — user (ref), spot (ref), date,
activityDone (which of the spot's activityTypes you actually did), notes, photos, personal
rating. This is the "fill the spots on the map" mechanic — a user's own map of Costa Rica fills
in visually as their VisitLog entries accumulate.

## API routes (sketch)

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/spots                 (supports ?activityType=camping filtering later)
POST   /api/spots                (auth required)
GET    /api/spots/:id
PUT    /api/spots/:id            (auth + author only)
DELETE /api/spots/:id            (auth + author only)

POST   /api/spots/:id/reviews    (auth required)
DELETE /api/reviews/:id          (auth + review author only)

POST   /api/spots/:id/logs       (auth required — log a visit)
GET    /api/users/me/logbook     (auth required — my visit history / my footprint map)
```

## Frontend pages (sketch — build these in the React batch phase, not lesson-by-lesson)

- `/` — home / hero
- `/spots` — list + map view (grid of cards + map markers, filterable by activityType/province)
- `/spots/:id` — spot detail: photos, description, tabs for Reviews / Visit reports
- `/spots/new`, `/spots/:id/edit` — forms (auth + author gated)
- `/logbook` — the user's personal visit history ("mi bitácora") — the filling-in map lives here,
  filterable by activity
- `/login`, `/register`

## Phased roadmap (mapped to where the course will take you)

Each phase below: build the backend piece alongside the matching course lesson (verify with
Postman); the "-> React" note is what gets batched into `client/` later, not done same-day.

1. **Express API + Mongoose CRUD for Spot** — done (server scaffold above). -> React: spot list +
   detail pages.
2. **Vite + React scaffold** — first React batch: wire up `client/`, list + detail pages against
   the Phase 1 API. No auth yet.
3. **Auth** — passport-local + sessions on the server; -> React: login/register pages + an
   "am I logged in" context/hook.
4. **Authorization** — `isAuthor`-style middleware (course teaches this on campgrounds); apply to
   Spot edit & delete. -> React: hide/disable edit-delete UI for non-owners.
5. **Images** — multer + cloudinary upload. -> React: multi-image upload form.
6. **Maps** — geocode spot addresses server-side (mapbox SDK). -> React: render markers/clusters,
   with whichever rendering library you land on (see Open Decisions), and an activityType filter.
7. **Nested resources: Reviews + VisitLog** — this is where Scarlata earns its keep beyond a
   YelpCamp reskin, and where the "fill the map" mechanic actually comes alive. -> React: review
   form, visit-log entry form, logbook/progress page.
8. **Validation & hardening** — joi schemas server-side, zod + react-hook-form client-side,
   helmet/mongo-sanitize/sanitize-html.
9. **Deployment** — API + static client, per your project's "deployment" focus.

## Open decisions for later

- **`ACTIVITY_TYPES` / `PROVINCES` lists** — the ones in `server/models/spot.js` are a starting
  guess (hiking, waterfall, river, camping, viewpoint, hot-springs, swimming-hole). Refine freely
  as you think through the concept more — this is local knowledge, not a technical decision.
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

- Started as CragLog (climbing-only concept).
- Pivoted to Trillo when the concept broadened to all Costa Rica outdoor activities — dropped
  because it reads too close to "Trello."
- Renamed to Huella ("footprint") — fit the fill-the-map/visit-tracking mechanic directly, but
  the search kept going.
- Settled on Scarlata — wordplay on "escarlata"/Guacamaya escarlata (Scarlet Macaw), checked
  clean against existing apps/companies, and "scarlet" carries a bold, vivid connotation in
  English on its own even without the bird reference.
