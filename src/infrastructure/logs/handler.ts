import { existsSync, mkdirSync, writeFileSync } from 'fs'
import * as path from 'path'
import pino from 'pino'
import actions from './interfaces'

const folder = `${path.resolve('./src')}/temp/logs/`
existsSync(folder) ? undefined : mkdirSync(folder)
existsSync(folder) ? undefined : writeFileSync(`${folder}/webserver.log`, '')

export const handler = pino({
  level: process.env.LOG_LEVEL,
  redact: ['headers.authorization'],
  enabled: process.env.SHOW_LOG === 'true',
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  formatters: {
    bindings: (bindings) => ({ ...bindings, node_version: process.versions.node }),
  },
  transport: {
    target: 'pino/file',
    options: { destination: `${folder}/webserver.log` },
  },
})

const files: actions['file'] = {
  error: (message, props, exit) => {
    handler.error(props, message)
    if (exit) process.emit('SIGTERM')
  },
  warn: (props, message?) => handler.warn(props, message),
  info: (props) => handler.info(props),
  debug: (props, exit?) => {
    handler.debug(props)
    if (exit) process.emit('SIGTERM')
  },
}

const terminal: actions['console'] = {
  error: (message, props, exit) => {
    console.debug({ message, props })
    if (exit) process.emit('SIGTERM')
  },
  warn: (props, message?) => console.debug({ ...props, message }),
  info: (props) => console.debug(props),
  debug: (props, exit?) => {
    console.debug(props)
    if (exit) process.emit('SIGTERM')
  },
}

export const Logs: actions = {
  file: files,
  console: terminal,
  provider: handler,
}

export default Logs
