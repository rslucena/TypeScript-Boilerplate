import { existsSync, mkdirSync, writeFileSync } from 'fs'
import * as path from 'path'
import pino from 'pino'
import actions from './interfaces'

const bindings = (bindings: any) => ({ ...bindings, node_version: process.versions.node })

const configs = {
  level: process.env.LOG_LEVEL ?? 'info',
  redact: ['headers.authorization'],
  enabled: process.env.SHOW_LOG === 'true',
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  formatters: { bindings },
}

const folder = `${path.resolve('.')}/temp/`
existsSync(folder) ? undefined : mkdirSync(folder)

const handler = (filename: string) => {
  const file = existsSync(`${folder}/${filename}.log`)
  if (!file) writeFileSync(`${folder}/${filename}.log`, '')
  return pino({
    ...configs,
    ...{
      transport: {
        target: 'pino/file',
        options: { destination: `${folder}/${filename}.log` },
      },
    },
  })
}

const terminal: actions['console'] = {
  error: (message, props) => console.debug(message, props),
  warn: (message, props) => console.debug(message, props),
  info: (props) => console.debug(props),
  debug: (props) => console.debug(props),
}

export const Logs: actions = {
  console: terminal,
  handler,
}

export default Logs
