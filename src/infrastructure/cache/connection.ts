import Logs from '@infrastructure/logs/handler'
import { RedisClientOptions, createClient } from 'redis'

const connection: RedisClientOptions = {
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    servername: process.env.REDIS_SSL != 'false' ? 'rediss' : 'redis',
    host: process.env.REDIS_SERVER,
    port: Number(process.env.REDIS_PORT),
  },
}

const client = createClient(connection)
client.on('error', (err) => Logs.console.error('Redis Client Error', err, true))

await client.connect()

export default client
