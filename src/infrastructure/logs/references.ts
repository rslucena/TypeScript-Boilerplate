export default interface references {
  console: actions
  file: actions
}

interface actions {
  error: (message: string, props: Error | any, exit?: boolean) => void
  warn: (props: any, message?: string) => void
  info: (props: any) => void
  debug: (props: any, exit?: boolean) => void
}
