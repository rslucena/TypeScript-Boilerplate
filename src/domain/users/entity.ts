import { dbschema, identifier } from '@infrastructure/repositories/references'
import { varchar } from 'drizzle-orm/mysql-core'

const columns = {
  name: varchar('name', { length: 50 }).notNull(),
  lastName: varchar('lastName', { length: 100 }),
  email: varchar('email', { length: 256 }).unique().notNull(),
  password: varchar('password', { length: 100 }).notNull(),
}

const user = dbschema.table('user', { ...columns, ...identifier })

export default user
