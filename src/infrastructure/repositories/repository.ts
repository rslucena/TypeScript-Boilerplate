import Logs from '@infrastructure/logs/handler'
import { DefaultLogger } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import connection from './connection'
import { PgSelect } from 'drizzle-orm/pg-core'

export function withPagination<T extends PgSelect>(qb: T, page: number, pageSize: number = 10) {
  return qb.limit(1 * pageSize).offset(page * pageSize)
}

const manager = drizzle(postgres(connection), {
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
