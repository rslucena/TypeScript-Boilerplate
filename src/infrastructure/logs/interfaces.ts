import { Logger } from 'pino'

export default interface actions {
  console: methods
  handler: (filename: string) => Logger<never, boolean>
}

interface methods {
  error: (message: string, props?: any) => void
  warn: (message: string, props?: any) => void
  info: (props: any) => void
  debug: (props: any) => void
}
