import Logs from '@infrastructure/logs/handler'
import { DefaultLogger } from 'drizzle-orm'
import { MySqlSelect } from 'drizzle-orm/mysql-core'
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2'
import connection from './connection'

export function queryPagination<T extends MySqlSelect>(qb: T, page: number, pageSize: number = 10) {
  return qb.limit(pageSize).offset(page * pageSize)
}

export default drizzle(mysql.createConnection(connection), {
  logger: new DefaultLogger({ writer: { write: (message) => Logs.file.info(message) } }),
})
