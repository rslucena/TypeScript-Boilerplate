import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import {
  IndexBuilder,
  PgColumn,
  PgTimestampConfig,
  boolean,
  index,
  uuid as puuid,
  timestamp,
} from 'drizzle-orm/pg-core'
import { array, number, z } from 'zod'
import { refer } from './interface'

const dateSettings: PgTimestampConfig = { mode: 'date', precision: 6 }

const identifier = {
  id: puuid('id').primaryKey().defaultRandom().notNull(),
  activated: boolean('activated').default(true).notNull(),
  createdAt: timestamp('created_at', dateSettings).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', dateSettings),
  deletedAt: timestamp('deleted_at', dateSettings),
}

const zodIdentifier = {
  id: z.string().uuid(),
  activated: z.boolean().default(true),
  createdAt: z.date().or(z.string()).nullable(),
  updatedAt: z.date().or(z.string()).nullable(),
  deletedAt: z.date().or(z.string()).nullable(),
}

const withPagination = z.object({
  'req.page': array(number().min(1)).length(2).default([1, 10]),
})

function pgIndex(table: string, columns: { [key: string]: PgColumn }, keys: string[]) {
  const configs: { [key: string]: IndexBuilder } = {}
  for (const column of keys) configs[column] = index(`${table}_${column}_idx`).on(columns[column])
  configs.activated = index(`${table}_activated_idx`).on(columns['activated'])
  return configs
}

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
    collection += `\{${key.replace('_', '')}:${value}\}`
  return collection.toLowerCase().trim()
}

export { hash, identifier, pgIndex, tag, uuid, withPagination, zodIdentifier }
