import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import tanstackQuery from '@tanstack/eslint-plugin-query';
import prettier from 'eslint-config-prettier';

export default defineConfig([
  { ignores: ['out/**', 'dist/**', 'node_modules/**'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  tanstackQuery.configs['flat/recommended'],
  prettier,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      // Resetting state on prop change (e.g. modal reopen) is a valid pattern in this project
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]);
