import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), 'VITE_') }
  Object.entries(process.env).forEach(([key, value]) => {
    const reff = key.replace(/^VITE_/, '')
    if (!value) delete process.env[key]
    if (!key.startsWith('VITE_')) delete process.env[key]
    process.env[reff] = value
  })
  return defineConfig({
    test: {
      globals: false,
      environment: 'node',
      exclude: ['node_modules/**', '.docker/**', '.git/**', '.github/**', '.vscode/**', 'dist/**'],
    },
    define: {
      'process.env': process.env,
    },
    resolve: {
      alias: [
        {
          find: '@domain',
          replacement: resolve(__dirname, './src/domain'),
        },
        {
          find: '@infrastructure',
          replacement: resolve(__dirname, './src/shared'),
        },
        {
          find: '@tests',
          replacement: resolve(__dirname, './src/tests'),
        },
      ],
    },
  })
}
