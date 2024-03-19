import type { Config } from 'drizzle-kit'
import connection from './src/infrastructure/repositories/connection'

export default {
  schema: './src/domain/**/entity.ts',
  out: './src/infrastructure/migrations',
  driver: 'pg',
  dbCredentials: {
    database: connection.database,
    host: connection.host,
    port: connection.port,
    password: connection.password,
    user: connection.username,
  },
  strict: true,
  verbose: true,
} satisfies Config
