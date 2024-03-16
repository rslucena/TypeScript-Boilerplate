import { withPagination } from '@infrastructure/repositories/references'
import { Array, Intersect, Object, Omit, Partial, Pick, String } from '@sinclair/typebox'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { default as user, default as users } from './entity'

const create = createInsertSchema(users, {
  name: () => String({ minLength: 1, maxLength: 50 }),
  lastName: () => String({ minLength: 1, maxLength: 100 }),
  email: () => String({ format: 'email', maxLength: 256 }),
  password: () => String({ minLength: 8, maxLength: 50 }),
})

const select = createSelectSchema(users, {
  email: () => String({ format: 'email' }),
})

const entity = {
  id: Pick(select, ['id']),
  create: Omit(create, ['id']),
  update: Partial(Omit(create, ['id'])),
  find: Omit(Intersect([Partial(select), withPagination]), ['id', 'password']),
  response: Array(Omit(select, ['password'])),
  columns: {
    id: user.id,
    email: user.email,
    password: user.password,
    name: user.name,
    activated: user.activated,
    lastName: user.lastName,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deleteAt: user.deleteAt,
  },
}

const auths = {
  response: Object({
    token: String(),
    refresh: String(),
  }),
  create: Pick(create, ['email', 'password']),
}

export default { entity, auths }
