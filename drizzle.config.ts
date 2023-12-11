import type { Config } from 'drizzle-kit'
import connection from './src/shared/repositories/connection'

export default {
  schema: './src/shared/schemas/*',
  out: './src/shared/migrations',
  driver: 'mysql2',
  dbCredentials: connection,
} satisfies Config
