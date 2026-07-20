# 🧪 TestMart

A full-stack e-commerce application built **specifically as a stable target for Playwright UI
automation**. Fully self-contained — no external services, no real payments — and it seeds
deterministic data on every boot so tests start from a known state.

See [`plan.md`](./plan.md) for the full architecture, API surface, and phased build plan.

## Stack

- **Client:** React 18 + Vite, React Router, Context API, Axios — port `5173`
- **Server:** NestJS (TypeScript), Mongoose, Passport JWT (httpOnly cookie) — port `5000`
- **Database:** MongoDB in-memory (`mongodb-memory-server`); override with `MONGO_URI`

The Vite dev server proxies `/api/*` → `:5000`, so the browser sees a single origin.

## Quick start

```bash
npm install          # root tooling (concurrently)
npm run install:all  # install server + client dependencies
npm run dev          # run API (:5000) + client (:5173) together
```

Then open http://localhost:5173.

> First boot downloads a MongoDB binary via `mongodb-memory-server` (needs network once).

## Seeded accounts

| Role  | Email            | Password   |
|-------|------------------|------------|
| Admin | `admin@demo.com` | `admin123` |
| User  | `user@demo.com`  | `user123`  |

_Deployment instructions land in Phase 8 (see `plan.md`)._
