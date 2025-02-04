#!/usr/bin/env node
import esbuild from 'esbuild'
import { builtinModules } from 'module'

esbuild
  .build({
    entryPoints: ['./src/app.ts'],
    bundle: true,
    platform: 'node',
    outdir: 'dist',
    tsconfig: './tsconfig.json',
    format: 'esm',
    external: [...builtinModules],
  })
  .then(() => console.log('Build succeeded'))
  .catch((error) => {
    console.error('Build failed:', error)
    process.exit(1)
  })
