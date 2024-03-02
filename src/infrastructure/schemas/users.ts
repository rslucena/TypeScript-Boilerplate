import { identifier } from '@infrastructure/repositories/references'
import { mysqlTable, varchar } from 'drizzle-orm/mysql-core'

const columns = {
  name: varchar('name', { length: 50 }).notNull(),
  lastName: varchar('lastName', { length: 100 }),
  email: varchar('email', { length: 256 }).unique().notNull(),
}

const Users = mysqlTable('users', { ...columns, ...identifier })

export { Users }
