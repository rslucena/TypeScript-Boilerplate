import { hash } from '@infrastructure/repositories/references'
import repository from '@infrastructure/repositories/repository'
import { container } from '@infrastructure/server/request'
import { Static } from '@sinclair/typebox'
import { desc, eq, sql } from 'drizzle-orm'
import user from '../entity'
import { default as schema } from '../schema'

export default async function createAuth(request: container) {
  const { email, password } = request.body<Static<typeof schema.auths.create>>()
  const prepare = repository
    .select()
    .from(user)
    .where(eq(user.email, sql.placeholder('email')))
    .limit(1)
    .orderBy(desc(user.id))
    .prepare('createAuth')
  const content = await prepare.execute({ email })
  if (!content.length) throw request.notFound('User:Auth')
  if (!hash(password, content[0].password)) throw request.notFound('User:Auth')
  request.status(201)
  request.headers({ authorization: `Bearer ${hash(content[0])}` })
  return
}
