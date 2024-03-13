import cache from '@infrastructure/cache/actions'
import { collection } from '@infrastructure/repositories/references'
import repository, { withPagination } from '@infrastructure/repositories/repository'
import { container } from '@infrastructure/server/request'
import { Static } from '@sinclair/typebox'
import { desc, eq, like, or, sql } from 'drizzle-orm'
import user from '../entity'
import { default as schema } from '../schema'

export default async function find(
  request: container
): Promise<Static<typeof schema.entity.response>> {
  request.status(200)
  const params = request.query<Static<typeof schema.entity.find>>()
  const cached = await cache.json.get(collection('user/find', params))
  if (cached) return cached
  const prepare = repository
    .select()
    .from(user)
    .where(
      or(
        params.name ? like(user.name, sql.placeholder('name')) : undefined,
        params.lastName ? like(user.lastName, sql.placeholder('lastName')) : undefined,
        params.email ? like(user.email, sql.placeholder('email')) : undefined,
        params.activated ? eq(user.activated, sql.placeholder('activated')) : undefined,
        params.createdAt ? like(user.createdAt, sql.placeholder('createdAt')) : undefined,
        params.updatedAt ? like(user.updatedAt, sql.placeholder('updatedAt')) : undefined,
        params.deleteAt ? like(user.deleteAt, sql.placeholder('deleteAt')) : undefined
      )
    )
    .orderBy(desc(user.id))
    .$dynamic()
  withPagination(prepare, params.page, params.pageSize)
  const content = await prepare.execute(params)
  if (!content.length) throw request.notFound('User:Find')
  cache.json.set(collection('user/find', params), content)
  return content
}
