export interface functions {
  set: (key: string, vals: any, ttl?: number) => Promise<string | null>
  get: (Key: string, Force?: boolean) => Promise<any | null>
  del: (key: string) => Promise<number>
}

export interface actions {
  text: functions
  json: functions
}
