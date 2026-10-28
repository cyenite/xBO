import vue from '@vitejs/plugin-vue';
import icons from 'unplugin-icons/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

const apiTarget = process.env.XBO_API_URL ?? 'http://localhost:3000';

export default defineConfig({
  plugins: [vue(), icons({ compiler: 'vue3' }), tailwindcss()],
  // Tauri serves the build from its own origin, so asset paths must be relative.
  base: './',
  clearScreen: false,
  server: {
    port: Number(process.env.PORT ?? 5190),
    strictPort: true,
    proxy: {
      '/api': apiTarget,
    },
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
