import vue from '@vitejs/plugin-vue';
import icons from 'unplugin-icons/vite';
import tailwindcss from '@tailwindcss/vite';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

// Library mode extracts CSS into dist/style.css and drops the import, so the entry re-imports it: consumers get the
// styles from `import '@xbo-ui/vue'` alone, as the README promises.
const importStylesheet: Plugin = {
  name: 'xbo-import-stylesheet',
  apply: 'build',
  renderChunk: (code, chunk) => (chunk.isEntry ? `import './style.css';\n${code}` : null),
};

export default defineConfig({
  plugins: [vue(), icons({ compiler: 'vue3' }), tailwindcss(), importStylesheet],
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'index.js',
      cssFileName: 'style',
    },
    rollupOptions: {
      external: ['vue', 'reka-ui', /^@vueuse\//, /^@xbo-ui\//],
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    css: false,
  },
});
