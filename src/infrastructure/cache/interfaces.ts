export interface functions {
  set: (hash: string, vals: any, ttl?: number, key?: string) => Promise<string | null>
  get: <t>(hash: string, force?: boolean) => Promise<t | null>
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
