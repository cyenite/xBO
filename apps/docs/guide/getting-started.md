# Getting started

## Create an app

```bash
pnpm create xbo my-app
cd my-app
pnpm install
pnpm dev
```

Add `--tauri` to include the desktop integration.

## Add xBO to an existing Vue app

```bash
pnpm add @xbo-ui/vue
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

The stylesheet is imported by the package. Every app is a normal Vue component; inside it, composables such as `useCurrentWindow()` reach the desktop.

## Fullscreen or embedded

By default the desktop fills the browser window (`position: fixed`), listens to the whole page's keyboard and keeps the focused app in the URL hash. To place it inside a page, as on this site:

```ts
createXbo({
  apps,
  shell: { isFullscreen: false },
  routing: 'none',
});
```

An embedded desktop fills its container and only hears keys while focus is inside it.
