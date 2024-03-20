import cache from '@infrastructure/cache/actions'
import { collection } from '@infrastructure/repositories/references'
import repository from '@infrastructure/repositories/repository'
import { container } from '@infrastructure/server/request'
import { desc, eq, sql } from 'drizzle-orm'
import user from '../entity'
import { default as schema } from '../schema'

export default async function GetById(request: container) {
  request.status(200)

  const validRequest = await schema.actions.id.safeParseAsync(request.params())
  if (!validRequest.success) throw request.badRequest(`get/user/{id}`)

  const { id } = validRequest.data

  const cached = await cache.json.get(collection('get/user/{id}', { id }))
  if (cached) return cached

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
    .where(eq(user.id, sql.placeholder('id')))
    .limit(1)
    .orderBy(desc(user.id))
    .prepare('/user/id')

  const content = await prepare.execute({ id })

  if (!content.length) throw request.notFound(`get/user/${id}`)

  await cache.json.set(collection('get/user/{id}', { id }), content, 60 * 10)

  return content
}
