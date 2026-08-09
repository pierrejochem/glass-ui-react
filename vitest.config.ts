import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/index.ts', 'src/**/*.d.ts'],
      // branches sits lower than the rest because Vitest 4 made AST-aware
      // remapping the default: the same tests over the same code now report
      // ~70% where v8's older line-based approximation said ~78%. The tests
      // did not get worse, the measurement got honest.
      thresholds: { lines: 80, functions: 80, branches: 70, statements: 80 },
    },
  },
});
