import cache from '@infrastructure/cache/actions'
import { hash, tag } from '@infrastructure/repositories/references'
import repository from '@infrastructure/repositories/repository'
import { container } from '@infrastructure/server/request'
import user from '../entity'
import { default as schema } from '../schema'
import GetById from './GetById'

export default async function PostNewEntity(request: container) {
  request.status(201)

  const validRequest = await schema.actions.create.entity.safeParseAsync(request.body())
  if (!validRequest.success) throw request.badRequest('post/user/{params}')

  const content = await repository
    .insert(user)
    .values({
      ...validRequest.data,
      password: hash(validRequest.data.password),
    })
    .onConflictDoNothing()
    .returning()

  if (!content.length) throw request.unprocessableEntity(`post/user/${validRequest.data.email}`)

  await cache.json.del(tag('user', 'find*'))

  return GetById(new container({ params: { id: content[0].id } }))
}
