// build environment
const buildEnv = process.env.NODE_ENV === 'production' ? 'error' : 'warn';

module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    commonjs: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: {
      jsx: false,
    },
    lib: [],
    sourceType: 'module',
  },
  plugins: [],
  rules: {
    indent: [
      buildEnv,
      2,
      {
        SwitchCase: 1,
      },
    ],
    'linebreak-style': [buildEnv, 'unix'],
    quotes: [buildEnv, 'single'],
    semi: [buildEnv, 'always'],
    'no-unused-vars': buildEnv,
    'no-console': buildEnv,
  },
};
