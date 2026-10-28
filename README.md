# xBO

Back office for FMCG operations: master data, pricing, order to cash, credit, inventory with batches and expiry, van sales and route settlement, empties, finance and trade spend. It runs in the browser and as a desktop app for Windows, macOS and Linux, and connects to field sales apps, e-commerce and partner systems through an open integration API.

## Repository

| Path | What it is |
| --- | --- |
| `apps/web` | The desktop-style UI (Vue 3, TypeScript, Vite, Tailwind v4). Runs in any browser. |
| `apps/desktop` | Tauri 2 wrapper that packages `apps/web` as a native app. |
| `apps/api` | The API (NestJS on Fastify) under `/api/v1`. |
| `packages/contracts` | Shared zod schemas and types for the API and its integration payloads. |
| `docs/DEVELOPMENT_PLAN.md` | Architecture decisions and the step-by-step build plan. |
| `PRODUCT.md`, `DESIGN.md` | Product brief and visual design system; every UI change follows them. |

## Requirements

- Node.js 22 or later and pnpm 10.
- Docker, for PostgreSQL and Redis. The compose file publishes them on ports 5433 and 6380 so they do not clash with local installs; set `XBO_POSTGRES_PORT` or `XBO_REDIS_PORT` to change that.
- For the desktop app: the Rust toolchain (stable) and, on Linux, the Tauri system packages:

```bash
sudo apt install pkg-config libwebkit2gtk-4.1-dev libsoup-3.0-dev libgtk-3-dev libxdo-dev libayatana-appindicator3-dev librsvg2-dev
```

## Getting started

```bash
pnpm install
```

```bash
pnpm --filter @xbo/contracts build
```

Start PostgreSQL and Redis, create the schema and add a first organisation and administrator (the seed prints the generated password unless you set `XBO_SEED_PASSWORD`):

```bash
docker compose up -d
```

```bash
pnpm --filter @xbo/api db:migrate
```

```bash
pnpm --filter @xbo/api db:seed
```

Run the API (port 3000) and the web app (port 5190) in two terminals:

```bash
pnpm dev:api
```

```bash
pnpm dev:web
```

Open http://localhost:5190. The web app proxies `/api` to the API.

Run the desktop app (starts the web dev server itself):

```bash
pnpm dev:desktop
```

## Database

The schema lives in `apps/api/src/database/schema` and migrations in `apps/api/drizzle`. After changing the schema, generate a migration and commit it with the change:

```bash
pnpm --filter @xbo/api db:generate --name describe_the_change
```

## Authentication

- **People** sign in with email and password at `POST /api/v1/auth/login` and get an http-only session cookie. A session works inside one organisation at a time; switch with `PUT /api/v1/auth/session/organization`.
- **Integrations** use a machine client, created per organisation at `POST /api/v1/machine-clients` (the secret is shown once). A machine client can authenticate in any of these ways:

| Scheme | How |
| --- | --- |
| OAuth 2 client credentials | `POST /api/v1/auth/oauth/token` with `grant_type=client_credentials`, `client_id` and `client_secret` (JSON, form, or HTTP basic), then `Authorization: Bearer <access_token>` |
| Username / password token | `POST /api/v1/auth/token` with `{"username": "<client id>", "password": "<secret>"}`, then `Authorization: Bearer <token>` |
| HTTP basic | `Authorization: Basic base64(<client id>:<secret>)` on every request |
| Static token | Create one at `POST /api/v1/machine-clients/{id}/tokens`, then send it as `Authorization: Bearer <token>`, a `TOKEN` header or an `X-Api-Key` header |

`GET /api/v1/auth/principal` shows who a request authenticated as, which helps when setting up an integration.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `XBO_DATABASE_URL` | `postgres://xbo:xbo@localhost:5433/xbo` | API database |
| `XBO_TOKEN_SECRET` | development value | Signs integration access tokens; at least 32 characters, required in production |
| `XBO_ACCESS_TOKEN_TTL_SECONDS` | `3600` | Lifetime of integration access tokens |
| `XBO_SESSION_TTL_HOURS` | `336` | Lifetime of a sign-in session |
| `XBO_SESSION_COOKIE_SECURE` | `true` in production | Marks the session cookie `Secure` |
| `XBO_TEST_DATABASE_URL` | `postgres://xbo:xbo@localhost:5433/postgres` | Server the API tests connect to; each run creates and drops its own database there |

## Checks

The API tests need PostgreSQL running (`docker compose up -d`).

```bash
pnpm -r typecheck
```

```bash
pnpm -r test
```

```bash
pnpm build
```

CI runs the same checks, plus a migration drift check, on every push (`.github/workflows/ci.yml`). Pushing a `v*` tag builds draft desktop installers for Windows, macOS and Linux (`.github/workflows/desktop-release.yml`).

## Keyboard

| Shortcut | Action |
| --- | --- |
| Ctrl K (⌘ K on Mac) | Command palette: open any app or run a command |
| Ctrl Esc | Start launcher |
| Ctrl Alt ← / → | Snap the focused window to the left or right half |
| Ctrl Alt ↑ | Fill the screen |
| Ctrl Alt ↓ | Restore, then minimise |
| Ctrl Alt W | Close the focused window |
