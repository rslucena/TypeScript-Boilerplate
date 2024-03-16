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
    .select({
      id: user.id,
      email: user.email,
      password: user.password,
    })
    .from(user)
    .where(eq(user.email, sql.placeholder('email')))
    .limit(1)
    .orderBy(desc(user.id))
    .prepare('/user/auth')
  const content = await prepare.execute({ email })
  if (!content.length) throw request.notFound(`/user/auth/${email}`)
  if (!hash(password, content[0].password)) throw request.badRequest(`/user/auth/${email}`)
  request.status(201)
  request.headers({ authorization: `Bearer ${hash(content[0].email)}` })
  return {
    token: hash(content[0].email),
    refresh: hash(content[0].password),
  }
}
