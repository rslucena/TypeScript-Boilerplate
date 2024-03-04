import { Logger } from 'pino'

export default interface actions {
  console: methods
  file: methods
  provider: Logger<never>
}

interface methods {
  error: (message: string, props: Error | any, exit?: boolean) => void
  warn: (props: any, message?: string) => void
  info: (props: any) => void
  debug: (props: any, exit?: boolean) => void
}
