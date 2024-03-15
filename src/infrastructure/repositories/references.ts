import { Type } from '@sinclair/typebox'
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import { boolean, serial, timestamp } from 'drizzle-orm/pg-core'
import typeEvents from './interface'

const identifier = {
  id: serial('id').primaryKey().unique().notNull(),
  activated: boolean('activated').default(true).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }),
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
  page: Type.Number({ default: 1, minimum: 1 }),
  pageSize: Type.Number({ default: 1, minimum: 1, maximum: 15 }),
})

function hash(data: string | object, compare?: string) {
  if (typeof data !== 'string') data = JSON.stringify(data)
  if (compare) return bcrypt.compareSync(data, compare) ? 'OK' : ''
  return bcrypt.hashSync(data, 10)
}

function uuid(): string {
  return crypto.randomUUID()
}

function collection(
  domain: string,
  conditions: { [key: string]: any } = {},
  action: typeEvents = 'value'
): string {
  let collection = `${action}/${domain}/`
  for (const [key, value] of Object.entries(conditions)) collection += `${key}:${value}/`
  return collection.toLowerCase().trim()
}

export { collection, hash, identifier, typeBoxIdentifier, uuid, withPagination }
