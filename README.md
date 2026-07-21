# 🧪 TestMart

A full-stack e-commerce application built **specifically as a stable target for Playwright UI
automation**. Fully self-contained — no external services, no real payments — and it seeds
deterministic data on every boot so tests start from a known state.

> The automation test suite lives in a **separate project**. This repo is the website only.
> See [`plan.md`](./plan.md) for the full architecture and phased build history, and
> [`CLAUDE.md`](./CLAUDE.md) for conventions and gotchas.

## Features

- **Auth** — register, login, logout (JWT in an httpOnly cookie), session restore
- **Catalog** — product listing with keyword **search**, category filter, sort, and pagination
- **Product detail** — with quantity selector and stock state
- **Cart** — client-side (persisted to `localStorage`); guests can add, auth required at checkout
- **Checkout** — mock payment; totals (tax + shipping) recomputed server-side
- **Orders** — order history and detail
- **Profile** — update name, address, and password
- **Admin panel** — dashboard stats, product CRUD, order-status management, user management
  (role-gated)

## Tech stack

| Layer      | Choice |
|------------|--------|
| Client     | React 18 + Vite, React Router, Context API, Axios — port `5173` |
| Server     | NestJS (TypeScript), Mongoose, Passport JWT (httpOnly cookie), class-validator — port `5000` |
| Database   | MongoDB **in-memory** (`mongodb-memory-server`); override with `MONGO_URI` for a real DB |

In dev the Vite server proxies `/api/*` → `:5000`, so the browser sees a **single origin** and the
httpOnly auth cookie works without CORS setup.

## Project structure

```
.
├── server/   NestJS API — feature modules: auth, users, products, orders, admin (+ seed)
├── client/   React + Vite — pages, components, contexts (auth/cart/toast)
├── plan.md   Architecture, API surface, phased build plan
└── CLAUDE.md Guidance & conventions for working in this repo
```

## Prerequisites

- **Node.js 18+** and npm

## Quick start

```bash
npm install          # root tooling (concurrently)
npm run install:all  # install server + client dependencies
npm run dev          # run API (:5000) + client (:5173) together
```

Then open **http://localhost:5173**.

> On first boot, `mongodb-memory-server` downloads a MongoDB binary (needs network once, then
> runs fully offline).

## Scripts

Run from the repo root:

| Command | Description |
|---------|-------------|
| `npm run dev` | Run server + client together (via `concurrently`) |
| `npm run dev:server` | Run the API only (`nest start --watch`) |
| `npm run dev:client` | Run the client only (`vite`) |
| `npm run build` | Build server (`nest build`) then client (`vite build`) |
| `npm run install:all` | Install server + client dependencies |

**Typecheck the server** without disturbing a running dev server:
`cd server && npx tsc --noEmit -p tsconfig.json`. (Don't run `nest build` while `npm run dev` is
active — it wipes `dist/` and breaks the watch process.)

There is no linter or in-repo test runner configured.

## Seeded accounts

Recreated fresh on every boot (only when the collection is empty):

| Role  | Email            | Password   |
|-------|------------------|------------|
| Admin | `admin@demo.com` | `admin123` |
| User  | `user@demo.com`  | `user123`  |

## API overview

Base path: `/api` (JWT cookie set on login; RBAC via `admin` role).

| Method | Path | Access |
|--------|------|--------|
| POST | `/auth/register`, `/auth/login`, `/auth/logout` | public |
| GET / PUT | `/users/me` | auth |
| GET | `/products`, `/products/categories`, `/products/:id` | public |
| POST / GET | `/orders`, `/orders/mine`, `/orders/:id` | auth |
| GET | `/admin/stats` | admin |
| POST / PUT / DELETE | `/admin/products`, `/admin/products/:id` | admin |
| GET / PUT | `/admin/orders`, `/admin/orders/:id/status` | admin |
| GET / DELETE | `/admin/users`, `/admin/users/:id` | admin |
| POST | `/test/reset` | test-only (env-gated; wipes + reseeds the DB) |

## Environment variables (server)

All optional locally; sensible dev defaults. Set these in production.

| Var | Default (dev) | Purpose |
|-----|---------------|---------|
| `PORT` | `5000` | API port |
| `MONGO_URI` | *(in-memory)* | Real MongoDB in prod (e.g. MongoDB Atlas) |
| `JWT_SECRET` | `dev_secret` | JWT signing secret — **set in prod** |
| `JWT_EXPIRES` | `7d` | Token lifetime |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin (credentialed) |
| `COOKIE_SECURE` | `false` | `true` for HTTPS / cross-site cookies |
| `COOKIE_SAMESITE` | `lax` | `none` for split-domain hosting |
| `SERVE_CLIENT` | `false` | `true` → API also serves the built client (single-service) |
| `RATE_LIMIT_ENABLED` | `false` | `true` → enable rate limiting (set on public deploys) |
| `RATE_LIMIT_TTL` / `RATE_LIMIT_MAX` | `60000` / `100` | Window (ms) and max requests per IP |
| `ENABLE_TEST_RESET` | `false` | `true` → enable `POST /test/reset` (local / CI only) |
| `TEST_RESET_TOKEN` | *(none)* | If set, `POST /test/reset` requires header `x-test-reset-token` |

## Automation notes

Being a Playwright target is the point, so the DOM is built for it:

- Interactive elements carry `data-testid`s in kebab-case `<context>-<element>` form
  (`login-email`, `add-to-cart`, `checkout-place-order`, …).
- Dynamic rows add a data attribute (`product-card` + `data-product-id`,
  `order-row` + `data-order-id`).
- Loading and empty states expose `data-testid="loading"` / `"empty"` as stable wait anchors.
- Home-page filters (keyword/category/sort/page) live in the URL query, so states are shareable.
- **`POST /api/test/reset`** wipes + reseeds the DB to the known state — call it before a run for
  deterministic data. Env-gated (`ENABLE_TEST_RESET=true`); returns **404** when disabled, so it's
  safe to leave in a public deploy (keep the flag OFF there).
- **Rate limiting** is OFF by default so it never throttles test runs; enable it on public deploys
  with `RATE_LIMIT_ENABLED=true` (login/register get stricter per-route limits).

## Notes

- **The in-memory database resets on every server restart** (including hot-reload from editing
  server files). Seed users/products come back; test-created orders/users vanish. This is by design.
- The server recomputes all order prices from the DB — it never trusts client-supplied amounts.

## Deployment

Hostable on **$0** free tiers. Recommended: **one Render web service** that serves the API *and*
the built client (single origin), plus a **MongoDB Atlas** free cluster.

### Test the production build locally first

```bash
# stop `npm run dev` first (nest build wipes server/dist)
npm run build                               # builds server/dist + client/dist
SERVE_CLIENT=true node server/dist/main.js  # one process serves API + client
# open http://localhost:5000
```

### Deploy to Render + MongoDB Atlas (free)

1. **Database** — create a free **M0** cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas):
   add a DB user, allow network access (`0.0.0.0/0` is fine for a demo), copy the connection string.
2. **Push** this repo to GitHub.
3. **Render** — on [render.com](https://render.com): *New → Blueprint*, pick the repo. The included
   [`render.yaml`](./render.yaml) provisions a free web service that runs `npm run build` then
   `node server/dist/main.js` with `SERVE_CLIENT=true`.
4. In the service's **Environment**, set `MONGO_URI` to your Atlas string. (`JWT_SECRET` is
   auto-generated; `COOKIE_SECURE=true` and `COOKIE_SAMESITE=lax` are preset.)
5. **Deploy** → open `https://<name>.onrender.com`. Seed data loads on first boot.

**Notes**
- Render's free instance **spins down after ~15 min idle**; the next request cold-starts (~1 min).
- **Split hosting** instead (client on Vercel/Netlify, API on Render)? Set `COOKIE_SAMESITE=none`,
  `COOKIE_SECURE=true`, `CLIENT_URL=<client origin>`, and point the client at the API's origin.
- A [`Dockerfile`](./Dockerfile) is included for any container host (set `MONGO_URI` at runtime).
