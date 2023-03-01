import { defineConfig } from 'vite';

// overwrite configs
export default defineConfig({
  build: {
    minify: false,
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
