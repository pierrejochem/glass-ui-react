import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/styles/liquid.css'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom'],
  // the stylesheet ships alongside the JS; consumers import it once

  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
