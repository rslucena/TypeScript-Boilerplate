/// <reference types="tsup" />
import { defineConfig } from 'tsup'

export default defineConfig({
  dts: true,
  clean: true,
  bundle: true,
  minify: true,
  metafile: true,
  platform: 'node',
  outDir: 'dist',
  sourcemap: true,
  minifySyntax: true,
  minifyWhitespace: true,
  minifyIdentifiers: true,
  tsconfig: './tsconfig.json',
  format: ['esm'],
  env: {
    NODE_ENV: 'production',
  },
  loader: {
    '.sql': 'file',
  },
})
