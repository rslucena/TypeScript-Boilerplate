import Logs from '@infrastructure/logs/handler'
import { DefaultLogger } from 'drizzle-orm'
import { PgSelect } from 'drizzle-orm/pg-core'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import connection from './connection'

export function withPagination<T extends PgSelect>(qb: T, page: number, pageSize: number = 10) {
  return qb.limit(1 * pageSize).offset(page * pageSize)
}

const primaryDb = postgres({
  ...connection,
  idle_timeout: 5,
  max_lifetime: 60,
  max: Number(process.env.POSTGRES_POOL),
})

const manager = drizzle(primaryDb, {
  logger: new DefaultLogger({ writer: { write: (message) => Logs.file.info(message) } }),
})

export default manager
