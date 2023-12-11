import { defineConfig } from 'tsup'

export default defineConfig({
  outDir: 'dist',
  entry: ['src'],
  dts: true,
  clean: true,
  sourcemap: true,
  bundle: true,
  watch: true,
  minify: true,
  tsconfig: './tsconfig.json',
  minifyWhitespace: true,
  minifyIdentifiers: true,
  minifySyntax: true,
})
