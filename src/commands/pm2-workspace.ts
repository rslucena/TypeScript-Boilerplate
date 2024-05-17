import pm2 from 'pm2'

export interface worker {
  tsx: string
  node: string
  name: string
  activated: boolean
  options: Omit<pm2.StartOptions, 'name' | 'script'>
}

const defaultConfigs: pm2.StartOptions = {
  force: true,
  max_restarts: 5,
  exec_mode: 'fork',
  autorestart: true,
  max_memory_restart: '100M',
  ignore_watch: ['node_modules'],
}

export default <worker[]>[
  {
    activated: true,
    name: 'http:primary:webserver',
    tsx: './src/providers/http-webserver.ts',
    node: './dist/providers/http-webserver.js',
    options: { ...defaultConfigs },
  },
]
