# xBO (Back Office): development plan

xBO is a back-office / ERP system for FMCG manufacturers and distributors. It covers the operational feature set large enterprise ERPs offer FMCG companies, with a desktop-style interface inspired by macOS and Windows 11, and an open integration API that field sales apps, e-commerce stores and partner systems connect to. One codebase ships as a **web app** and as a **desktop app** for Windows, macOS and Linux.

Date: 2026-10-27. Status: Phase 0 started: monorepo, API skeleton, shared contracts, desktop shell UI and Tauri wrapper are in place.

Product and visual direction live in `PRODUCT.md` and `DESIGN.md` at the repository root; every UI change follows them.

## 1. Goals

1. **Integrate openly.** Field sales apps, e-commerce stores and partner systems connect through a documented REST API in three directions (they call xBO, xBO sends them webhooks, they poll xBO feeds), authenticating with whichever standard scheme they support: OAuth 2 client credentials, a username / password token login, bearer tokens, HTTP basic, or an API key header.
2. **Cover FMCG operations end to end:** master data, pricing, order to cash, credit, inventory with batches and FEFO, van sales and route settlement, empties, logistics, trade spend, procurement, finance, manufacturing and quality.
3. **Feel like a desktop application:** windows, a dock/taskbar, menus, keyboard shortcuts, dense data grids, many documents open side by side.
4. **Be correct first:** immutable posted documents, double-entry accounting, idempotent integrations, full audit trail.

## 2. Architecture decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Shape | Modular monolith | One deployable, clear module boundaries, no distributed transactions between stock and accounting |
| Language | TypeScript end to end (TypeScript 6.x, pinned) | One language for API, UI and contracts; request and response types are shared, not duplicated. TypeScript 7 is not used yet: its native compiler has no JavaScript API, which the Nest CLI, tsup and vue-tsc need |
| Backend | NestJS 12 on Fastify (`apps/api`) | Module system maps one-to-one to the ERP modules below; dependency injection, guards and interceptors suit a large codebase; Fastify for throughput |
| Database | PostgreSQL 16 with Drizzle ORM and drizzle-kit migrations | ERP needs: exact `numeric`, row-level locking for stock, partial and expression indexes, transactional DDL. Drizzle keeps SQL visible and typed |
| Money and quantities | `numeric(19,4)` columns read as strings, decimal arithmetic with a decimal library, never JavaScript floats | Rounding errors are unacceptable in invoices and stock |
| Validation and contracts | zod schemas in `packages/contracts`, used by the API, the UI and integration contract tests | One definition of every payload, including integration payloads |
| Queue, cache, locks | Redis + BullMQ | Integration jobs, document posting, scheduled runs, retries with backoff |
| Realtime | WebSockets through a NestJS gateway | Live updates in open windows (stock, document status, integration monitor) |
| API | REST JSON under `/api/v1`, OpenAPI generated from the zod contracts | One API for the UI and third parties |
| Auth | Session cookies for the UI (desktop app uses the same login); machine clients per organisation for integrations, accepted over OAuth 2 client credentials, a username / password token login, bearer tokens, HTTP basic, and `TOKEN` / `X-Api-Key` headers | Integration clients range from modern OAuth clients to simple scripts; each must reach xBO with the scheme it already supports |
| Tenancy | Single database, `organization_id` on every business row, enforced in the repository layer and by policies | One xBO install can serve several companies; external systems identify the company by `organization_code` |
| Frontend | Vue 3 + TypeScript + Vite SPA (`apps/web`), Pinia, Tailwind CSS v4, reka-ui primitives, Remix Icon compiled per icon by unplugin-icons | A mature, well-documented component ecosystem. A plain SPA rather than Nuxt because the desktop shell manages windows, not pages |
| Desktop | Tauri 2 (`apps/desktop`) wrapping the same web build | Installers of about 10 MB instead of 100 MB or more, low memory use, strict security model; the Rust side stays small (window, updater, later printers and scales). Chosen over Electron |
| Repository | pnpm workspace monorepo: `apps/api`, `apps/web`, `apps/desktop`, `packages/contracts`, `docs/` | One change can touch API, UI and contracts together |

### Core domain patterns

1. **Organisational structure:** Company -> Branch / Depot (plant) -> Warehouse -> Location (bin, van, quarantine, empties yard); Sales area = sales organisation + channel + division.
2. **Document framework:** every business step is a document with a header, lines, a status machine, a number from a number range, and links to predecessor and successor documents (document flow). Posted documents are immutable; corrections are reversals or credit documents.
3. **Condition technique:** one rules engine for prices, discounts, surcharges, taxes, free goods, listing / exclusion and substitution: ordered procedure steps, access sequences (most specific key first), validity dates, scales.
4. **Stock key:** product + location + batch + stock status (unrestricted, quality, blocked, in transit). Every movement is a stock journal entry; balances are derived and cached.
5. **Postings:** every stock and billing document posts balanced journal entries to the general ledger through account determination rules.
6. **Blocks with worklists:** credit, delivery, billing and quality blocks, each released by a role from a worklist.
7. **Outbox / inbox:** every integration message is persisted before sending or after receiving, with an idempotency key, retry state and replay.

## 3. Backend module map

| Module | Owns |
| --- | --- |
| `Core` | Organisations, users, roles and permissions, settings, number ranges, audit log, attachments, approvals engine, document framework, notifications |
| `MasterData` | Products, units of measure and barcodes, categories and brands, customers / outlets and hierarchies, suppliers / principals, warehouses and locations, vehicles, routes and territories, sales users, tax codes, payment terms |
| `Pricing` | Condition types, procedures, condition records, price lists, customer special prices, blanket agreements, free goods, listing and exclusion, substitution |
| `Sales` | Quotations, sales orders, availability check and allocation, credit check, order tracking |
| `Credit` | Credit segments, limits, exposure, blocks, release worklist, user / van credit limits |
| `Inventory` | Batches and expiry, stock journal and balances, goods receipts, transfers and requisitions, adjustments, stock takes, reconciliation, serial numbers, FEFO engine |
| `Logistics` | Deliveries, picking, packing, gate passes, trips, delivery planner, proof of delivery |
| `DSD` | Visit plans, tours, van loading (check-out), van sales, check-in, route settlement, cash reconciliation |
| `Empties` | Returnable items, deposits, customer empties balances |
| `Billing` | Invoices, credit and debit notes, credit note requests, e-invoicing (eTIMS, EFRIS) |
| `Returns` | Delivery returns, goods (market) returns, inspection and disposition |
| `Receivables` | Payments and collections (cash, M-Pesa, MTN MoMo, cheque, bank), allocation, statements, ageing, dunning |
| `Finance` | Chart of accounts, journals, account determination, AP, bank, periods and close, financial statements, expenses, incentives |
| `Trade` | Promotions, rebates (condition contracts), loyalty balances, claims and deductions |
| `Procurement` | Requisitions, purchase orders, supplier invoices, three-way match |
| `Production` | Recipes, production orders, consumption and output, co-packing |
| `Quality` | Inspection lots, results, usage decisions, certificates |
| `Planning` | Sales targets, demand forecast, replenishment proposals |
| `People` | Minimal HR bridge for what field apps post: leave categories and requests, expense categories |
| `Integration` | Integration API, webhooks, polling feeds, outbox / inbox, mappings, schedules, monitor, replay |
| `Reporting` | Operational reports, margin analysis, exports |

## 4. Desktop UI design

### Shell

- **Top menu bar** (macOS): xBO menu, the focused window's app menus (File, Edit, View, Go, Window, Help), and on the right: organisation switcher, sync status, notifications, clock, user.
- **Taskbar / dock** (Windows 11 centred taskbar with macOS dock behaviour): pinned apps, running windows with indicators, a Start launcher, and a system tray area.
- **Start launcher:** apps grouped by module, recent documents, search.
- **Command palette** (Ctrl/Cmd+K, Spotlight style): open apps, find documents by number, run actions.
- **Windows:** draggable, resizable, minimise / maximise / restore, focus order, double-click title to maximise, snap to halves and quarters (Windows 11 snap layouts on hover over maximise), remember positions per user. Several windows of the same app (two sales orders side by side).
- **Window chrome setting:** "macOS" (traffic-light buttons on the left) or "Windows" (caption buttons on the right), defaulting to the user's OS.
- **Materials:** translucent "Mica / vibrancy" backgrounds with backdrop blur, 8 to 12 px rounded corners, soft layered shadows, light and dark themes following the OS.
- **Notification centre** and toasts for document events and integration failures.
- **Deep links:** the URL encodes the focused window (`/#/w/sales-order/SO-000123`) so links open the right document.

### Inside windows

- **Data grid** (the workhorse): virtualised rows, column chooser, sort, filter, group, inline edit, keyboard navigation, copy / paste to Excel, export, saved views.
- **Document window layout:** header fields, a lines grid, a side panel (status, document flow, attachments, audit), a toolbar with actions allowed by the document's status.
- **Master-detail** for master data, **wizards** for multi-step flows (route settlement), **dashboards** as widgets.
- Desktop-grade keyboard support: Tab order, Enter to move down in grids, F2 edit, Ctrl+S save, Esc cancel, Ctrl+P print.

### Accessibility and density

Compact and comfortable density modes, full keyboard operation, focus rings, contrast checked in both themes, scalable text.

## 5. Step-by-step plan

Each step lists deliverables. A step is done when its tests pass in CI and its living doc entry is written.

### Phase 0: Foundations

- **0.1** pnpm monorepo, README, `.gitignore`, editorconfig, PRODUCT.md and DESIGN.md. *(done)*
- **0.2** API: NestJS on Fastify, `/api/v1/health`, Vitest with SWC for decorator metadata. *(done)*
- **0.3** Shared contracts package (zod) with the first inbound order contract and tests. *(done)*
- **0.4** Web: Vue 3 + TS + Vite, Tailwind v4 design tokens, ESLint, Vitest. *(done)*; Playwright end-to-end tests. *(to do)*
- **0.5** Desktop: Tauri 2 wrapper, icons, CSP. *(config done; first build needs the Linux system packages listed in the README)*
- **0.6** Database: Drizzle ORM, migrations, Docker Compose PostgreSQL and Redis (compose file present), test database per run.
- **0.7** CI (GitHub Actions): typecheck, lint, tests and builds for every workspace package; desktop installers on tagged releases (Windows, macOS, Linux runners).
- **0.8** Auth: login, sessions, password reset, 2FA; machine clients with OAuth 2 client credentials, username / password token, bearer, basic and API key header schemes.
- **0.9** Organisations and tenancy scope; users, roles, permissions (permission matrix per module and action).
- **0.10** Audit log (who changed what, before / after), attachments, comments.
- **0.11** Number ranges per document type, organisation and year.
- **0.12** Document framework: base header / line tables, status machine, document flow links, immutability after posting, reversal helper.
- **0.13** Approvals engine (rules by amount, role, document type) and worklists.
- **0.14** Desktop shell: menu bar, taskbar, Start launcher, windows with drag, resize, snap and snap-layout flyout, command palette, themes, window control styles, deep links. *(first version done)*; notification centre and toasts. *(to do)*
- **0.15** UI kit: data grid *(first version done: sorting, keyboard selection, sticky header)*, form controls, document window template, master-detail template, dialogs, toasts; grid virtualisation for large lists.
- **0.16** Settings app *(done: appearance, transparency, density, window controls)* and system health app.

### Phase 1: Master data

- **1.1** Units of measure, conversions per product, barcodes per unit.
- **1.2** Products: categories, brands, principals, tax codes, HS codes, tax-authority units, batch / serial flags, shelf life, empties components, product templates (kits).
- **1.3** Customers / outlets: roles (sold-to, ship-to, bill-to, payer), channel, class, region, territory, route, GPS, VAT / KRA PIN, payment terms and modes, price list, discount rate, account status, custom attributes (integrations send arbitrary extra fields).
- **1.4** Customer hierarchy and groups; ship-to locations.
- **1.5** Suppliers / principals.
- **1.6** Warehouses, locations, vans as locations, vehicles.
- **1.7** Routes, territories, regions; sales users and reps (with the `user_code` field apps send).
- **1.8** Chart of accounts (basic), payment terms, payment modes, expense, leave and feedback categories.
- **1.9** Import wizards (Excel / CSV) for every master, with validation previews.

### Phase 2: Pricing engine

- **2.1** Condition types, procedures, access sequences, condition records with validity and scales.
- **2.2** Price lists, customer special prices, discounts (customer, product, group), VAT-inclusive / exclusive handling, rounding rules.
- **2.3** Blanket agreements (contract quantities and prices per customer).
- **2.4** Free goods (inclusive / exclusive) and bundles.
- **2.5** Listing / exclusion and product substitution.
- **2.6** Pricing simulator window (enter customer + product + date, see each step).

### Phase 3: Integration hub (early, so field sales apps can work against xBO)

- **3.1** Integration core: per-organisation connection profiles (URLs, auth scheme), outbox / inbox tables, idempotency keys, retries with backoff, dead-letter queue, replay, mapping tables (external id <-> xBO id).
- **3.2** Contract fixtures: JSON fixtures and contract tests for every integration payload, accepting the field variations real clients send (numbers as strings, extra attributes).
- **3.3** Inbound reads: price lists, special prices, blanket agreements, promotions, stock balances, van stock, credit limits / open invoices, user credit limits, customer locations, serials, targets, expense categories, loyalty balances.
- **3.4** Inbound documents: orders, quotations, sales, credit notes, credit note requests, delivery and goods returns, payments, customers, products, users, stock requests, stock takes, reconciliations, trucks for delivery planning, expenses, incentives, leave, feedback, survey answers. Response always `{transaction_id, transaction_reference}`.
- **3.5** Machine-client auth on every integration endpoint (built in 0.8).
- **3.6** Outbound webhooks: customers, products, prices, stock balances, promotions, sales documents, order / collection / requisition / leave status, stock transfers, delivery trips, GL and COGS accounts, categories; signed payloads and per-subscriber retry.
- **3.7** Polling feeds: orders, invoices and transfer requests waiting for an external system, with acknowledgement and result posting.
- **3.8** Integration monitor app: message list by category, payload viewer, retry / replay, alerts by email.
- **3.9** Onboarding guide for integrators: OpenAPI reference, auth setup, data migration order, parallel-run checklist.

### Phase 4: Order to cash

- **4.1** Sales order window: entry, pricing, free goods, listing, substitution, incompleteness, statuses, output.
- **4.2** Availability check, reservations, product allocation by region / channel / customer, backorder re-run.
- **4.3** Credit management: segments, exposure, checks at order / delivery / goods issue, block worklist and release.
- **4.4** Deliveries from orders, FEFO batch determination with minimum remaining shelf life and splits, picking lists, packing, goods issue with GL posting.
- **4.5** Invoicing: billing runs, combine / split rules, GL posting, PDF and thermal print layouts.
- **4.6** E-invoicing: KRA eTIMS and URA EFRIS adapters with offline queue and retry; signed QR data on invoices.
- **4.7** Credit and debit notes, credit note requests with approval.
- **4.8** Returns: delivery and market returns, inspection, disposition (restock, quarantine, scrap, return to principal).
- **4.9** Payments: cash, M-Pesa (Daraja: STK push, C2B confirmation), MTN MoMo, cheque (bounce handling), bank; allocation to invoices, unallocated credit, receipts.
- **4.10** Customer statements, ageing, collections worklist, dunning.

### Phase 5: Inventory and warehouse

- **5.1** Batches with production / expiry dates, shelf-life checks at receipt, expiry blocking.
- **5.2** Goods receipts from principals / suppliers with batch capture.
- **5.3** Transfers and requisitions (depot to depot, warehouse to van), in-transit stock.
- **5.4** Adjustments with reason codes and approval thresholds.
- **5.5** Stock takes: freeze, count sheets, mobile count, variance posting.
- **5.6** Near-expiry and slow-mover reports; serial numbers.
- **5.7** Moving-average valuation and stock value reports.

### Phase 6: Van sales, route settlement, empties, logistics

- **6.1** Visit plans and journey plans (from a field sales app's routes or maintained in xBO).
- **6.2** Tours: load proposal, check-out count, gate pass.
- **6.3** Van stock as a location; van sales arriving from field apps as sales documents.
- **6.4** Check-in: returned stock, empties and cash counted, supervisor confirmation.
- **6.5** Route settlement: stock, cash (by payment method) and empties reconciliation; variance to driver liability or write-off with approval; settlement document and GL postings.
- **6.6** Empties: returnable items, deposit pricing, product-to-empties links, customer empties balances, exchange vs charge rules.
- **6.7** Delivery planner, trips, proof of delivery.

### Phase 7: Finance

- **7.1** General ledger, journals, account determination for every posting document.
- **7.2** Accounts payable and supplier payments.
- **7.3** Bank accounts, bank statement import and reconciliation (including M-Pesa statements).
- **7.4** Expenses and incentives from field apps, with approval.
- **7.5** Periods, closing, trial balance, P&L, balance sheet, VAT reports.
- **7.6** Margin analysis by customer, product, channel, route (after trade spend).

### Phase 8: Trade spend

- **8.1** Promotions: budget, plan, approve, execute as pricing / free-goods rules, evaluate.
- **8.2** Rebates as condition contracts: accrual per invoice, periodic and final settlement.
- **8.3** Loyalty balances, product participation and customer enrolment status.
- **8.4** Claims and deductions: short payments to dispute cases, matching to promotions, resolution.

### Phase 9: Procurement

- **9.1** Purchase requisitions and orders, principal ordering with suggested quantities.
- **9.2** Supplier invoices, three-way match, payment proposals.

### Phase 10: Manufacturing and quality (manufacturer segment)

- **10.1** Recipes and production orders, consumption and output with batch genealogy.
- **10.2** Quality inspection lots, results, usage decisions, certificates.
- **10.3** Traceability and recall cockpit (backward / forward through batches, deliveries, customers).

### Phase 11: Planning and analytics

- **11.1** Sales targets (published to field apps), forecasts, replenishment proposals.
- **11.2** Dashboards per role; scheduled reports; BI export.

### Phase 12: Hardening and rollout

- **12.1** Performance: load tests for order intake and posting at the volumes of a large field sales force; database indexing review.
- **12.2** Security review, backups and restore drills, observability (Sentry, logs, metrics).
- **12.3** Migration tooling from other ERPs' CSV and Excel exports.
- **12.4** Signed and notarised desktop installers with auto-update (Tauri updater) for Windows, macOS and Linux.
- **12.5** User and admin documentation.

### Suggested order of delivery

Phases 0 -> 1 -> 2 -> 3 (field sales apps can send master data and orders to xBO) -> 4 -> 5 -> 6 -> 7 (xBO can fully replace the ERP for a distributor) -> 8 -> 9 -> 10 -> 11, with 12 running alongside from Phase 4.

## 6. Engineering conventions

- Follow the personal code style rules: declarations grouped by type then ordered by name length, comments only for "why", components as Vue single-file components (no functions returning markup), immutable models where possible, sibling names parallel, booleans start with `is` / `has` / `can`.
- Ordered value sets (statuses, options, module groups) are `as const` arrays of `{ value, label, ... }` objects; their declaration order drives the UI and the union type is derived from them. No parallel lists.
- Every screen follows `DESIGN.md`: tokens only (no raw colours), status always as icon plus word, tabular figures for numbers, all interactive states, keyboard operable, WCAG 2.2 AA.
- API backward compatibility: add fields, never remove or rename.
- Integration jobs must be idempotent and safe to retry.
- Tests against PostgreSQL in Docker; never drop the database in tests (use transactions).
- Living docs per feature in `.docs/living/` (personal, gitignored).

## 7. Risks and open questions

| Risk / question | Mitigation |
| --- | --- |
| Integration clients send field-level variations (types, extra fields) | Step 3.2 builds contract fixtures from real payloads before the endpoints |
| Scope is very large (a full ERP) | Ship in the phase order above; each phase is usable on its own |
| eTIMS / EFRIS specifications change | Isolate in adapters; verify against current KRA / URA documentation at step 4.6 |
| Accounting correctness | Double-entry invariants enforced in the database (balanced journals), accountant review of account determination |
| Which segment first (distributor vs manufacturer) | Plan assumes distributors first; manufacturing is Phase 10 |
| Hosting target | Assumed Docker on a Linux VM; confirm |
