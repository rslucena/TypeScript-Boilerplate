import cache from '@infrastructure/cache/actions'
import { collection } from '@infrastructure/repositories/references'
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
  const cached = await cache.json.get(collection('user/find', { id }))
  if (cached) return cached
  const prepare = repository
    .select(schema.entity.columns)
    .from(user)
    .where(eq(user.id, sql.placeholder('id')))
    .limit(1)
    .orderBy(desc(user.id))
    .prepare('user/findById')
  const content = await prepare.execute({ id })
  if (!content.length) throw request.notFound(`/user/${id}`)
  await cache.json.set(collection('user/find', { id }), content, 60 * 10)
  request.status(200)
  return content
}
