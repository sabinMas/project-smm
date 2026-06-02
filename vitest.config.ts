import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/infra/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/infra/**', '**/*.config.*'],
    },
  },
  resolve: {
    alias: {
      '@smm/shared': path.resolve(__dirname, 'shared/src'),
      '@smm/backend': path.resolve(__dirname, 'backend/src'),
    },
  },
});
