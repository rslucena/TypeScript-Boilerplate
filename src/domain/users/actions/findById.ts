import cache from '@infrastructure/cache/actions'
import { hash } from '@infrastructure/repositories/references'
import repository from '@infrastructure/repositories/repository'
import { container } from '@infrastructure/server/request'
import { Static } from '@sinclair/typebox'
import { desc, eq, sql } from 'drizzle-orm'
import user from '../entity'
import { default as schema } from '../schema'

export default async function findById(
  request: container
): Promise<Static<typeof schema.entity.response>> {
  const { id } = request.params<Static<typeof schema.entity.id>>()
  const cached = await cache.json.get(hash(`user:findById:${id}`))
  if (cached) return cached
  const prepare = repository
    .select()
    .from(user)
    .where(eq(user.id, sql.placeholder('id')))
    .limit(1)
    .orderBy(desc(user.id))
    .prepare()
  const content = await prepare.execute({ id })
  if (!content.length) throw request.notFound('User:Id')
  await cache.json.set(hash(`user:findById:${id}`), content, 60 * 60 * 24)
  request.status(200)
  return content
}
