# El Sayed Hassan Auto — Backend Plan

ASP.NET Core Web API (**.NET 10**, installed on this machine) + **SQL Server** + **EF Core**.
Admin dashboard lives **inside the existing Angular app** under `/admin` (one project, one deploy).

## How to work (read first)

- One task per message: the user says **"Start F3"** → do only F3, verify it, tick it `[x]` here, stop.
- Keep each task small; don't read big files you don't need (`i18n/ar.ts`, `i18n/en.ts` are large — grep them).
- Frontend: `frontend/` (Angular 22, standalone, signals, Tailwind v4, AR/EN). Overview of what exists: `ROADMAP.md`.
- Backend goes in a new folder: `backend/` (repo root). Never commit secrets (use user-secrets locally, host env vars in production).
- Live site: https://elsayedhassanauto.com (Cloudflare Pages project `elsayed-hassan-auto`, auto-deploys on push to `main`; DNS on Cloudflare, www → root 301 rule). API will be `https://api.elsayedhassanauto.com`.
- Keep `frontend/src/app/data/*.ts` — they are the seed data for the DB and are also used by `scripts/prerender-meta.mts` at build time.

## Decisions already made

- Hosting for API + DB: **MonsterASP.NET** (free/cheap, supports .NET + SQL Server). Cloudflare Pages can't run .NET.
- Admin = Angular `/admin` route, lazy-loaded, `noindex`.
- Car **tracking** page: postponed (not built in the backend for now). Booking → WhatsApp stays.
- Services, tips and model pages stay static in the frontend for now.
- Slot rule: **3 cars per hour** (setting), open 10:00–22:00 daily; owner can close days/hours.

## Current frontend data shapes (to mirror in the API)

- `catalog.ts`: `Tr {ar,en}`, `Category {id, icon, name}`, `Product {slug, cat, icon, brand, name, desc, price, oldPrice?, models[], inStock, featured?, badge?}`, `Offer {id, icon, title, desc, discount, price?, oldPrice?, endsAt, service?, includes[]}`
- `reviews.ts`: `Review {id, name, model, year, service, rating, date, text}`
- `gallery.ts`: `GalleryItem {id, cat, icon, tall?, title, img?}`, `BeforeAfter {id, icon, title, desc, before?, after?}`
- `pricing.ts`: `Job {id, service, name, min, max}`, `MODEL_FACTOR`, `ALT_FACTOR`
- `tracking.ts`: bookings currently saved in `localStorage` (`sha-bookings`) incl. `date`, `hour`
- Booking page: `pages/book/book.ts` (+ `.html`) — `left(iso, hour)` is the mock availability to replace.
- Models list + generations: `core/site.ts` (`SITE.models`, `SITE.generations`)

---

## E — Setup

- [x] **E1** Create `backend/ElSayedHassan.slnx` + `ElSayedHassan.Api` (webapi, controllers), `.gitignore`, run it, OpenAPI/Scalar UI works
- [x] **E2** Add EF Core SQL Server + `AppDbContext` + connection string (LocalDB for dev) + first migration
- [x] **E3** CORS (`http://localhost:4200`, `https://elsayedhassanauto.com`), ProblemDetails errors, `GET /health`
- [x] **E4** Shared bits: `Tr` owned type (Ar/En), `BaseEntity` (Id, CreatedAt), folder layout (Entities, Data, Dtos, Controllers, Services)

## F — Bookings (most important)

- [x] **F1** `Booking` entity (Code, Name, Phone, Model, Generation, Year, Km, Services[], Date, Hour, Notes, Status, CreatedAt) + migration
- [x] **F2** Slot settings: `Capacity` (3), `OpenHour` (10), `CloseHour` (22) + `ClosedDay` and `ClosedSlot` tables + seed
- [x] **F3** `GET /api/slots?from=&days=14` → each day/hour with places left (0 = full/closed/past)
- [x] **F4** `POST /api/bookings`: validate (Egyptian phone, date range, open hour), check capacity in a transaction, unique code `SHA-xxxxx`, return code; `409` when the slot just filled
- [x] **F5** Rate limiting on `POST /api/bookings` (per IP) + basic spam guard
- [x] **F6** Frontend: `environment.ts` `apiUrl`, `BookingApi` service; booking page loads slots from API
- [x] **F7** Frontend: confirm = `POST` first, then open WhatsApp with the returned code; on `409` refresh slots + show message
- [x] **F8** Frontend: home quick booking form (`shared/sections/booking-form.ts`) also `POST`s before WhatsApp

## G — Admin login

- [x] **G1** `AdminUser` entity + password hashing (`PasswordHasher`) + seed owner account from config/user-secrets
- [x] **G2** `POST /api/auth/login` → JWT (8h), roles `Owner` / `Staff`
- [x] **G3** `[Authorize]` on `/api/admin/*` + auth in the API docs UI
- [x] **G4** Frontend: `/admin/login` page, `AuthService`, token storage, HTTP interceptor, route guard
- [x] **G5** Frontend: admin layout (sidebar, top bar, logout), lazy `/admin` routes, `noindex`, skipped by prerender/sitemap

## H — Admin: bookings

- [x] **H1** `GET /api/admin/bookings?date=&status=&q=&page=`
- [x] **H2** `PATCH /api/admin/bookings/{id}` status (Confirmed / Cancelled / Done / NoShow) + internal note
- [x] **H3** Admin bookings page: Today / This week tabs, booking cards, status buttons, call + WhatsApp buttons
- [x] **H4** Admin home: today's count, upcoming, new (unconfirmed) bookings
- [x] **H5** Slot settings: API + page (capacity, close a day, close an hour)

## I — Products & offers

- [x] **I1** Entities `Category`, `Product` (+ models), `Offer` (+ includes) + migration + seed from `catalog.ts`
- [x] **I2** Public `GET /api/categories`, `/api/products`, `/api/products/{slug}`, `/api/offers` (active only)
- [x] **I3** Admin CRUD products + categories
- [x] **I4** Image upload `POST /api/admin/uploads` (jpg/png/webp, size limit) → served from `/uploads`
- [x] **I5** Admin CRUD offers
- [x] **I6** Admin products page (list + form + image)
- [x] **I7** Admin offers page
- [x] **I8** Frontend public pages (home, products, product details, offers) read from API (loading state + fallback)

## J — Other content (confirm with client first)

- [x] **J1** Reviews: entity + public GET + admin add/approve/delete + frontend from API
- [x] **J2** Gallery + before/after: entity + upload + admin page + frontend from API
- [ ] **J3** Price estimate jobs + model factors in DB + admin edit + frontend from API

## K — Deploy

- [ ] **K1** MonsterASP.NET: create site + SQL Server DB
- [ ] **K2** Production settings via host env vars: connection string, JWT key, CORS origins, owner password
- [ ] **K3** Publish API + apply migrations + seed
- [ ] **K4** Cloudflare DNS: `api` record → host, SSL on `api.elsayedhassanauto.com`
- [ ] **K5** Frontend `environment.ts` → API URL, push (Cloudflare Pages redeploys), full booking test on the live site
- [ ] **K6** DB backups (host backups or weekly export)

## Later (optional)

- Notify the owner of new bookings (WhatsApp/SMS/email)
- Car tracking (job stages) on top of bookings
- Customer accounts / service history
