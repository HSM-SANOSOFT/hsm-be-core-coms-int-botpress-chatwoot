// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.url,
      },
    },
  },
  {
    rules: {
      // TypeScript Rules
      'no-unused-vars': 'off', // Disable base rule
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-use-before-define': 'error',

      '@typescript-eslint/consistent-type-imports': 'error',
      "@typescript-eslint/triple-slash-reference": "error",
      "@typescript-eslint/no-import-type-side-effects": "error",
      '@typescript-eslint/no-require-imports': 'error',

      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-empty-interface': 'error',
      '@typescript-eslint/no-empty-object-type': 'error',

      "@typescript-eslint/no-unsafe-return": "error",
      '@typescript-eslint/no-explicit-any': 'error',
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      '@typescript-eslint/no-floating-promises': 'error',

      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      '@typescript-eslint/no-unnecessary-type-arguments': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unnecessary-type-constraint': 'error',
      "@typescript-eslint/no-unnecessary-template-expression": "error",
      "@typescript-eslint/no-unnecessary-qualifier": "error",
      "@typescript-eslint/no-unnecessary-parameter-property-assignment": "error",

      // Import Sorting
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // Prettier Integration
      'prettier/prettier': 'warn',

      // General Code Quality Rules
      'no-console': 'warn',
      'no-debugger': 'error',
      'eol-last': ['error', 'always'],
    },
  },
);