import { defineConfig } from 'tsup';

export default defineConfig({
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  shims: true,
  target: 'node24',
});
