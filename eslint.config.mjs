import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    // avoid scanning these folders
    ignores: ['.angular/**', '.vscode/**', 'dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.ts'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.browser },
    rules: {
      'no-case-declarations': 'off',
    },
  },
  tseslint.configs.recommended,
  {
    // override tseslint.configs.recommended
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
]);
