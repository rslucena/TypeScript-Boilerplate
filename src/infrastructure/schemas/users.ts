import { identifier } from '@infrastructure/repositories/references'
import { mysqlTable, varchar } from 'drizzle-orm/mysql-core'

const columns = {
  name: varchar('name', { length: 50 }).notNull(),
  lastName: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 256 }).unique().notNull(),
}

const Users = mysqlTable('users', { ...columns, ...identifier })

export { Users }
