import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vitest/config';

// Config própria (sem o plugin do PWA do vite.config.ts): os testes cobrem só lógica pura.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
