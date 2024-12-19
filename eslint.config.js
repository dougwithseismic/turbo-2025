import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'] },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['dist/**'],
  },
  // Override to prevent TS rules on JS files
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
]
