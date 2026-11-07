import { defineConfig } from 'vitest/config';

// Worker tests run in plain Node (fetch, Request and Response are built in).
export default defineConfig({
  test: {
    root: 'worker',
    include: ['test/**/*.test.ts'],
    environment: 'node',
  },
});
