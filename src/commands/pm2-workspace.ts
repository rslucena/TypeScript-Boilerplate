import pm2 from 'pm2'

export interface worker {
  tsx: string
  node: string
  name: string
  activated: boolean
  heartbeat: string
  options: Omit<pm2.StartOptions, 'name' | 'script'>
}

const defaultConfigs: pm2.StartOptions = {
  force: true,
  max_restarts: 5,
  exec_mode: 'fork',
  autorestart: true,
  interpreter: 'node',
  max_memory_restart: '100M',
  ignore_watch: ['node_modules'],
}

export default <worker[]>[
  {
    activated: true,
    name: 'primary/webserver',
    tsx: './src/functions/http-primary-webserver.ts',
    node: './dist/functions/http-primary-webserver.js',
    options: { ...defaultConfigs },
    heartbeat: `${process.env.UPTIME_SERVER}:${process.env.UPTIME_PORT}/api/push/xyVlTFF0j6`,
  },
  {
    activated: true,
    name: 'primary/websocket',
    tsx: './src/functions/udp-primary-websocket.ts',
    node: './dist/functions/udp-primary-websocket.js',
    options: { ...defaultConfigs },
    heartbeat: `${process.env.UPTIME_SERVER}:${process.env.UPTIME_PORT}/api/push/asdasd`,
  },
]
