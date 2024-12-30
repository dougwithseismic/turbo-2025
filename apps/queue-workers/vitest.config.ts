import { defineConfig } from 'vitest/config'

export default defineConfig({
  esbuild: {
    target: 'es2020',
    keepNames: true,
  },
  test: {
    environment: 'node',

    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'src/test/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/*',
      ],
    },
  },
})
