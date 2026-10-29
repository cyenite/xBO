# @xbo-ui/vue

Vue 3 bindings for [xBO](https://github.com/cyenite/xBO): a configurable desktop for web and Tauri apps, with windows, menus, a taskbar, a command palette, notifications, dialogs, a Settings app, theming and a component kit.

```bash
pnpm add @xbo-ui/vue vue
```

```ts
import { createApp } from 'vue';
import { createXbo, defineApp } from '@xbo-ui/vue';

const xbo = createXbo({ apps: [defineApp({ id: 'notes', label: 'Notes', component: NotesApp })] });

createApp(App).use(xbo).mount('#app'); // App renders <XboDesktop />
```

The stylesheet is imported for you. Tailwind v4 users can add the tokens as utilities with `@import '@xbo-ui/vue/tailwind.css';`.

Full documentation: https://github.com/cyenite/xBO#readme. MIT licensed.
