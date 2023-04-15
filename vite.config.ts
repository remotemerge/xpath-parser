// modules
import { defineConfig } from 'vitest/config';

// overwrite configs
export default defineConfig({
  test: {
    environment: 'jsdom',
  },
  build: {
    minify: false,
    lib: {
      entry: 'src/index.ts',
      name: 'XPathParser',
      fileName: (format) => `index.${format}.js`,
    },
    sourcemap: true,
  },
});
