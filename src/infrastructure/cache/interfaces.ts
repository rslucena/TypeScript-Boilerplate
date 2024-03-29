export interface functions {
  set: (hash: string, vals: any, ttl?: number, key?: string) => Promise<string | null>
  get: (hash: string, Force?: boolean) => Promise<any | null>
  del: (hash: string) => Promise<number>
}

export interface setmode {
  type: 'json' | 'text'
  hash: string
  vals: any
  ttl?: number
  key?: string
}

export interface actions {
  text: functions
  json: functions
  ping: () => Promise<string>
}
