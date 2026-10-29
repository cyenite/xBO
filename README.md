# xBO

An open-source framework for building desktop-style applications for the web and [Tauri](https://tauri.app), in Vue 3.

Register your app's windows with one `createXbo()` call and get a complete desktop: windows that drag, resize, snap and remember where they were, a menu bar that follows the focused app, a taskbar, a Start launcher, a command palette, notifications, dialogs and window-modal sheets, a Settings app, and a component kit that follows the user's theme. It runs fullscreen in a browser tab, embedded in any page, or as a native app.

> Status: pre-release. Packages are not on npm yet.

## Packages

| Package | What it is |
| --- | --- |
| [`@xbo-ui/vue`](packages/vue) | The Vue 3 desktop: `createXbo`, `<XboDesktop>`, composables, built-in Settings and About apps, and the component kit. Re-exports `@xbo-ui/core`. |
| [`@xbo-ui/core`](packages/core) | Framework-free logic: window management and geometry, shortcuts, search ranking, OKLCH theming with contrast checks, preferences and storage adapters. |
| [`apps/playground`](apps/playground) | A kitchen-sink app that exercises every feature. |

## Quick start

```bash
pnpm add @xbo-ui/vue vue
```

```ts
// main.ts
import { createApp } from 'vue';
import { createXbo, defineApp } from '@xbo-ui/vue';
import App from './App.vue';
import NotesApp from './NotesApp.vue';

const xbo = createXbo({
  brand: { name: 'Acme Desk', version: '1.0.0' },
  apps: [defineApp({ id: 'notes', label: 'Notes', component: NotesApp, isPinned: true })],
  startup: { open: ['notes'] },
});

createApp(App).use(xbo).mount('#app');
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { XboDesktop } from '@xbo-ui/vue';
</script>

<template>
  <XboDesktop />
</template>
```

Inside a window, apps use composables:

```ts
const current = useCurrentWindow();
current.setTitle('Quarterly plan');
current.setDirty(true); // closing now asks before discarding
useShortcut('notes:save', save, { label: 'Save note', binding: 'Mod+S', scope: 'window' });
useNotifications().notify({ title: 'Saved', tone: 'success' });
```

## What you can configure

| Area | Options |
| --- | --- |
| Brand | `name`, `mark` (component), `version`, `description`, `homepage`, `copyright` |
| Apps | `defineApp({ id, label, icon, component, group, summary, keywords, defaultSize, minSize, maxSize, isResizable, isSingleInstance, isPinned, isHidden, menus })`, `groups` |
| Shell | `shell: { isFullscreen, hasMenuBar, hasTaskbar, hasLauncher, hasPalette, hasNotifications, hasAppearanceToggle, desktopHint, compactWorkspaceWidth }` |
| Menus | `menus`, `helpMenu`, per-app `menus`, per-window `useCurrentWindow().setMenus()` |
| Menu bar | `statusItems` (components), `account` (component) |
| Theme | `theme: { preset, accent, light, dark, radius, fonts }`; eight presets, any accent colour (contrast-checked), token overrides |
| Preferences | `preferences: { defaults, locked, hidden, storage, namespace }`; storage adapters for `localStorage`, memory, or your own (sync or async) |
| Shortcuts | `shortcuts` overrides; apps add rebindable shortcuts with `useShortcut()` |
| Settings | `settingsSections` to add your own pages to the built-in Settings app; `useAppPreference()` for app-specific values |
| Startup | `startup: { open, isSessionRestored }`, `routing: 'hash' \| 'none'` (deep links like `#/notes?id=42`) |
| Language | `i18n: { locale, messages, locales }`; every built-in string is a message key |

Users can change, in the built-in Settings app: theme (light, dark, system), accent colour, contrast, transparency, motion, density, text size, corner radius, wallpaper, window controls (macOS or Windows style), remembered window sizes, session restore, taskbar position, alignment and auto-hide, menu bar clock, do not disturb, every keyboard shortcut, language and clock format.

## Styling

`@xbo-ui/vue` ships one precompiled stylesheet. It never restyles the host page: utilities are prefixed, there is no global reset, and every token is a `--xbo-*` custom property scoped to the desktop. Apps that use Tailwind CSS v4 can add the tokens as utilities:

```css
@import 'tailwindcss';
@import '@xbo-ui/vue/tailwind.css';
```

Then `bg-window`, `text-ink-muted`, `ring-hairline`, `text-body` and friends follow the user's theme.

## Development

Requirements: Node.js 22 or later and pnpm 10.

```bash
pnpm install
```

```bash
pnpm build:libs
```

```bash
pnpm dev
```

The playground runs on http://localhost:5190 against the library sources, so edits hot-reload.

Checks (CI runs the same):

```bash
pnpm typecheck
```

```bash
pnpm lint
```

```bash
pnpm test
```

```bash
pnpm build
```

Design rules for every component live in [DESIGN.md](DESIGN.md); product principles in [PRODUCT.md](PRODUCT.md); the roadmap in [docs/ROADMAP.md](docs/ROADMAP.md).

## Keyboard (defaults, all rebindable)

| Shortcut | Action |
| --- | --- |
| Ctrl K (⌘ K on Mac) | Command palette |
| Ctrl Esc | Start launcher |
| Ctrl , (⌘ , on Mac) | Settings |
| Ctrl ` | Switch windows |
| Ctrl Alt ← / → | Snap the focused window left or right |
| Ctrl Alt ↑ | Fill the screen |
| Ctrl Alt ↓ | Restore, then minimise |
| Ctrl Alt W | Close the focused window |
| Ctrl Alt N | New window of the focused app |
| Ctrl Alt M | Notifications |

## Licence

[MIT](LICENSE)
