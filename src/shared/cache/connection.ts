const connection = {
  port: Number(process.env.REDIS_PORT),
  host: String(process.env.REDIS_SERVER),
  username: String(process.env.REDIS_USER),
  connectionName: Boolean(process.env.REDIS_SSL) ? 'rediss' : 'default',
  password: String(process.env.REDIS_PASS),
}

export default connection
