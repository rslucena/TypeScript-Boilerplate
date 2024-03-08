import { Type } from '@sinclair/typebox'
import * as bcrypt from 'bcrypt'
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

function hash(data: string | object, compare?: string) {
  if (typeof data !== 'string') data = JSON.stringify(data)
  if (compare) return bcrypt.compareSync(data, compare) ? 'OK' : ''
  return bcrypt.hashSync(data, 10)
}

function uuid(): string {
  return crypto.randomUUID()
}

export { hash, identifier, typeBoxIdentifier, uuid, withPagination }
