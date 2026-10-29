import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import icons from 'unplugin-icons/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

// The playground runs against the library sources, so edits to packages/* hot-reload without a rebuild.
const source = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [vue(), icons({ compiler: 'vue3' }), tailwindcss()],
  resolve: {
    alias: [
      { find: /^@xbo-ui\/vue$/, replacement: source('../../packages/vue/src/index.ts') },
      { find: /^@xbo-ui\/vue\/tailwind\.css$/, replacement: source('../../packages/vue/tailwind.css') },
      { find: /^@xbo-ui\/core$/, replacement: source('../../packages/core/src/index.ts') },
      { find: /^@xbo-ui\/tauri$/, replacement: source('../../packages/tauri/src/index.ts') },
    ],
  },
  // Tauri serves the build from its own origin, so asset paths must be relative.
  base: './',
  clearScreen: false,
  server: {
    port: Number(process.env.PORT ?? 5190),
    strictPort: true,
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
});
