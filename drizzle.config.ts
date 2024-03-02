import type { Config } from 'drizzle-kit'
import connection from './src/infrastructure/repositories/connection'

export default {
  schema: './src/infrastructure/schemas/*',
  out: './src/infrastructure/migrations',
  driver: 'mysql2',
  dbCredentials: connection,
  strict: true,
  verbose: true,
} satisfies Config
