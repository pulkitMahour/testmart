# E-commerce Demo App — Implementation Plan

A full-stack e-commerce application built **specifically as a stable target for Playwright
UI automation**. It is fully self-contained (no external services, no real payments) and
seeds deterministic data on every boot so tests start from a known state.

---

## 1. Goals

- Realistic e-commerce flows to automate: register, login/logout, browse/search products,
  cart, mock checkout, order history, profile, and a role-gated admin panel.
- **Deterministic & offline**: in-memory MongoDB, seeded data, local placeholder images.
  No network dependency, no rate limits, no third-party breakage.
- **Automation-friendly DOM**: stable `data-testid` attributes on every interactive element
  (see §9 for the naming convention).

> Scope decision: this repo is the **website only**. The separate Playwright project (test
> specs, fixtures, a DB reset endpoint) is intentionally out of scope for now and tracked in §11.

---

## 2. Tech Stack

| Layer     | Choice                                                                 |
|-----------|------------------------------------------------------------------------|
| Frontend  | React 18 + Vite, React Router v6, Context API (Auth + Cart), Axios     |
| Backend   | **NestJS (TypeScript)** — modules / controllers / services            |
| Data      | Mongoose ODM over **MongoDB in-memory** (`mongodb-memory-server`)      |
| Auth      | Passport `jwt` strategy, JWT stored in an **httpOnly cookie**          |
| Validation| `class-validator` + `class-transformer` DTOs (global `ValidationPipe`) |

Ports: **client `5173`**, **server `5000`**. The Vite dev server proxies `/api/*` → `:5000`,
so the browser sees a single origin (cookies "just work", no CORS friction).

**Everything hosting-sensitive is env-driven** (DB URI, JWT secret, CORS origin, cookie
`Secure`/`SameSite`) so the same code runs locally and in production with no edits — see §10.
Set `MONGO_URI` to a real MongoDB (e.g. MongoDB Atlas) in production; otherwise an in-memory
instance starts automatically at boot. Deployment is fully covered in **Phase 8 (§8)**.

---

## 3. Architecture

### Request / auth flow
```
Browser (React @ :5173)
   │  fetch('/api/...') with credentials
   ▼
Vite dev proxy  ──►  NestJS API (@ :5000, global prefix /api)
                        │
                        ├─ Public routes      → controller → service → Mongoose model
                        ├─ JwtAuthGuard        → reads token from httpOnly cookie → req.user
                        └─ RolesGuard('admin') → gates /api/admin/*
                        ▼
                   MongoDB (in-memory), seeded on startup
```

- **Login/Register** → service verifies/creates user → issues JWT → controller sets it as an
  httpOnly cookie (`token`) via `@Res({ passthrough: true })`. Response body = safe user (no hash).
- **Authenticated requests** → `JwtAuthGuard` runs the Passport `jwt` strategy, whose custom
  extractor pulls the token from `req.cookies.token`, loads the user, attaches `req.user`.
- **Logout** → clears the cookie.
- **Cart lives entirely on the client** (Context + `localStorage`) so guests can add items;
  auth is required only at checkout. The server recomputes all prices/totals at order time —
  it never trusts client-supplied amounts.

---

## 4. Data Models (Mongoose schemas)

**User** — `name`, `email` (unique, lowercase), `password` (bcrypt hash, pre-save hook),
`role` (`'user' | 'admin'`, default `user`), `address { street, city, postalCode, country }`, timestamps.

**Product** — `name`, `description`, `price`, `category`, `image` (local `/images/*.svg` path),
`countInStock`, `rating`, `numReviews`, `featured`, timestamps.

**Order** — `user` (ref), `orderItems[] { product, name, price, qty, image }`,
`shippingAddress { fullName, street, city, postalCode, country }`, `paymentMethod` (`'Mock'`),
`itemsPrice`, `taxPrice`, `shippingPrice`, `totalPrice`, `isPaid`, `paidAt`,
`status` (`pending | processing | shipped | delivered | cancelled`), timestamps.

---

## 5. API Surface

| Method | Path                              | Access        | Purpose                              |
|--------|-----------------------------------|---------------|--------------------------------------|
| POST   | `/api/auth/register`              | public        | Create account, set cookie           |
| POST   | `/api/auth/login`                 | public        | Authenticate, set cookie             |
| POST   | `/api/auth/logout`                | public        | Clear cookie                         |
| GET    | `/api/users/me`                   | auth          | Current user (restores session)      |
| PUT    | `/api/users/me`                   | auth          | Update name/address/password         |
| GET    | `/api/products`                   | public        | List: `keyword,category,sort,page,limit` |
| GET    | `/api/products/categories`        | public        | Distinct categories                  |
| GET    | `/api/products/:id`               | public        | Product detail                       |
| POST   | `/api/orders`                     | auth          | Create order (mock checkout)         |
| GET    | `/api/orders/mine`                | auth          | Current user's orders                |
| GET    | `/api/orders/:id`                 | auth (owner)  | Order detail                         |
| GET    | `/api/admin/stats`                | admin         | Dashboard counts + revenue           |
| POST   | `/api/admin/products`             | admin         | Create product                       |
| PUT    | `/api/admin/products/:id`         | admin         | Update product                       |
| DELETE | `/api/admin/products/:id`         | admin         | Delete product                       |
| GET    | `/api/admin/orders`               | admin         | All orders                           |
| PUT    | `/api/admin/orders/:id/status`    | admin         | Update order status                  |
| GET    | `/api/admin/users`                | admin         | All users                            |
| DELETE | `/api/admin/users/:id`            | admin         | Delete user                          |

---

## 6. Frontend Routes & State

| Route                    | Component          | Guard        |
|--------------------------|--------------------|--------------|
| `/`                      | HomePage (list + search + filter + sort + pagination) | — |
| `/product/:id`           | ProductPage        | —            |
| `/login`, `/register`    | Login / Register   | —            |
| `/cart`                  | CartPage           | —            |
| `/checkout`              | CheckoutPage       | auth         |
| `/orders`, `/orders/:id` | Orders / OrderDetail | auth       |
| `/profile`               | ProfilePage        | auth         |
| `/admin`                 | AdminDashboard     | admin        |
| `/admin/products`, `/admin/products/new`, `/admin/products/:id/edit` | Admin products | admin |
| `/admin/orders`          | AdminOrders        | admin        |
| `/admin/users`           | AdminUsers         | admin        |
| `*`                      | NotFound           | —            |

State: `AuthContext` (user, login/register/logout, session restore via `/users/me`),
`CartContext` (items + totals in `localStorage`), `ToastContext` (transient notifications).

---

## 7. Repository Structure

```
ecommerce-demo-app/
├── plan.md
├── package.json            # root: `concurrently` scripts to run both apps
├── README.md
├── server/                 # NestJS API (TypeScript)
│   └── src/
│       ├── main.ts         # bootstrap: start in-mem Mongo, cookies, prefix, CORS, pipes
│       ├── app.module.ts
│       ├── common/         # roles + current-user decorators, RolesGuard
│       ├── database/       # in-memory Mongo helper
│       ├── auth/           # controller, service, jwt.strategy, guard, dto
│       ├── users/          # controller, service, schema, dto
│       ├── products/       # controller, service, schema, dto
│       ├── orders/         # controller, service, schema, dto
│       ├── admin/          # admin controller + service (stats)
│       └── seed/           # seed service (OnModuleInit)
└── client/                 # React + Vite
    └── src/
        ├── api/client.js   # axios instance (baseURL /api, withCredentials)
        ├── context/        # AuthContext, CartContext, ToastContext
        ├── components/     # Navbar, ProtectedRoute, AdminRoute, ProductCard, ...
        └── pages/          # + pages/admin/
```

---

## 8. Phased Build Order

Each phase ends in something verifiable. Backend is built first, then the client consumes it.

- [x] **Phase 0 — Scaffolding, install & boot**
  Root scripts, `.gitignore`, README stub. Declare the **full dependency list** in the Nest
  `package.json`/`tsconfig`/`nest-cli.json` and the Vite client `package.json`/config, then run
  **`npm run install:all` upfront** — one install, since we already know every dependency.
  (This is also when `mongodb-memory-server` downloads its Mongo binary — the only network step —
  so any issue shows up now, not at the end.) Then `main.ts`, `AppModule` with in-memory Mongo
  wired up, `/api/health`, and a Vite client shell.
  ✅ *Verify:* deps installed; both `npm run dev` processes boot; health check returns ok.

- [x] **Phase 1 — Data layer**
  User/Product/Order schemas + `SeedService` (admin + user + ~16 products). ✅ *Verify:* logs
  show seeded counts on boot.

- [x] **Phase 2 — Auth + Users**
  DTOs, `AuthService`/`AuthController`, `JwtStrategy` (cookie extractor), `JwtAuthGuard`,
  cookie set/clear. Users `/me` + update. ✅ *Verify:* register → cookie set → `/users/me` works.

- [x] **Phase 3 — Products & search**
  List with keyword/category/sort/pagination, detail, categories. ✅ *Verify:* filtered queries.

- [x] **Phase 4 — Orders & mock checkout**
  Create order (server-computed totals, stock check + decrement), my orders, order detail.

- [x] **Phase 5 — Admin**
  `RolesGuard`, stats, product CRUD, order list + status update, user list + delete.

- [ ] **Phase 6 — Frontend**
  Contexts (Auth/Cart/Toast), routing + guards, all pages, styling, and `data-testid`s (§9).

- [ ] **Phase 7 — Integrate & smoke test**
  Run both apps together and walk the full happy path in the browser (register → browse/search →
  cart → checkout → order history → admin). *Deps already installed in Phase 0.*

- [ ] **Phase 8 — Deployment readiness** *(config only, no rewrite)*
  Env-driven cookie flags (`COOKIE_SECURE`, `COOKIE_SAMESITE`) + CORS origin (`CLIENT_URL`);
  `.env.example` for server & client; client `build` → static output; optional
  `ServeStaticModule` so Nest can serve the built client (enables **same-origin** single-service
  deploy); `Dockerfile` + README deploy guide covering **both** topologies (§below).
  Default local behavior = same-origin. ✅ *Verify:* `npm run build` in both apps succeeds.

  **Same-origin (one service, recommended):** Nest serves the client build + API on one domain →
  `COOKIE_SAMESITE=lax`. Deploy as a single Node service (Render / Railway / Fly.io) + MongoDB Atlas.
  **Split hosting:** client on Vercel/Netlify, API elsewhere → `COOKIE_SAMESITE=none`,
  `COOKIE_SECURE=true`, `CLIENT_URL=<client origin>`, credentialed CORS. Requires HTTPS (hosts provide it).

---

## 9. Test-Target Conventions

- **`data-testid` naming:** `kebab-case`, `<context>-<element>`, dynamic rows suffixed with id.
  Examples: `login-email`, `login-password`, `login-submit`, `nav-cart`, `nav-cart-count`,
  `product-card`, `product-card-title`, `add-to-cart`, `cart-item` (with `data-product-id`),
  `checkout-place-order`, `order-row`, `admin-product-row`, `toast`.
- **Deterministic seed data:** fixed products, categories, and two known accounts (see §10) so
  assertions on counts/titles/prices are stable across runs.
- **Stable async signals:** loading states expose `data-testid="loading"`; empty states expose
  `data-testid="empty"` — clear anchors for waits instead of arbitrary timeouts.

---

## 10. Setup & Run

```bash
# from repo root
npm install            # root tooling (concurrently)
npm run install:all    # installs server + client deps
npm run dev            # runs API (:5000) and client (:5173) together
```

**Server environment variables** (all optional locally; sensible defaults for dev):

| Var               | Default (dev)           | Purpose                                          |
|-------------------|-------------------------|--------------------------------------------------|
| `PORT`            | `5000`                  | API port                                         |
| `MONGO_URI`       | *(in-memory)*           | Real MongoDB in prod (e.g. Atlas)                |
| `JWT_SECRET`      | `dev_secret`            | JWT signing secret — **must set in prod**        |
| `JWT_EXPIRES`     | `7d`                    | Token lifetime                                   |
| `CLIENT_URL`      | `http://localhost:5173` | Allowed CORS origin (credentialed)               |
| `COOKIE_SECURE`   | `false` (dev)           | `true` for HTTPS / cross-site cookies            |
| `COOKIE_SAMESITE` | `lax`                   | `none` for split-domain hosting                  |
| `SERVE_CLIENT`    | `false`                 | `true` → Nest serves the built client (same-origin) |

**Seeded accounts** (created fresh on every boot):

| Role  | Email            | Password   |
|-------|------------------|------------|
| Admin | `admin@demo.com` | `admin123` |
| User  | `user@demo.com`  | `user123`  |

> Note: `mongodb-memory-server` downloads a MongoDB binary on first install — needs network
> once, then runs fully offline.

---

## 11. Deferred (future / separate Playwright project)

- `POST /api/test/reset` (dev-only) to reset + reseed the DB between test runs.
- Example Playwright specs + fixtures (auth `storageState`, page objects).
- Product reviews, wishlist, pagination-heavy catalog for stress cases — add if useful later.
```