import { withPagination, zodIdentifier } from '@infrastructure/repositories/references'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { array, boolean, object, string } from 'zod'
import { default as users } from './entity'
import { headers } from '@infrastructure/server/interface'

const create = createInsertSchema(users, {
  name: () => string().min(1).max(50),
  email: () => string().email().min(1).max(400),
  lastName: () => string().min(1).max(100),
  password: () => string().min(8).max(50),
  activated: () => boolean().default(true),
})

const select = createSelectSchema(users, {
  email: () => string().email(),
  ...zodIdentifier,
}).partial()

const auth = object({
  token: string(),
  refresh: string(),
})

const actions = {
  headers,
  id: select.pick({ id: true }),
  read: select.omit({ id: true, password: true }).merge(withPagination),
  create: {
    entity: create.omit({ id: true }),
    auth: create.pick({ email: true, password: true }),
  },
  update: create.omit({ id: true }).partial(),
  delete: create.pick({ id: true }),
}

const entity = array(select.omit({ password: true }))

export default { actions, entity, auth }
