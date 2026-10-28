import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// Nest relies on emitted decorator metadata for dependency injection, which esbuild does not produce.
export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    include: ['src/**/*.test.ts'],
    setupFiles: ['src/testing/setup.ts'],
    environment: 'node',
    globalSetup: ['src/testing/global-setup.ts'],
  },
});
