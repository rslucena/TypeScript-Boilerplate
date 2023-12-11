import { mysqlTable, text } from 'drizzle-orm/mysql-core'
import { reffer } from '../repositories/repository'

export const users = mysqlTable('users', {
  name: text('name'),
  ...reffer,
})
