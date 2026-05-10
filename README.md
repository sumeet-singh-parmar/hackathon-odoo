# Traveloop

Personalized multi-city travel planning. Build itineraries, get an automatic
cost breakdown, pack the right things, take notes, and share the result with
friends or the wider community.

Built for the **Odoo Hackathon 2026** problem statement
(`Traveloop_Problem_Statment.pdf`). All 14 spec features are implemented.

---

## Live demo accounts

After seeding the database (see Setup), sign in at `http://localhost:5173/login`
with one of:

| Email                     | Password       | Role  | Has data                              |
| ------------------------- | -------------- | ----- | ------------------------------------- |
| `demo@traveloop.app`      | `hackathon123` | USER  | 5 demo trips, one public              |
| `sumeet@traveloop.app`    | `hackathon123` | ADMIN | Admin dashboard access                |
| `nisha@traveloop.app`     | `hackathon123` | ADMIN | Admin dashboard access                |

The `demo@` account's "A slow week in Lisbon" trip is public and reachable at
`http://localhost:5173/share/trv_lisbon_demo` — also linked from the Community
page and the dashboard's featured carousel.

---

## Feature checklist

Mapping to the PDF problem statement:

1. **Login / Signup** — JWT access + rotating refresh tokens, forgot-password
   email via Mailpit, reset-password by token.
2. **Dashboard** — popular-trips carousel, "your next trips" polaroid grid,
   live city search with sort / cost / region filters.
3. **Create Trip** — form with name, dates, currency, status, cover image
   upload. Optional pre-fill from a public trip suggestion.
4. **My Trips** — grouped by status (Ongoing, Planned, Drafts, Completed),
   searchable, with destination count + dates.
5. **Itinerary Builder** — add stops with city + dates, transport mode, notes;
   pin master activities to each stop with city-match validation.
6. **Itinerary View** — calendar / list toggle, day-wise grouping, activity
   blocks with time and cost.
7. **City Search** — full catalog of 25 cities, filterable by region and cost
   index, sortable by popularity / name / cost. Click a city to see its
   activity catalog and add it to a trip.
8. **Activity Search** — 125 catalogued activities filterable by type, max
   cost, max duration, and city. Click an activity to pin it to one of your
   own trips.
9. **Trip Budget** — per-category pie + per-day bar charts, average per day,
   over-budget day alerts, manual + auto expenses with `isAuto` flag, one-shot
   auto-estimate from city cost index.
10. **Packing Checklist** — 4 categories (clothing / documents / electronics /
    other), per-item check-off with progress bar, reset everything.
11. **Public Share** — one-click `Make public` flips a trip to a shareable
    `shareSlug`, generates a copy-able URL, public read-only view, deep-clone
    "Copy to my trips" preserves stops / activities / expenses / packing /
    notes (with stop-id remapping).
12. **Profile** — editable first name, last name, username, phone, city,
    country, language, bio, and avatar upload. Saved destinations bucket-list.
    Danger zone: sign out everywhere + delete account.
13. **Trip Notes** — chronological feed per trip, optional stop linkage, edit
    + delete.
14. **Admin / Analytics** — totals row (users, trips, public trips, stops,
    expenses, pinned activities), top-5 cities and activities by usage,
    average trip budget + days, recent users + trips, paginated user table
    with promote / demote / delete, paginated trip moderation table.

Bonus: **Community** page (`/community`) — feed of public trips other
travellers have shared.

---

## Tech stack

### Client (`client/`)

- **React 19** + **Vite 6** + **TypeScript** strict
- **Tailwind 3** with a custom cartoonish theme (Fredoka + Caveat + Nunito,
  warm cream surface, coral primary, stamp-style shadows)
- **React Router 7** for routing
- **TanStack Query 5** for server-state
- **React Hook Form** + **Zod** (`@hookform/resolvers`) for forms
- **Recharts** for budget pie + bar
- **Lucide** for icons

### Server (`server/`)

- **Node.js 20+** + **TypeScript** strict
- **Express 5**
- **Prisma 6** ORM
- **PostgreSQL 16** (Docker)
- **Zod** for request validation
- **bcryptjs** for password hashing
- **jsonwebtoken** for access tokens (15m TTL) + rotating refresh tokens
  (30d TTL, hashed at rest)
- **multer** for multipart uploads (avatars + trip covers)
- **nodemailer** + **Mailpit** for forgot-password emails (local SMTP)
- **helmet** + **cors** + **express-rate-limit**

### Shared (`shared/`)

- One file per resource, each with Zod schemas + inferred TypeScript types
- Imported by both client and server via the `@hackathon/shared` workspace
  package — request bodies and response shapes stay aligned at compile time

### Infrastructure

- **npm workspaces** monorepo (root + client + server + shared)
- **Docker Compose** for local Postgres + Mailpit
- **concurrently** to boot client + server with one `npm run dev`

---

## Project layout

```
hackathon-odoo/
├── client/                       Vite + React frontend
│   └── src/
│       ├── App.tsx               route table
│       ├── main.tsx              providers (Query, Auth, Toast, Router)
│       ├── pages/                14 route-level screens
│       ├── components/           shared UI, sub-grouped:
│       │   ├── primitives/       Button, Card, Spinner, Badge, Avatar
│       │   ├── forms/            Input, Textarea, Select, DateRange,
│       │   │                     SearchFilterBar, AvatarPicker, TripCoverPicker
│       │   ├── feedback/         Modal, Toast, ErrorBanner, EmptyState
│       │   ├── layout/           AppLayout, TopBar, PageHeader, Container
│       │   ├── navigation/       NavLink, Tabs, UserMenu
│       │   ├── data-display/     StatCard, PolaroidCard, Pagination
│       │   └── charts/           PieBreakdown, BarTrend
│       ├── features/             one folder per domain: auth, trips,
│       │                         itinerary, cities, activities, budget,
│       │                         packing, notes, share, profile, admin
│       │   └── <feature>/
│       │       ├── api/          fetch wrappers, shape mappers
│       │       ├── hooks/        TanStack Query hooks
│       │       └── components/   feature-specific UI
│       └── lib/                  api.ts, auth.ts, format.ts, uploads.ts,
│                                 cn.ts, refresh.ts
│
├── server/                       Express + Prisma backend
│   ├── prisma/
│   │   ├── schema.prisma         User + auth tables + 9 domain models
│   │   ├── migrations/           init + add_city_image_url
│   │   └── seed.ts               cities, activities, demo users + trips
│   ├── seed/
│   │   ├── cities.json           25 cities w/ Unsplash imageUrl
│   │   └── activities.json       125 activities, 6 types
│   └── src/
│       ├── index.ts              http listener
│       ├── app.ts                helmet, cors, json, /uploads static, /api
│       ├── routes.ts             top-level mount table
│       ├── core/                 prisma, errors, slug, cache, env,
│       │                         middleware (validate, error, cache-control)
│       └── modules/              vertical slices
│           ├── auth/             register / login / refresh / logout / me /
│           │                     forgot / reset / DELETE me, repositories,
│           │                     transports, mailer, multipart avatar
│           ├── admin/            stats, listUsers, listTrips, role mgmt
│           ├── cities/
│           │   ├── city/         search, getById (cached)
│           │   └── catalog/      activity-catalog search, getById (cached)
│           ├── trips/
│           │   ├── trip/         CRUD + featured + status + cover upload
│           │   ├── stop/         add / update / remove / reorder
│           │   ├── activity/     pin / edit / unpin TripActivity
│           │   ├── budget/       expense CRUD + breakdown + auto-estimate
│           │   ├── packing/      list / add / toggle / remove / reset
│           │   └── note/         list / add / update / remove
│           ├── share/            share / unshare / public read / copy-trip
│           └── profile/
│               └── saved-destinations/   bucket list
│
├── shared/
│   └── src/
│       ├── auth.ts        RegisterSchema, LoginSchema, AuthUser,
│       │                  UpdateMeSchema, Forgot/Reset, AuthResponse
│       ├── trip.ts        Trip (client), TripSummary, TripDetail,
│       │                  CreateTripSchema, UpdateTripSchema, TripStatus
│       ├── stop.ts        StopResponse + Stop + Create/Update/Reorder
│       ├── activity.ts    ActivityResponse + master-catalog search
│       ├── tripActivity.ts pinned activity (master + per-stop overrides)
│       ├── city.ts        CityResponse + CitySearchQuerySchema
│       │                  (sort + costMax + region + q + page + limit)
│       ├── expense.ts     ExpenseResponse + Create/Update + categories
│       ├── budget.ts      BudgetBreakdown + client `Budget` shape
│       ├── packing.ts     PackingItemResponse + PackingCategory enum
│       ├── note.ts        TripNoteResponse + Create/Update
│       └── admin.ts       AdminUser, AdminStatsResponse, top cities/
│                          activities, list-users / list-trips queries
│
├── docker-compose.yml            postgres + mailpit
├── package.json                  workspaces + scripts
└── Traveloop_Problem_Statment.pdf
```

---

## Database schema

11 Prisma models (see `server/prisma/schema.prisma`):

```
User ── 1:n ── RefreshToken
     ── 1:n ── PasswordReset
     ── 1:n ── Trip                                       (ownerId)
     ── 1:n ── SavedDestination                           (userId)

Trip ── 1:n ── Stop                                       (tripId)
     ── 1:n ── Expense                                    (tripId)
     ── 1:n ── PackingItem                                (tripId)
     ── 1:n ── TripNote                                   (tripId)

Stop ── n:1 ── City                                       (cityId)
     ── 1:n ── TripActivity                               (stopId)
     ── 1:n ── TripNote                                   (stopId, optional)

City ── 1:n ── Activity                                   (cityId)
     ── 1:n ── SavedDestination

Activity ── 1:n ── TripActivity                           (activityId)
```

Key constraints:

- `@@unique([tripId, orderIndex])` on Stop — composite unique enforces a
  reorder discipline (the service uses a 2-pass update inside a transaction).
- `@unique` on `Trip.shareSlug` — public share links are guaranteed unique.
- `costIndex Float` on City — multiplied by base rates in the budget
  auto-estimator.
- Cascading deletes from User → Trip → Stop / Expense / PackingItem /
  TripNote so deleting an account or a trip cleans up its tree.

---

## API surface

All routes are mounted under `/api`. JSON in / JSON out unless noted.

**Auth** (`/api/auth`)

```
POST   /register              multipart, optional avatar
POST   /login
POST   /refresh
POST   /logout
POST   /logout-all
GET    /me
PATCH  /me                    multipart, optional avatar
DELETE /me
POST   /forgot-password       (rate-limited)
POST   /reset-password
```

**Trips** (`/api/trips`)

```
POST   /                      multipart, optional cover photo
GET    /                      paginated, ?page=&limit=
GET    /featured              public, top 6 public trips, no auth
GET    /:id                   detail with nested stops + activities
PATCH  /:id                   multipart, optional cover photo
DELETE /:id
POST   /:tripId/share         flip public + generate slug
DELETE /:tripId/share         flip private
POST   /:tripId/stops
PATCH  /:tripId/stops/reorder
GET    /:tripId/budget
POST   /:tripId/budget/auto-estimate
GET    /:tripId/budget/expenses
POST   /:tripId/budget/expenses
GET    /:tripId/packing
POST   /:tripId/packing
POST   /:tripId/packing/reset
GET    /:tripId/notes
POST   /:tripId/notes
```

**Standalone resources**

```
PATCH  /api/stops/:id
DELETE /api/stops/:id
POST   /api/stops/:stopId/activities      pin master activity to stop
PATCH  /api/trip-activities/:id           edit scheduledTime/customCost/notes
DELETE /api/trip-activities/:id           unpin
PATCH  /api/expenses/:id
DELETE /api/expenses/:id
PATCH  /api/packing-items/:id
DELETE /api/packing-items/:id
PATCH  /api/notes/:id
DELETE /api/notes/:id
GET    /api/saved-destinations
POST   /api/saved-destinations            { cityId }
DELETE /api/saved-destinations/:cityId
```

**Cities + activity catalog** (`/api/cities`)

```
GET    /                     ?q=&country=&region=&sort=popularity|name|cost
                             &costMax=1..4&page=&limit=
GET    /:id
GET    /activities/search    ?q=&cityId=&type=&maxCost=&maxDuration=&page=&limit=
GET    /activities/:id
```

**Public** (`/api/public`, no auth)

```
GET    /trips/:slug          read-only TripDetail, Cache-Control max-age=60
POST   /trips/:slug/copy     (auth required) deep-clone into caller's account
```

**Admin** (`/api/admin`, ADMIN role required)

```
GET    /stats                totals + top cities + top activities + averages
                             + recent users + recent trips
GET    /users                ?page=&pageSize=&q=
PATCH  /users/:id            { role } — promote/demote, can't self-edit
DELETE /users/:id            can't self-delete
GET    /trips                paginated trip moderation list
```

---

## Setup

### Prerequisites

- **Node.js ≥ 20**
- **Docker Desktop** (for Postgres + Mailpit)

### One-time

```bash
# clone + install
git clone https://github.com/sumeet-singh-parmar/hackathon-odoo.git
cd hackathon-odoo
npm install

# server env
cp server/.env.example server/.env
# (the defaults work out of the box for local dev)

# database
docker compose up -d              # postgres on :5432, mailpit on :1025/8025
npm --workspace server run prisma:migrate
npm --workspace server run seed   # 25 cities, 125 activities, 3 demo users, 5 trips
```

### Run

```bash
npm run dev
```

That single command:

1. boots Postgres + Mailpit via `docker compose up -d --wait`
2. runs the server on `http://localhost:4000` (`tsx watch`)
3. runs the client on `http://localhost:5173` (Vite, with `/uploads` proxied
   to the server so cover images render with relative URLs)

Stop everything with `Ctrl+C`. Postgres / Mailpit keep running in the
background; `npm run stop` brings them down.

### Useful one-offs

```bash
npm run typecheck                                     # both workspaces
npm --workspace server run prisma:studio              # GUI for the DB
npm --workspace server run seed                       # idempotent re-seed
docker compose logs -f db                             # postgres logs
```

---

## How the stack hangs together

### Auth flow

- `POST /register` (multipart, optional avatar) → 201 with the new public
  user.
- `POST /login` → returns `{ user, accessToken, refreshToken }`. Access
  token is a 15-minute JWT with `userId + role`. Refresh token is a long
  random string; only its hash is stored in the `RefreshToken` table.
- Client puts `accessToken` in `localStorage` and sends it as
  `Authorization: Bearer <token>` on every authed call.
- On a 401 response, the client's `api()` helper hits `/refresh` with the
  stored refresh token, gets a new access token + a rotated refresh token
  (the old one is revoked), and retries the original call once.
- `POST /logout` revokes one refresh token; `POST /logout-all` revokes
  every active session for the user.
- `forgot-password` writes a hashed reset token to `PasswordReset` and
  emails the plaintext token via Mailpit. `reset-password` consumes it
  exactly once.

### Trip data model

A trip has stops; each stop is anchored to a single city and a date range.
`TripActivity` is a join row that pins a master `Activity` (city catalog
entry) to a stop, with optional `customCost` / `scheduledTime` / `notes`
overrides. Pinning enforces that the activity's `cityId` matches the
stop's `cityId` server-side — the client UX surfaces only matching stops
when you "Pin to one of your trips".

### Budget auto-estimate

`POST /api/trips/:tripId/budget/auto-estimate` wipes the trip's existing
auto-rows (`isAuto = true`) and regenerates them from the trip's stops:

- **Transport**: one row per stop on the arrival day,
  `100 * city.costIndex`.
- **Stay**: one row per day per stop, `80 * city.costIndex`.
- **Meals**: one row per day per stop, `40 * city.costIndex`.
- **Activities**: sum of pinned activities (using `customCost ?? baseCost`)
  on each stop's start date.

Manual rows (`isAuto = false`) survive re-estimates. The breakdown
endpoint returns totals + per-category + per-day arrays + `overBudgetDays`
(any day above 1.5× the running average).

### Public sharing + copy-trip

`POST /api/trips/:tripId/share` flips `isPublic = true` and assigns a
12-char base64-url slug if the trip doesn't have one. `GET /api/public/
trips/:slug` returns the full nested `TripDetail` with no auth (with a
60-second `Cache-Control`). `POST /api/public/trips/:slug/copy` (auth
required) runs a single Prisma transaction that:

1. creates a new Trip with `name = "<source.name> (copy)"`, `isPublic =
   false`, owner = caller.
2. for each source stop, creates a new stop and remembers the `oldStopId
   → newStopId` mapping.
3. `createMany` clones every TripActivity onto the new stops.
4. clones expenses (preserving `isAuto`), packing (resets `isPacked`),
   and notes (re-pointing stop-level notes via the stop-id map).

### Module structure on the server

Each `modules/<resource>/` slice owns its own:

- `<resource>.routes.ts` — only HTTP concerns (validate, parse params, call
  service, shape response)
- `<resource>.service.ts` — business logic, ownership checks, validation,
  transactions
- `<resource>.repository.ts` (where present) — Prisma calls
- shared `Prisma.<Resource>Select` constants so route + service agree on
  the response shape exactly

`modules/auth/` ships richer infrastructure: `transports/` (cookie vs body
strategies for tokens), `repositories/` (user, refresh-token,
password-reset), `services/` (auth, password, token, reset, mailer),
`middleware/` (require-auth, require-role, rate-limit, avatar-upload).

### Shared cache invalidation

Mutations under a trip flush a single helper, `invalidateTrip(qc, tripId)`
(`client/src/features/trips/hooks/invalidate.ts`), that flushes every
overlapping React Query key — `["trip", tripId]`, `["trips"]`, `["trips",
"featured"]`, `["stops", tripId]`, `["budget", tripId]`, `["packing",
tripId]`, `["notes", tripId]` — so the trip header, list, budget, and
sub-tabs all stay in sync without a refresh.

---

## Visual language

Cartoonish on purpose, tuned to feel like a paper travel journal:

- **Fonts**: Fredoka (display, all headings), Nunito (body), Caveat
  (handwritten accents on trip names and "hand" lines).
- **Palette**: warm cream `#FEF7ED` background, coral `#F45D44` primary,
  teal `#34A89E` accent, gold `#F5BC49`, ink `#2D2D3C`.
- **Components**: stamp-style buttons with a 4px solid offset shadow,
  polaroid trip cards with a slight rotate, postcard stop cards with a
  dashed border + corner stamp, paper-plane bouncing spinner, dotted
  texture on the page background.

---

## Stuff that's gitignored

- `node_modules/`, `dist/`, `.env`, `.env.local`, `*.log`, `.DS_Store`
- `_nisha/` — a clone of Nisha's pre-merge backend kept locally as a
  reference; not part of the running app.
- `server/uploads/` — runtime user uploads (avatars + trip covers).

---

## Known trade-offs

- Money fields are `Float` rather than `Decimal` — Prisma's Decimal
  returns Decimal.js instances and the demo doesn't need fractional cents.
- LRU cache on city + activity catalog reads is in-process (no Redis) —
  fine for the data sizes here.
- Saved-destinations UI is minimal (heart toggle in the city detail
  modal); no dedicated bucket-list page.
- Mailpit + JWT secret in `.env.example` are dev-only — production would
  swap to a real SMTP relay and a stronger secret.
- The auto-budget rates ($80 stay / $40 meals / $100 transport per stop,
  modulated by cost index) are crude. Realistic enough that Tokyo costs
  more than Bangkok; not a substitute for actual booking prices.
