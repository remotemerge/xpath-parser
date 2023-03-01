import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

// base configs
export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      tsPlugin,
    },
    rules: {
      ...tsPlugin.configs['eslint-recommended'].rules,
      ...tsPlugin.configs['recommended'].rules,
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'prefer-const': 'error',
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
    },
    files: ['src/**/*.{ts,tsx}'],
  },
];
