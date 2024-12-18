import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
  ...compat.config({
    extends: [
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
      'plugin:@typescript-eslint/strict',
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    parserOptions: {
      project: ['./tsconfig.json', '../../tsconfig.json'],
      tsconfigRootDir: import.meta.dirname,
      sourceType: 'module',
    },

    // Only lint src directory
    ignorePatterns: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      '*.config.js',
      '*.config.ts',
      '*.config.mjs',
      '!src/**/*',
    ],

    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-redundant-type-constituents': 'off', // Triggered by generated supabase types
    },
  }),
]

export default eslintConfig
