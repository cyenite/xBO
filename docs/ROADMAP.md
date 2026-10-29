# xBO roadmap

xBO is an open-source framework for desktop-style applications on the web and Tauri. This file records the architecture decisions and what ships when.

## Architecture

| Decision | Choice | Why |
| --- | --- | --- |
| Layers | `@xbo-ui/core` (framework-free TypeScript) under `@xbo-ui/vue` | Window rules, shortcuts, theming and preferences are testable without a DOM framework, and another binding can reuse them |
| UI binding | Vue 3, `<script setup>`, no Pinia | State lives on the `createXbo()` instance and reaches components through `provide`/`inject`, so several desktops can share a page and consumers carry no store dependency |
| Primitives | reka-ui | Accessible menus, dialogs, selects, trees, tabs and splitters with keyboard support already solved |
| Styling | Tailwind v4 compiled inside the library with an `xb:` prefix and no preflight; runtime `--xbo-*` tokens per desktop | Consumers need no Tailwind and the host page is never restyled; optional `tailwind.css` exposes the tokens to Tailwind apps |
| Colour | OKLCH, accents derived from one colour with automatic WCAG contrast checks | Any brand colour stays readable in light, dark and increased contrast |
| Persistence | `StorageAdapter` (sync or async) | `localStorage` by default; Tauri store, server or memory by swapping one object |
| Desktop app | Tauri 2 | Small installers, low memory; the Tauri adapter is optional |
| Language | TypeScript 6 strict, ESM only | One language end to end; every consumer target is ESM |

## Milestones

| Milestone | Scope | Status |
| --- | --- | --- |
| M1 Core | Geometry, window manager, shortcuts, search, colour and theme, preferences, storage, platform | Done |
| M2 Shell | `createXbo`, `<XboDesktop>`, menu bar, taskbar, launcher, palette, notifications, dialogs and sheets, window switcher, session restore, deep links, i18n, composables | Done |
| M3 Theming and settings | Presets, accent, contrast, transparency, motion, density, text size, radius, wallpaper; Settings app with keyboard rebinding and developer sections | Done |
| M4 Component kit | Actions, inputs, data (including the full data grid), layout, feedback | Done |
| M5 Packaging | Library build, type declarations, exports, size budget in CI, scaffold smoke test | Done |
| M6 Tauri adapter | `@xbo-ui/tauri`: native window controls, store adapter, opening links; desktop playground build | Done |
| M7 Docs and tooling | Documentation site with live demos, `create-xbo` scaffolder, Playwright end-to-end and axe accessibility tests | Done |
| M8 Release | Changesets, npm publishing with provenance under `@xbo-ui` | Ready; waiting for the npm org and token |

## Conventions

- Library templates use prefixed utilities (`xb:flex`); global helper classes are `xbo-*`; tokens are `--xbo-*`.
- Components are named `Xbo*`, booleans read `is*` / `has*` / `can*`, ordered value sets are `as const` lists whose order drives the UI.
- Every interactive state, keyboard operable, WCAG 2.2 AA; status is never colour-only.
- Public API changes add, never remove or rename, within a major version.
