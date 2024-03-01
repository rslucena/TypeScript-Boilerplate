import * as crypto from 'crypto'
import { boolean, int, timestamp } from 'drizzle-orm/mysql-core'

const identifier = {
  id: int('id').autoincrement().primaryKey(),
  activated: boolean('activated').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
  deleteAt: timestamp('delete_at'),
}

function hash(data: string | object) {
  if (typeof data === 'string') {
    const crypt = crypto.createHash('sha1')
    crypt.update(data)
    return crypt.digest('hex').slice(0, 32)
  }
  const crypt = crypto.createHash('sha1')
  crypt.update(JSON.stringify(data))
  return crypt.digest('hex').slice(0, 32)
}

function uuid(): string {
  let dt = new Date().getTime()
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (dt + Math.random() * 16) % 16 | 0
    dt = Math.floor(dt / 16)
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
  return uuid
}

export { hash, identifier, uuid }
