import { int, timestamp } from 'drizzle-orm/mysql-core'

const identifier = {
  id: int('id').primaryKey().autoincrement(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
  deleteAt: timestamp('delete_at'),
}

export { identifier }
