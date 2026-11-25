import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      'server-only': path.resolve(__dirname, 'tests/empty.ts'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: { include: ['tests/**/*.test.ts'], testTimeout: 30_000, fileParallelism: false },
});
