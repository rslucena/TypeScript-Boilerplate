import { hash } from '@infrastructure/repositories/references'
import repository from '@infrastructure/repositories/repository'
import { authentication, container } from '@infrastructure/server/request'
import { desc, eq, sql } from 'drizzle-orm'
import user from '../entity'
import { default as schema } from '../schema'

export default async function PostNewAuth(request: container) {
  request.status(201)

  const validRequest = await schema.actions.create.auth.safeParseAsync(request.body())
  if (!validRequest.success) throw request.badRequest('post/user/auth/{params}')

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
    .prepare('post/user/auth')

  const content = await prepare.execute(validRequest.data)

  if (!content.length)
    throw request.unprocessableEntity(`post/user/auth/${validRequest.data.email}`)

  if (!hash(validRequest.data.password, content[0].password))
    throw request.notFound(`post/user/auth/${validRequest.data.email}`)

  request.headers({ authorization: `Bearer ${hash(content[0].email)}` })

  return {
    token: new authentication().create({
      id: content[0].id,
      email: content[0].email,
    }),
    refresh: hash(content[0].password),
  }
}
