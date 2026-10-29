import { fileURLToPath } from 'node:url';
import icons from 'unplugin-icons/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, postcssIsolateStyles } from 'vitepress';

// Demos run against the library sources so the docs always match the code in this repository.
const source = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  title: 'xBO',
  description: 'An open-source framework for desktop-style applications on the web and Tauri.',
  base: process.env.DOCS_BASE ?? '/xBO/',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Components', link: '/components/' },
      { text: 'API', link: '/api/composables' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'Configuration', link: '/guide/configuration' },
          { text: 'Apps and windows', link: '/guide/apps-and-windows' },
          { text: 'Menus, commands and shortcuts', link: '/guide/menus-commands-shortcuts' },
          { text: 'Notifications and dialogs', link: '/guide/notifications-and-dialogs' },
          { text: 'Theming', link: '/guide/theming' },
          { text: 'Settings and preferences', link: '/guide/settings-and-preferences' },
          { text: 'Languages', link: '/guide/languages' },
          { text: 'Desktop apps with Tauri', link: '/guide/tauri' },
        ],
      },
      { text: 'Components', items: [{ text: 'Component kit', link: '/components/' }] },
      { text: 'API', items: [{ text: 'Composables', link: '/api/composables' }] },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/cyenite/xBO' }],
    search: { provider: 'local' },
    footer: { message: 'MIT licensed' },
  },
  vite: {
    plugins: [icons({ compiler: 'vue3' }), tailwindcss()],
    // Lets `.vp-raw` blocks (the live demos) opt out of VitePress's article and base element styles.
    css: { postcss: { plugins: [postcssIsolateStyles({ includeFiles: [/vp-doc\.css/, /base\.css/] })] } },
    resolve: {
      alias: [
        { find: /^@xbo-ui\/vue$/, replacement: source('../../../packages/vue/src/index.ts') },
        { find: /^@xbo-ui\/core$/, replacement: source('../../../packages/core/src/index.ts') },
      ],
    },
    ssr: { noExternal: ['reka-ui', '@vueuse/core'] },
  },
});
