# sumeet log

## auth
- module-first layout — modules/auth, modules/admin, core for cross-cutting
- repository pattern + service split — auth, token, password, reset, mailer, admin
- token transport is a strategy — body now, httponly cookie later by swapping one class
- split tokens — access JWT (15m) in header, refresh (30d) hashed in db, rotates on refresh
- real logout — revokes the refresh row in db, plus logout-all to nuke every session
- forgot password — request a link, email lands in mailpit, click → reset
- mailer is a strategy interface — swap to resend / gmail later by adding a class
- rate limit on login, register, forgot — 5 hits per 15 min per ip
- role on user — user / admin, requireRole middleware, can't change/delete self
- unique username on user (3-20 lowercase alnum + underscore)
- avatar upload — multer to local disk, served from /uploads, swap out old file on edit
- registration takes firstName, lastName, phone, city, country, additionalInfo, optional avatar
- admin user management — list with pagination, promote/demote, delete
- admin stats — total users, new users 7d, active users 7d (lastLoginAt)
- helmet headers + cors locked to one origin
- constant-time login — dummy bcrypt compare on missing user
- path aliases (@/...) everywhere, no relative imports

## auth client
- shared zod schemas in @hackathon/shared — client + server validate against the same source
- AuthProvider context — hydrates user on boot via me() when access token is present
- register auto-logs in after success — re-submits email + password to login since /register doesn't return tokens
- RequireAuth wrapper — redirects to /login with state.from for return-after-login
- access + refresh tokens in localStorage
- .trim() in shared schemas on email / username / names / phone / city / country
- password not trimmed — whitespace is legal in passwords

## refresh wiring (client)
- lib/base-url.ts — single api base, removes duplication between api.ts and feature apis
- lib/auth-events.ts — pub/sub for session lifecycle (onSessionEnded / emitSessionEnded)
- lib/refresh.ts — single-flight refreshAccessToken(), concurrent 401s share one rotation since refresh is single-use server-side
- lib/api.ts — on 401 for authed calls, refresh once and retry once, surface original 401 if refresh dies
- AuthProvider subscribes to session-ended — flips user to null mid-session, RequireAuth handles the redirect
- raw fetch in refresh.ts — avoids circular import with api.ts

## dashboard restructure
- top hero now a popular-trips carousel — auto-rotate (6s, pauses on hover/focus), prev/next arrows, pagination dots, arrow-key nav, slide is full-bleed cover image with gradient overlay
- new feature endpoint `listFeatured()` returns trips where `visibility === "PUBLIC"` (3-4 today)
- search bar + group/filter/sort row above "Popular right now" — server-side search, paginated
- search input is debounced 300ms, inline spinner replaces the search icon while typing or fetching
- pagination controls below the city grid, hidden when only one page
- `placeholderData: keepPreviousData` on react-query so the previous page stays visible while the next loads (no flash)
- empty state when search has zero matches: "No cities match '{q}'"
- group by / filter / sort by — visual placeholders only, todo to wire up

## nisha — what we need server-side
- **GET /api/cities** — returns `CityListResponse` (`{ items, total, page, limit }`). Query schema is in `shared/src/city.ts` as `CitySearchQuerySchema`: `q?`, `country?`, `region?`, `sort` (popularity | name | cost — default popularity desc, others asc), `costMax?` (1-4), `page` (default 1), `limit` (default 12, max 100). Empty `q` returns the unfiltered set sorted by `sort` — that's also what the dashboard's "Popular right now" reads (no separate popular endpoint needed).
- **GET /api/trips/featured** — returns `Trip[]` of public trips for the dashboard banner carousel. Probably any user's public trips, ordered by recent + a popularity signal (likes / views) when we have one. For now ordering doesn't matter — we just pull the first 3-4.
- **shared types are out of sync** — client uses `Trip`, `City`, `Stop`, `Activity`, `Note`, `PackingItem`, `Budget`, `AdminStats`; server has `TripDetail/TripSummary`, `CityResponse`, `StopResponse` etc. They have different field names (e.g. `coverUrl` vs `coverPhotoUrl`, `visibility` vs `isPublic`, `budget` vs `totalBudget`). I added a client-side `Trip` to `shared/src/trip.ts` and unified `City` in `shared/src/city.ts` so the dashboard compiles. Long-term — let's converge on one shape per resource and either rename or map at the response boundary. Today the rest of the client (CreateTripForm, dummy/budget, dummy/itinerary, dummy/notes, dummy/packing, dummy/users) still reference types that don't exist yet — those need compat exports or a sweep to align with your new shapes.
- fixed a small server bug while in there — `modules/trips/routes.ts` was importing `tripPackingRouter` but the export is `packingRouter`.
