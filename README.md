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
- Docker, for PostgreSQL and Redis (`docker compose up -d`).
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

## Checks

```bash
pnpm -r typecheck
```

```bash
pnpm -r test
```

```bash
pnpm build
```

## Keyboard

| Shortcut | Action |
| --- | --- |
| Ctrl K (⌘ K on Mac) | Command palette: open any app or run a command |
| Ctrl Esc | Start launcher |
| Ctrl Alt ← / → | Snap the focused window to the left or right half |
| Ctrl Alt ↑ | Fill the screen |
| Ctrl Alt ↓ | Restore, then minimise |
| Ctrl Alt W | Close the focused window |
