import cache from '@infrastructure/cache/actions'
import { collection } from '@infrastructure/repositories/references'
import repository, { withPagination } from '@infrastructure/repositories/repository'
import { container } from '@infrastructure/server/request'
import { desc, eq, ilike, or, sql } from 'drizzle-orm'
import user from '../entity'
import { default as schema } from '../schema'

export default async function GetFindByParams(request: container) {
  request.status(200)

  const validRequest = await schema.actions.read.safeParseAsync(request.query())
  if (!validRequest.success) throw request.badRequest('get/user/{params}')

  const cached = await cache.json.get(collection('get/user/{params}', validRequest))
  if (cached) return cached

  let { _page, _size, name, lastName, email, activated } = validRequest.data

  if (name) name = `%${name}%`
  if (lastName) lastName = `%${lastName}%`
  if (email) email = `%${email}%`

  const prepare = repository
    .select({
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      activated: user.activated,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    })
    .from(user)
    .where(
      or(
        name ? ilike(user.name, sql.placeholder('name')) : undefined,
        lastName ? ilike(user.lastName, sql.placeholder('lastName')) : undefined,
        email ? ilike(user.email, sql.placeholder('email')) : undefined,
        activated ? eq(user.activated, sql.placeholder('activated')) : undefined
      )
    )
    .orderBy(desc(user.id))
    .$dynamic()

  withPagination(prepare, _page, _size)

  const content = await prepare.execute(validRequest.data)

  if (!content.length) throw request.notFound('get/user/{params}')

  cache.json.set(collection('get/user/{params}', validRequest.data), content, 60 * 1)

  return content
}
