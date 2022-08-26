import { defineConfig } from 'vite';

// overwrite configs
export default defineConfig({
  build: {
    lib: {
      entry: './src/XPathParser.ts',
      name: 'XpathParser',
      fileName: 'xpath-parser',
      formats: ['es'],
    },
  },
});
