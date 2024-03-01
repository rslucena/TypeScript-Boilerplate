interface actions {
  ping: () => Promise<string>
  sub(topic: string, callback: (snapshot: any, topic?: string) => Promise<void>): Promise<void>
  pub(topic: string, value: any): Promise<void | number>
}

interface messages {
  redis: actions
}

export default messages
