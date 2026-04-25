/**
 * Shared ESLint configuration for Sanda packages and services.
 *
 * Variants exported:
 *   - base      : plain TypeScript libraries
 *   - nextjs    : Next.js apps (web + admin)
 *   - reactNative: Expo/React Native app
 */

/** @type {import('eslint').Linter.Config} */
const base = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'import',
    'simple-import-sort',
    'unused-imports',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'turbo',
    'prettier',
  ],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    'unused-imports/no-unused-imports': 'warn',
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    'import/no-default-export': 'off',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.next/',
    '.turbo/',
    'coverage/',
    'generated/',
  ],
};

/** @type {import('eslint').Linter.Config} */
const nextjs = {
  ...base,
  extends: [
    ...base.extends,
    'next/core-web-vitals',
  ],
  rules: {
    ...base.rules,
    '@next/next/no-html-link-for-pages': 'off',
    'react/jsx-key': 'error',
  },
};

/** @type {import('eslint').Linter.Config} */
const reactNative = {
  ...base,
  plugins: [...base.plugins, 'react', 'react-hooks'],
  extends: [
    ...base.extends,
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    ...base.rules,
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
};

module.exports = { base, nextjs, reactNative };
