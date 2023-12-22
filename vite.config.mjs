/// <reference types="vitest" />
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    exclude: ['node_modules/**', '.docker/**', '.git/**', '.github/**', '.vscode/**', 'dist/**'],
  },
  resolve: {
    alias: [
      {
        find: '@domain',
        replacement: resolve(__dirname, './src/domain'),
      },
      {
        find: '@shared',
        replacement: resolve(__dirname, './src/shared'),
      },
      {
        find: '@tests',
        replacement: resolve(__dirname, './src/tests'),
      },
    ],
  },
})
