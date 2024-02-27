import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import pino from 'pino'
import { fileURLToPath } from 'url'
import references from './references'

const folder = `${join(dirname(fileURLToPath(import.meta.url)), '..')}/temp/logs/`

existsSync(folder) ? undefined : mkdirSync(folder)
existsSync(folder) ? undefined : writeFileSync(`${folder}/webserver.log`, '')

export const loghandler = pino({
  level: process.env.LOG_LEVEL,
  redact: ['headers.authorization'],
  enabled: process.env.SHOW_LOG === 'true',
  timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
  formatters: {
    bindings: (bindings) => {
      return { ...bindings, node_version: process.versions.node }
    },
  },
  transport: {
    target: 'pino/file',
    options: { destination: `${folder}/webserver.log` },
  },
})

const files: references['file'] = {
  error: (message, props, exit) => {
    loghandler.error(props, message)
    if (exit) process.emit('SIGTERM')
  },
  warn: (props, message?) => loghandler.warn(props, message),
  info: (props) => loghandler.info(props),
  debug: (props, exit?) => {
    loghandler.debug(props)
    if (exit) process.emit('SIGTERM')
  },
}

const console: references['console'] = {
  error: (message, props, exit) => console.debug({ message, props }, exit),
  warn: (props, message?) => console.debug({ ...props, message }, false),
  info: (props) => console.debug(props, false),
  debug: (props, exit?) => {
    console.debug(props)
    if (exit) process.emit('SIGTERM')
  },
}

export const Logs: references = {
  file: files,
  console: console,
}

export default Logs
