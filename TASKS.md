# Tasks

## Scope (MVP — do these first)

- Auth (done)
- Create trip
- My trips list
- Itinerary builder (add cities/stops + dates + activities)
- Itinerary view (day-wise / by city)
- Budget breakdown (totals + per-category)
- Public share link (read-only, no login)

## Stretch (only if time)

- City search with metadata
- Packing checklist
- Trip notes / journal
- Profile / settings
- Admin / analytics dashboard

## Frontend (Sumeet)

- All screens listed in MVP
- Auth pages (login, signup, “me” gate)
- Forms — use the same zod schemas the backend uses
- One `lib/api.ts` for all fetches (auth header, base URL)
- Routing, layout, navigation
- Charts for the budget screen (pick recharts or chart.js)
- Polish — empty states, loading, error toasts

## Backend (Nisha)

- Prisma models: Trip, Stop, Activity, Expense (+ whatever fits)
- CRUD endpoints under `/api/trips`, `/api/trips/:id/stops`, `/api/stops/:id/activities`, `/api/expenses`
- Budget aggregation endpoint (totals + breakdown by category)
- Public share — token on the trip row, public route that reads by token without auth
- Use the existing `requireAuth` middleware on private routes
- Throw `NotFound`, `Forbidden`, etc. — error middleware handles the rest

## Shared (both touch this)

- Add zod schemas + TS types in `shared/src/` for every resource
- One file per resource (`trip.ts`, `stop.ts`, `activity.ts`, `expense.ts`)
- Re-export from `shared/src/index.ts`

## How we sync

1. First 30 min: agree on the shape of Trip/Stop/Activity in `shared/`. Freeze it.
2. Nisha ships stub routes returning correctly-shaped data within hour 1.
3. Sumeet calls real endpoints from minute one — no mock layer.
4. Talk every 30 min: blockers, next thing.
5. Both push to `main`. Pull before push.

## Cutting rules

If anything blocks for >20 min, cut it from MVP and move on. Working > complete.
