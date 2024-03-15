import Logs from '@infrastructure/logs/handler'
import { DefaultLogger } from 'drizzle-orm'
import { PgSelect } from 'drizzle-orm/pg-core'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import connection from './connection'

export function withPagination<T extends PgSelect>(qb: T, page: number, pageSize: number = 10) {
  return qb.limit(1 * pageSize).offset(page * pageSize)
}

const Pool = postgres({
  ...connection,
  idle_timeout: 10,
  max_lifetime: 60 * 30,
  max: Number(process.env.POSTGRES_POOL),
})

const manager = drizzle(Pool, {
  logger: new DefaultLogger({ writer: { write: (message) => Logs.file.info(message) } }),
})

// const repository = {
//   get: (table: PgTable) => manager.select().from(table),
//   update: () => manager.update,
//   insert: () => manager.insert,
//   delete: () => manager.delete,
//   page: withPagination,
//   manager,
// }

// manager

export default manager
