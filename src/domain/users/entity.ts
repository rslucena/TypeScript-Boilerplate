import { identifier } from '@infrastructure/repositories/references'
import { pgTable, varchar } from 'drizzle-orm/pg-core'

const columns = {
  name: varchar('name', { length: 50 }).notNull(),
  lastName: varchar('lastName', { length: 100 }),
  email: varchar('email', { length: 400 }).unique().notNull(),
  password: varchar('password', { length: 100 }).notNull(),
}

const user = pgTable('user', { ...columns, ...identifier })

export default user
