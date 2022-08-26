import { defineConfig } from 'vite';

// overwrite configs
export default defineConfig({
  build: {
    lib: {
      entry: './src/XpathParser.ts',
      name: 'XpathParser',
      fileName: 'xpath-parser',
      formats: ['es'],
    },
  },
});
