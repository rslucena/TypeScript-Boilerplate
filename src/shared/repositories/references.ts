import * as crypto from 'crypto'
import { int, timestamp } from 'drizzle-orm/mysql-core'

const identifier = {
  id: int('id').primaryKey().autoincrement(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
  deleteAt: timestamp('delete_at'),
}

function uuid(data: string | object) {
  if (typeof data === 'string') {
    const hash = crypto.createHash('sha1')
    hash.update(data)
    return hash.digest('hex').slice(0, 32)
  }
  const hash = crypto.createHash('sha1')
  hash.update(JSON.stringify(data))
  return hash.digest('hex').slice(0, 32)
}

export { identifier, uuid }
