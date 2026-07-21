# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

TestMart — a full-stack e-commerce app built **specifically as a stable target for Playwright UI
automation**. It is self-contained (no external services, no real payments) and seeds deterministic
data on every boot. The automation test suite lives in a **separate project**, not here; this repo is
the website only. See `plan.md` for the phased build history and `README.md` for quick start.

## Commands

```bash
# Install (run once, from repo root)
npm install            # root tooling (concurrently)
npm run install:all    # installs server + client deps

# Develop — run BOTH together (API :5000, client :5173)
npm run dev            # concurrently runs server (nest --watch) + client (vite)
npm run dev:server     # API only
npm run dev:client     # client only

# Build
npm run build                      # server (nest build) then client (vite build)
npm --prefix server run build      # server only -> server/dist
npm --prefix client run build      # client only -> client/dist
```

**Typecheck the server without disturbing a running dev server:** use
`cd server && npx tsc --noEmit -p tsconfig.json`. Do NOT run `nest build` while `npm run dev`
is active — `nest-cli.json` has `deleteOutDir: true`, so a build wipes `dist/` and breaks the
running watch process. `tsc --noEmit` catches type errors without emitting.

There is **no linter, formatter, or in-repo test runner** configured. Don't invent `npm test`/`npm run lint`.

## Verify long-running work

The user starts dev servers themselves — give them the command, don't background it. To check a
running server, use short one-shot `curl` calls (e.g. `curl -s localhost:5000/api/health`).

## Architecture

Monorepo: **`server/`** (NestJS + TypeScript) and **`client/`** (React + Vite), orchestrated from the
root `package.json` via `concurrently`. In dev the browser hits a single origin — Vite proxies
`/api/*` → `:5000` (`client/vite.config.js`) — so the httpOnly auth cookie works without CORS setup.

### Database (the biggest gotcha)
`server/src/main.ts` starts an **in-memory MongoDB** (`mongodb-memory-server`) in `bootstrap()`
*before* creating the Nest app, unless `MONGO_URI` is set (used for a real DB in prod). Consequences:
- **All data resets every time the server restarts** — including on hot-reload from editing server
  files. Seed users/products come back; test-created orders/users vanish. This is by design.
- `SeedModule` (`OnModuleInit`) seeds 2 accounts + 16 products, but only when a collection is empty.

### Auth — JWT in an httpOnly cookie
- `AuthController` sets/clears the `token` cookie via `@Res({ passthrough: true })`. Cookie flags are
  **env-driven** (`COOKIE_SECURE`, `COOKIE_SAMESITE`) so the same code runs same-origin (dev) or
  cross-site (prod).
- `JwtStrategy` (`server/src/auth/jwt.strategy.ts`) extracts the token from `req.cookies.token`
  (custom extractor), loads the user, and returns the **safe user shape** as `req.user`.
- RBAC = `JwtAuthGuard` then `RolesGuard` + `@Roles('admin')` (stacked on `AdminController`).
- The client never sees the token: `AuthContext` restores the session by calling `GET /users/me`
  on load; `ProtectedRoute`/`AdminRoute` gate routes on that result.

### Server module layout
Feature modules `auth / users / products / orders / admin`, each with controller + service +
(where relevant) `schemas/` + `dto/`. Cross-cutting pieces live in `common/` (`@CurrentUser`,
`@Roles`, `RolesGuard`). Conventions to preserve:
- **Domain services own their Mongoose model.** Admin operations are methods on the domain services
  (e.g. `ProductsService.create/update/remove`, `OrdersService.updateStatus`); `AdminModule` imports
  those modules and `AdminController` delegates to them. `AdminService` only aggregates dashboard stats.
- **Orders never trust the client:** `OrdersService.create` re-fetches each product, recomputes
  `itemsPrice`/`tax` (10%)/`shipping` (free over $100, else $10)/`total` from the DB, and decrements
  stock atomically (`decrementStock` = conditional `$inc`). `CheckoutPage` mirrors this math for
  display only — the server is the source of truth.
- **Route ordering matters:** declare static routes before param routes, e.g. `products/categories`
  before `products/:id`, and `orders/mine` before `orders/:id`.
- **Password hashing** is a `User` pre-save hook, so users must be created with `.create()`/`.save()`
  — `insertMany()` skips hooks (seed users use `create`, products use `insertMany`).

### Response shapes (subtle, easy to trip on)
User responses go through `toUserResponse()` — a safe projection with **`id`** and no password hash.
Products and orders are returned as **raw Mongoose docs with `_id`**. So the client keys off
`product._id` / `order._id` but `user.id`.

### Client
React Router with three contexts: `AuthContext` (session), `CartContext` (**cart is client-side**,
persisted to `localStorage` — the server has no cart; auth is required only at checkout),
`ToastContext`. Home-page filters (keyword/category/sort/page) are stored in the URL query.

### Automation-facing conventions (the point of the repo)
Interactive elements carry `data-testid`s in kebab-case `<context>-<element>` form
(`login-email`, `add-to-cart`, `checkout-place-order`, …); dynamic rows add a data attribute
(`product-card` + `data-product-id`, `order-row` + `data-order-id`). Loading and empty states expose
`data-testid="loading"` / `"empty"` as stable wait anchors. Preserve these when editing the UI.

## Seeded accounts

| Role  | Email            | Password   |
|-------|------------------|------------|
| Admin | `admin@demo.com` | `admin123` |
| User  | `user@demo.com`  | `user123`  |
