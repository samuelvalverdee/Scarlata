# Scarlata

A personal outdoor-spot tracker for Costa Rica. Browse hiking trails, waterfalls, rivers,
camping spots, viewpoints and hot springs, log the ones you've actually visited, and watch your
own map fill in over time.

Scarlata is **not** a booking platform — there are no payments and no guides-for-hire. It's a
personal record of the ground you've covered, and a nudge to keep covering more.

> Named after "escarlata" / Guacamaya escarlata (the Scarlet Macaw).

## Status

Early / active development. The Express API has basic CRUD for spots (`server/`); the React
client (`client/`) hasn't been scaffolded yet. See [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) for
the full concept, schema rationale, phased roadmap, and open decisions.

## Tech stack

- **Backend:** Node.js, Express (JSON API only, no view engine), MongoDB + Mongoose
- **Auth:** Passport (local strategy) + express-session, once Phase 3 lands
- **Frontend:** React + Vite, Tailwind CSS, shadcn/ui, React Router, TanStack Query
- **Images:** Multer + Cloudinary (planned)
- **Maps:** Mapbox SDK for geocoding; rendering library still to be decided

## Repo structure

```
Scarlata/
  server/     Express API (scaffolded — see below)
  client/     Vite + React app (not yet scaffolded)
  PROJECT_PLAN.md
```

## Getting started (API)

```
cd server
npm install
npm run dev
```

Requires a local MongoDB instance running. The API listens on `http://localhost:3001` and
currently exposes:

```
GET    /api/spots
POST   /api/spots
GET    /api/spots/:id
PUT    /api/spots/:id
DELETE /api/spots/:id
```

## Background

Scarlata is a companion project to Udemy's "The Web Developer Bootcamp," built alongside the
course's YelpCamp lessons: same core concepts (Express, Mongoose, auth, image uploads, maps),
different domain, and a React/Tailwind/shadcn frontend instead of EJS. Backend work tracks the
course lesson-by-lesson; the React client is built later in batches against a finished API.

See [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) for the full write-up.
