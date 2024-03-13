import { hash } from '@infrastructure/repositories/references'
import repository from '@infrastructure/repositories/repository'
import { container } from '@infrastructure/server/request'
import { Static } from '@sinclair/typebox'
import user from '../entity'
import { default as schema } from '../schema'
import findById from './findById'

export default async function createUser(request: container) {
  const params = request.body<Static<typeof schema.entity.create>>()
  const content = await repository
    .insert(user)
    .values({
      ...params,
      password: hash(params.password),
    })
    .onConflictDoNothing()
    .returning()
  if (!content.length) throw request.unprocessableEntity('User:Id')
  request.status(201)
  return findById(new container({ params: { id: content[0].id } }))
}
