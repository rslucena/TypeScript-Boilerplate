import { identifier } from '@shared/repositories/references'
import { mysqlTable, text } from 'drizzle-orm/mysql-core'

const entity = mysqlTable('users', {
  name: text('name').notNull().unique(),
  ...identifier,
})

export { entity }
