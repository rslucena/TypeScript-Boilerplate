import { int, timestamp } from 'drizzle-orm/mysql-core'
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2'
import connection from './connection'

const reffer = {
  id: int('id').primaryKey().autoincrement(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
  deleteAt: timestamp('delete_at'),
}

export default drizzle(mysql.createConnection(connection))

export { reffer }
