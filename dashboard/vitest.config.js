import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'tests/unit/**/*.test.{js,mjs,ts,tsx}',
      'tests/integration/**/*.test.{js,mjs,ts,tsx}',
    ],
    setupFiles: ['tests/setup.js'],
    coverage: {
      provider: 'v8',
      include: ['parser.mjs', 'server.mjs', 'src/**/*.{ts,tsx}'],
      reportsDirectory: 'tests/coverage',
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});