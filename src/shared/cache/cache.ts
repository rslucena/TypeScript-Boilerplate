import { Redis } from 'ioredis'
import connection from './connection'

const client = new Redis(connection)

client.on('error', (err) => console.debug(err))

// const cache: cacheFunctions = {
//   set: async (key: string, value: any, seconds = 0) =>
//     seconds
//       ? client.setex(key, JSON.stringify(value), seconds)
//       : client.set(key, JSON.stringify(value)),
//   get: async (key: string, force = false) => {
//     const value = await client.get(key)
//     if (value) return JSON.parse(value)
//     return null
//   },
//   del: async (key: string) => client.del(key),
// }

export default client
