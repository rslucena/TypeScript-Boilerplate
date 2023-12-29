export interface cacheFunctions {
  set: (Key: string, Value: any, Seconds?: number) => Promise<'OK'>
  get: (Key: string, Force?: boolean) => Promise<any | null>
  del: (key: string) => Promise<number>
}
