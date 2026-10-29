import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  // Relative asset paths let the same build run from a web server or inside a Tauri app.
  base: './',
});
