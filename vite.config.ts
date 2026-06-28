import { defineConfig } from 'vitest/config';

const repositoryName = 'UBC';

export default defineConfig({
  base: `/${repositoryName}/`,
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
});
