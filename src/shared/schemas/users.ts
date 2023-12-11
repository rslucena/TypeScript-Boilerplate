import { int, mysqlTable, text } from 'drizzle-orm/mysql-core'
import { reffer } from '../repositories/repository'

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  name: text('name'),
  ...reffer,
})
