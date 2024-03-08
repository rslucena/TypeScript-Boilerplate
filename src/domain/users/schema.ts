import { Array, Capitalize, Omit, Partial, Pick, String } from '@sinclair/typebox'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import users from './entity'

const create = createInsertSchema(users, {
  email: () => Capitalize(String({ format: 'email', maxLength: 256 })),
  password: () => String({ minLength: 8, maxLength: 50 }),
})

const select = createSelectSchema(users, {
  email: () => String({ format: 'email' }),
})

const entity = {
  id: Pick(select, ['id']),
  create: Omit(create, ['id']),
  update: Partial(Omit(create, ['id'])),
  find: Partial(Omit(select, ['id', 'password'])),
  response: Array(Omit(select, ['password'])),
}

const auths = {
  create: Pick(select, ['email', 'password']),
}

export default { entity, auths }
