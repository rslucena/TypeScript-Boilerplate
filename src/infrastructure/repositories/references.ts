import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import { PgTimestampConfig, boolean, uuid as puuid, timestamp } from 'drizzle-orm/pg-core'
import { z } from 'zod'
import { refer } from './interface'

const dateSettings: PgTimestampConfig = { mode: 'date', precision: 6 }

const identifier = {
  id: puuid('id').primaryKey().defaultRandom().unique().notNull(),
  activated: boolean('activated').default(true).notNull(),
  createdAt: timestamp('created_at', dateSettings).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', dateSettings),
  deletedAt: timestamp('deleted_at', dateSettings),
}

const zodIdentifier = {
  id: z.string(),
  activated: z.boolean(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()).nullable(),
  deletedAt: z.date().or(z.string()).nullable(),
}

const withPagination = z.object({
  _page: z.number().min(1).default(1),
  _pageSize: z.number().min(1).max(15).default(15),
})

function hash(data: string | object, compare?: string) {
  if (typeof data !== 'string') data = JSON.stringify(data)
  if (compare) return bcrypt.compareSync(data, compare) ? 'OK' : ''
  return bcrypt.hashSync(data, 10)
}

function uuid(): string {
  return crypto.randomUUID()
}

function tag(
  domain: refer['domain'],
  method: refer['method'],
  conditions?: refer['conditions']
): string {
  let collection = `${domain}/${method}`
  if (!conditions) return collection.toLowerCase().trim()
  collection += '/'
  for (const [key, value] of Object.entries(conditions))
    collection += `[${key.replace('_', '')}:${value}]`
  return collection.toLowerCase().trim()
}

export { hash, identifier, tag, uuid, withPagination, zodIdentifier }
