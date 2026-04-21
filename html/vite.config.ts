import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts({ tsconfigPath: './tsconfig.dts.json', outDir: 'dist/types' })],
  build: {
    minify: true,
    emptyOutDir: true,
    lib: {
      entry: {
        index: './src/index.ts',
        browser: './src/browser.ts',
        node: './src/node.ts',
      },
      name: 'XPathParser',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'mjs' : 'cjs';
        return `${entryName}.${ext}`;
      },
    },
    rollupOptions: {
      external: ['@xmldom/xmldom', 'xpath'],
    },
    sourcemap: false,
  },
});
