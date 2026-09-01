# Scarlata

A Costa Rican-based outdoor-spot tracker & personal visit logbook. Browse hiking trails, waterfalls, rivers,
camping spots, viewpoints and hot springs, log the ones you've actually visited, and watch your
own map fill in over time.

Scarlata is **not** a booking platform - there are no payments and no guides-for-hire. It's a
personal record of the ground you've covered, and a nudge to keep covering more.

> Named after "escarlata" / Guacamaya escarlata (the Scarlet Macaw).

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
