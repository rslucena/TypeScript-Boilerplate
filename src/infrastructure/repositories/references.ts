import { Type } from '@sinclair/typebox'
import * as crypto from 'crypto'
import { boolean, int, mysqlSchema, timestamp } from 'drizzle-orm/mysql-core'

export const dbschema = mysqlSchema(process.env.NODE_ENV === 'production' ? 'main' : 'shadow')

const identifier = {
  id: int('id').autoincrement().primaryKey(),
  activated: boolean('activated').default(true).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).onUpdateNow(),
  deleteAt: timestamp('delete_at', { mode: 'string' }),
}

const typeBoxIdentifier = Type.Object({
  id: Type.Integer(),
  activated: Type.Boolean(),
  createdAt: Type.Optional(Type.Number()),
  updatedAt: Type.Optional(Type.Number()),
  deleteAt: Type.Optional(Type.Number()),
})

const withPagination = Type.Object({
  page: Type.Integer({ default: 0, minimum: 0 }),
  pageSize: Type.Integer({ default: 10, minimum: 1, maximum: 15 }),
})

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
  const bytes = crypto.randomBytes(16)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const parts = [
    bytes.readUInt32BE(0).toString(16).padStart(8, '0'),
    bytes.readUInt16BE(4).toString(16).padStart(4, '0'),
    bytes.readUInt16BE(6).toString(16).padStart(4, '0'),
    bytes.readUInt16BE(8).toString(16).padStart(4, '0'),
    bytes.readUInt32BE(10).toString(16).padStart(8, '0'),
  ]
  return parts.join('-')
}

export { hash, identifier, typeBoxIdentifier, uuid, withPagination }
