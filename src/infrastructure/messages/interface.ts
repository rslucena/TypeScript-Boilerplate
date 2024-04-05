interface actions {
  ping: () => Promise<string>
  sub(topic: string, callback: (snapshot: any, topic?: string) => Promise<void>): Promise<void>
  pub(topic: string, value: any): Promise<void | number>
}

interface eventemitter {
  sub(topic: string, callback: (snapshot: any, topic?: string) => Promise<void>): void
  pub(topic: string, value: any): number
}

interface triggers {
  event: eventemitter
  message: actions
}

export default triggers
