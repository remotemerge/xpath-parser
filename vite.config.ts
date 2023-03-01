import { defineConfig } from 'vitest/config';

// overwrite configs
export default defineConfig({
  test: {
    environment: 'jsdom',
  },
  build: {
    minify: false,
    target: 'esnext',
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[hash].js',
      },
    },
    lib: {
      entry: { 'xpath-parser': '/src/XPathParser.ts' },
      formats: ['es'],
    },
  },
});
