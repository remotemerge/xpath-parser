import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts({ tsconfigPath: './tsconfig.dts.json', outDir: 'dist/types' })],
  build: {
    minify: true,
    lib: {
      entry: './src/index.ts',
      name: 'XPathParser',
      formats: ['es', 'iife', 'cjs'],
      fileName: (format) => {
        switch (format) {
          case 'es':
            return 'index.es.js';
          case 'iife':
            return 'index.browser.js';
          case 'cjs':
            return 'index.node.js';
          default:
            return `index.${format}.js`;
        }
      },
    },
    sourcemap: false,
  },
});
