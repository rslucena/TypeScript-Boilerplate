import cache from '@infrastructure/cache/actions'
import { tag } from '@infrastructure/repositories/references'
import repository, { withPagination } from '@infrastructure/repositories/repository'
import { container } from '@infrastructure/server/request'
import { and, desc, eq, getTableColumns, ilike, sql } from 'drizzle-orm'
import user from '../entity'
import { default as schema } from '../schema'

export default async function getFindByParams(request: container) {
  request.status(200)

  const validRequest = await schema.actions.read.safeParseAsync(request.query())
  if (!validRequest.success) throw request.badRequest(tag('user', 'find{params}'))

  const { data } = validRequest
  const reference = tag('user', 'find{params}', data)

  const cached = await cache.json.get<user[]>(reference)
  if (cached) return cached

  if (data.name) data.name = `%${data.name}%`
  if (data.lastName) data.lastName = `%${data.lastName}%`
  if (data.email) data.email = `%${data.email}%`
  if (data.createdAt) data.createdAt = `${data.createdAt}%`
  if (data.deletedAt) data.deletedAt = `${data.deletedAt}%`
  if (data.updatedAt) data.updatedAt = `${data.updatedAt}%`

  const { password, ...outhers } = getTableColumns(user)

  const prepare = repository
    .select({ ...outhers })
    .from(user)
    .where(
      and(
        data.name ? ilike(user.name, sql.placeholder('name')) : undefined,
        data.lastName ? ilike(user.lastName, sql.placeholder('lastName')) : undefined,
        data.email ? ilike(user.email, sql.placeholder('email')) : undefined,
        data.createdAt ? ilike(user.email, sql.placeholder('createdAt')) : undefined,
        data.updatedAt ? ilike(user.email, sql.placeholder('updatedAt')) : undefined,
        data.deletedAt ? ilike(user.email, sql.placeholder('deletedAt')) : undefined,
        data.activated !== undefined ? eq(user.activated, sql.placeholder('activated')) : undefined
      )
    )
    .orderBy(desc(user.id))
    .$dynamic()

  withPagination(prepare, data._page, data._pageSize)

  const content = await prepare.execute(validRequest.data)

  if (!content.length) throw request.notFound(tag('user', 'find{params}'))

  cache.json.set(reference, content, 60 * 1)

  return content
}
