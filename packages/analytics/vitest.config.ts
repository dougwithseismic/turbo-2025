/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/test/**'],
    },
    deps: {
      inline: [/@repo\/.*/],
    },
    typecheck: {
      tsconfig: './tsconfig.json',
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
