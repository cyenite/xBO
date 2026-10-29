# xBO (Back Office): development plan

xBO is a back office for property management companies, letting agents and landlords with large portfolios. It covers properties and units, owners, tenants and leases, billing, collections, deposits, maintenance, owner accounting and the general ledger, with a desktop-style interface inspired by macOS and Windows 11, and an open integration API that payment services, tenant portals, banks and messaging providers connect to. One codebase ships as a **web app** and as a **desktop app** for Windows, macOS and Linux.

Date: 2026-10-29. Status: Phase 0 in progress: monorepo, API skeleton, shared contracts, desktop shell UI, Tauri wrapper, database and migrations, session and machine-client auth, organisations and tenancy scope, and CI are in place.

Product and visual direction live in `PRODUCT.md` and `DESIGN.md` at the repository root; every UI change follows them.

## 1. Goals

1. **Integrate openly.** Payment gateways, banks, tenant portals and messaging providers connect through a documented REST API in three directions (they call xBO, xBO sends them webhooks, they poll xBO feeds), authenticating with standard schemes: OAuth 2 client credentials, HTTP basic, bearer tokens or an API key header.
2. **Cover property management end to end:** portfolio, owners, tenants and leases, rent and service-charge billing, metered utilities, collections and arrears, deposits, maintenance and inspections, owner statements and remittances, and accounting.
3. **Feel like a desktop application:** windows, a dock/taskbar, menus, keyboard shortcuts, dense data grids, many records open side by side.
4. **Be correct first:** immutable posted documents, double-entry accounting, client money kept separate per owner, idempotent integrations, full audit trail.

## 2. Architecture decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Shape | Modular monolith | One deployable, clear module boundaries, no distributed transactions between billing and accounting |
| Language | TypeScript end to end (TypeScript 6.x, pinned) | One language for API, UI and contracts; request and response types are shared, not duplicated. TypeScript 7 is not used yet: its native compiler has no JavaScript API, which the Nest CLI, tsup and vue-tsc need |
| Backend | NestJS 12 on Fastify (`apps/api`) | Module system maps one-to-one to the modules below; dependency injection, guards and interceptors suit a large codebase; Fastify for throughput |
| Database | PostgreSQL 16 with Drizzle ORM and drizzle-kit migrations | Exact `numeric`, row-level locking for payment allocation, partial and expression indexes, transactional DDL. Drizzle keeps SQL visible and typed |
| Money and quantities | `numeric(19,4)` columns read as strings, decimal arithmetic with a decimal library, never JavaScript floats | Rounding errors are unacceptable in invoices, balances and owner statements |
| Validation and contracts | zod schemas in `packages/contracts`, used by the API, the UI and integration contract tests | One definition of every payload, including integration payloads |
| Queue, cache, locks | Redis + BullMQ | Billing runs, payment matching, reminders, integration jobs, retries with backoff |
| Realtime | WebSockets through a NestJS gateway | Live updates in open windows (balances, document status, integration monitor) |
| API | REST JSON under `/api/v1`, OpenAPI generated from the zod contracts | One API for the UI and third parties |
| Auth | Session cookies for the UI (desktop app uses the same login); machine clients per organisation for integrations, accepted over OAuth 2 client credentials, bearer tokens, HTTP basic and an `X-Api-Key` header | Integration clients range from OAuth-capable services to simple scripts; all four are standard and widely supported |
| Tenancy | Single database, `organization_id` on every business row, enforced in the repository layer and by policies | One xBO install can serve several management companies; a machine client belongs to exactly one, so integrations never name it |
| Frontend | Vue 3 + TypeScript + Vite SPA (`apps/web`), Pinia, Tailwind CSS v4, reka-ui primitives, Remix Icon compiled per icon by unplugin-icons | A mature, well-documented component ecosystem. A plain SPA rather than Nuxt because the desktop shell manages windows, not pages |
| Desktop | Tauri 2 (`apps/desktop`) wrapping the same web build | Installers of about 10 MB instead of 100 MB or more, low memory use, strict security model; the Rust side stays small (window, updater, later receipt printers). Chosen over Electron |
| Repository | pnpm workspace monorepo: `apps/api`, `apps/web`, `apps/desktop`, `packages/contracts`, `docs/` | One change can touch API, UI and contracts together |

### Core domain patterns

1. **Portfolio structure:** Organisation (management company) -> Owner -> Property -> Block (optional) -> Unit. A unit has a type, size, meters and standard charges; a property can have several owners with shares.
2. **Document framework:** every business step is a document with a header, lines, a status machine, a number from a number range, and links to predecessor and successor documents (lease -> invoice -> payment -> receipt). Posted documents are immutable; corrections are reversals or credit notes.
3. **Lease as the billing contract:** a lease carries the rent, escalation schedule, recurring charges, deposit, billing day and due terms. Billing runs read active leases; nothing is billed from a unit directly.
4. **Tenant ledger:** every charge, payment, credit and deposit movement is a ledger entry on the tenant account per lease; balances and ageing are derived and cached.
5. **Postings:** every billing, payment and remittance document posts balanced journal entries to the general ledger through account determination rules, with client money (rent collected for owners) kept in owner sub-ledgers.
6. **Approvals with worklists:** write-offs, work order quotes over a limit, deposit refunds and owner remittances, each released by a role from a worklist.
7. **Outbox / inbox:** every integration message is persisted before sending or after receiving, with an idempotency key, retry state and replay.

## 3. Backend module map

| Module | Owns |
| --- | --- |
| `Core` | Organisations, users, roles and permissions, settings, number ranges, audit log, attachments, approvals engine, document framework, notifications |
| `Portfolio` | Owners, properties, blocks, units, unit types, amenities, meters, charge types, tax codes, payment terms |
| `Leasing` | Applicants, tenants (people and companies), guarantors, leases, rent escalations, recurring charges, renewals, notices, move-in and move-out |
| `Billing` | Billing runs, invoices, metered utility billing, late-payment penalties, credit and debit notes, e-invoicing (eTIMS) for VAT-registered landlords |
| `Collections` | Payments (M-Pesa, bank, card, cheque, cash), matching by account reference, allocation, unallocated credit, receipts, arrears ageing, reminders, demand letters, tenant statements |
| `Deposits` | Deposits held per lease, top-ups, deductions on move-out, refunds |
| `OwnerAccounting` | Management agreements and fees, owner sub-ledgers, expenses charged to owners, owner statements, remittances |
| `Maintenance` | Work orders, contractors (vendors), quotes and approvals, costs recovered from owners or tenants, preventive schedules |
| `Inspections` | Move-in, move-out and routine inspections, room-by-room condition, photos, damage pricing |
| `Finance` | Chart of accounts, journals, account determination, accounts payable, bank and mobile-money reconciliation, periods and close, financial statements, rental income tax reports |
| `Integration` | Integration API, webhooks, polling feeds, outbox / inbox, mappings, schedules, monitor, replay |
| `Reporting` | Occupancy, arrears, rent roll, yield and expense reports, exports |

## 4. Desktop UI design

### Shell

- **Top menu bar** (macOS): xBO menu, the focused window's app menus (File, Edit, View, Go, Window, Help), and on the right: organisation switcher, sync status, notifications, clock, user.
- **Taskbar / dock** (Windows 11 centred taskbar with macOS dock behaviour): pinned apps, running windows with indicators, a Start launcher, and a system tray area.
- **Start launcher:** apps grouped by module, recent records, search.
- **Command palette** (Ctrl/Cmd+K, Spotlight style): open apps, find documents by number, run actions.
- **Windows:** draggable, resizable, minimise / maximise / restore, focus order, double-click title to maximise, snap to halves and quarters (Windows 11 snap layouts on hover over maximise), remember positions per user. Several windows of the same app (two leases side by side).
- **Window chrome setting:** "macOS" (traffic-light buttons on the left) or "Windows" (caption buttons on the right), defaulting to the user's OS.
- **Materials:** translucent "Mica / vibrancy" backgrounds with backdrop blur, 8 to 12 px rounded corners, soft layered shadows, light and dark themes following the OS.
- **Notification centre** and toasts for document events, unmatched payments and integration failures.
- **Deep links:** the URL encodes the focused window (`/#/w/lease/LS-000123`) so links open the right document.

### Inside windows

- **Data grid** (the workhorse): virtualised rows, column chooser, sort, filter, group, inline edit, keyboard navigation, copy / paste to Excel, export, saved views.
- **Document window layout:** header fields, a lines grid, a side panel (status, document flow, attachments, audit), a toolbar with actions allowed by the document's status.
- **Master-detail** for portfolio and tenant records, **wizards** for multi-step flows (letting a unit, ending a lease), **dashboards** as widgets.
- Desktop-grade keyboard support: Tab order, Enter to move down in grids, F2 edit, Ctrl+S save, Esc cancel, Ctrl+P print.

### Accessibility and density

Compact and comfortable density modes, full keyboard operation, focus rings, contrast checked in both themes, scalable text.

## 5. Step-by-step plan

Each step lists deliverables. A step is done when its tests pass in CI and its living doc entry is written.

### Phase 0: Foundations

- **0.1** pnpm monorepo, README, `.gitignore`, editorconfig, PRODUCT.md and DESIGN.md. *(done)*
- **0.2** API: NestJS on Fastify, `/api/v1/health`, Vitest with SWC for decorator metadata. *(done)*
- **0.3** Shared contracts package (zod) with the first inbound payment contract and tests. *(done)*
- **0.4** Web: Vue 3 + TS + Vite, Tailwind v4 design tokens, ESLint, Vitest. *(done)*; Playwright end-to-end tests. *(to do)*
- **0.5** Desktop: Tauri 2 wrapper, icons, CSP. *(config done; first build needs the Linux system packages listed in the README)*
- **0.6** Database: Drizzle ORM, migrations, Docker Compose PostgreSQL and Redis, test database per run. *(done)*
- **0.7** CI (GitHub Actions): typecheck, lint, tests and builds for every workspace package; desktop installers on tagged releases (Windows, macOS, Linux runners). *(done; the release workflow runs on the first `v*` tag)*
- **0.8** Auth: login, sessions, password reset, 2FA; machine clients with OAuth 2 client credentials, bearer, basic and API key header schemes. *(login, sessions and machine clients done; password reset, 2FA and login rate limiting to do)*
- **0.9** Organisations and tenancy scope; users, roles, permissions (permission matrix per module and action). *(organisations, memberships and tenancy scope done; user management, roles and permissions to do)*
- **0.10** Audit log (who changed what, before / after), attachments, comments.
- **0.11** Number ranges per document type, organisation and year.
- **0.12** Document framework: base header / line tables, status machine, document flow links, immutability after posting, reversal helper.
- **0.13** Approvals engine (rules by amount, role, document type) and worklists.
- **0.14** Desktop shell: menu bar, taskbar, Start launcher, windows with drag, resize, snap and snap-layout flyout, command palette, themes, window control styles, deep links. *(first version done)*; notification centre and toasts. *(to do)*
- **0.15** UI kit: data grid *(first version done: sorting, keyboard selection, sticky header)*, form controls, document window template, master-detail template, dialogs, toasts; grid virtualisation for large lists.
- **0.16** Settings app *(done: appearance, transparency, density, window controls)* and system health app.

### Phase 1: Portfolio

- **1.1** Owners: people and companies, contacts, KRA PIN, payout accounts.
- **1.2** Properties, blocks and units: unit types, size, floor, amenities, photos, status (vacant, reserved, occupied, unavailable).
- **1.3** Meters per unit (water, electricity) and their reading history.
- **1.4** Charge types (rent, service charge, water, garbage, parking, penalties) with tax codes and GL accounts.
- **1.5** Payment terms, payment methods, chart of accounts (basic).
- **1.6** Import wizards (Excel / CSV) for owners, properties, units and opening balances, with validation previews.

### Phase 2: Leasing

- **2.1** Tenants (people and companies), contacts, identity documents, guarantors, emergency contacts.
- **2.2** Applications: applicant details, documents, checks, approval, reservation of a unit.
- **2.3** Leases: term, rent, escalation schedule, recurring charges, deposit, billing day, due terms, late-payment policy, documents and signatures.
- **2.4** Renewals with new terms, notices from either side, lease end and move-out date.
- **2.5** Lease window: header, charges grid, ledger, documents, timeline; several open side by side.

### Phase 3: Billing and rent roll

- **3.1** Billing runs: collect active leases by billing day, rent with escalations, recurring charges, prorating for part months; draft, review, post.
- **3.2** Metered utilities: reading capture (grid and import), consumption, tariffs, billing.
- **3.3** Late-payment penalties by policy, with approval to waive.
- **3.4** Credit and debit notes with approval.
- **3.5** Invoice output: PDF layout, email and SMS delivery.
- **3.6** KRA eTIMS adapter for VAT-registered landlords (commercial lets), with offline queue and retry.
- **3.7** Rent roll window: every unit with tenant, rent, balance and status; saved views per portfolio.

### Phase 4: Collections and deposits

- **4.1** Payments: M-Pesa (Daraja paybill C2B confirmations, STK push), bank transfers, cards, cheques (bounce handling), cash; receipts.
- **4.2** Matching: account reference to unit or tenant, fuzzy suggestions, worklist for unmatched payments.
- **4.3** Allocation: oldest invoice first by default, manual override, unallocated credit and refunds.
- **4.4** Arrears: ageing, reminder schedules by SMS and email, demand letters, payment plans.
- **4.5** Tenant statements.
- **4.6** Deposits: receipt, top-ups, move-out deductions, refunds with approval.
- **4.7** Bank and mobile-money statement import and reconciliation.

### Phase 5: Integration hub (so payment services and portals can work against xBO)

- **5.1** Integration core: per-organisation connection profiles, outbox / inbox tables, idempotency keys, retries with backoff, dead-letter queue, replay, mapping tables (external id <-> xBO id).
- **5.2** Inbound: payment notifications, maintenance requests, meter readings, rental applications; reads for tenant balances, statements, open invoices and vacant units.
- **5.3** Outbound webhooks: invoice issued, payment matched or unmatched, lease signed, notice given, unit vacated, work order status changed, owner statement approved; signed payloads and per-subscriber retry.
- **5.4** Polling feeds: reminders and remittances waiting for an external system, with acknowledgement.
- **5.5** Integration monitor app: message list by category, payload viewer, retry / replay, alerts by email.
- **5.6** Onboarding guide for integrators: OpenAPI reference, auth setup, data migration order.

### Phase 6: Owner accounting

- **6.1** Management agreements: fee as a percentage of collections or a fixed amount, approval limits, payout schedule.
- **6.2** Owner sub-ledgers for client money; expenses charged to owners.
- **6.3** Owner statements: collections, fees, expenses, remittance due; approval and PDF output.
- **6.4** Remittances: payment proposals, bank files, confirmation.

### Phase 7: Maintenance and inspections

- **7.1** Work orders from tenants, staff or inspections; priority, photos, status.
- **7.2** Contractors, quotes, approvals (owner approval above a limit), completion, contractor bills.
- **7.3** Cost recovery: charge to owner, recover from tenant, or absorb.
- **7.4** Preventive schedules (lifts, pumps, fire equipment).
- **7.5** Inspections: templates, room-by-room condition and photos, move-in versus move-out comparison, damage pricing into the final account.

### Phase 8: Finance

- **8.1** General ledger, journals, account determination for every posting document.
- **8.2** Accounts payable and contractor payments.
- **8.3** Periods, closing, trial balance, P&L, balance sheet.
- **8.4** Tax reports: monthly rental income tax and VAT for commercial lets.

### Phase 9: Reporting and analytics

- **9.1** Occupancy, vacancy duration, turnover, arrears trends, collection rate, yield per property.
- **9.2** Dashboards per role; scheduled reports; BI export.

### Phase 10: Hardening and rollout

- **10.1** Performance: load tests for billing runs and month-start payment volumes at the size of a large portfolio; database indexing review.
- **10.2** Security review, backups and restore drills, observability (Sentry, logs, metrics).
- **10.3** Migration tooling from spreadsheets and other property systems' CSV and Excel exports.
- **10.4** Signed and notarised desktop installers with auto-update (Tauri updater) for Windows, macOS and Linux.
- **10.5** User and admin documentation.

### Suggested order of delivery

Phases 0 -> 1 -> 2 -> 3 -> 4 (a management company can let units, bill and collect) -> 5 (payment services post straight to xBO) -> 6 (owner statements and remittances) -> 7 -> 8 -> 9, with 10 running alongside from Phase 4.

## 6. Engineering conventions

- Follow the personal code style rules: declarations grouped by type then ordered by name length, comments only for "why", components as Vue single-file components (no functions returning markup), immutable models where possible, sibling names parallel, booleans start with `is` / `has` / `can`.
- Ordered value sets (statuses, options, module groups) are `as const` arrays of `{ value, label, ... }` objects; their declaration order drives the UI and the union type is derived from them. No parallel lists.
- Every screen follows `DESIGN.md`: tokens only (no raw colours), status always as icon plus word, tabular figures for numbers, all interactive states, keyboard operable, WCAG 2.2 AA.
- API backward compatibility: add fields, never remove or rename.
- Integration jobs must be idempotent and safe to retry.
- Tests run against PostgreSQL in Docker: each run creates and drops its own throwaway database, so tests never touch development data.
- Living docs per feature in `.docs/living/` (personal, gitignored).

## 7. Risks and open questions

| Risk / question | Mitigation |
| --- | --- |
| Payment references are typed by tenants and are often wrong | Matching worklist from Phase 4, fuzzy suggestions, and per-tenant reference aliases learned from manual matches |
| Scope is large | Ship in the phase order above; each phase is usable on its own |
| Client money rules differ by country and by the agent's licensing | Owner sub-ledgers from the start; confirm local rules before Phase 6 |
| eTIMS specification changes | Isolate in an adapter; verify against current KRA documentation at step 3.6 |
| Accounting correctness | Double-entry invariants enforced in the database (balanced journals), accountant review of account determination |
| Hosting target | Assumed Docker on a Linux VM; confirm |
