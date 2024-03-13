import request from '@infrastructure/server/request'
import { FastifyInstance } from 'fastify'
import createAuth from './actions/createAuth'
import createUser from './actions/createUser'
import find from './actions/find'
import findById from './actions/findById'
import schema from './schema'

export default async function users(api: FastifyInstance) {
  api.get('/ping/users', (_, reply) => reply.code(200).send())
  api.get(
    '/users/:id',
    {
      schema: {
        params: schema.entity.id,
        response: { 200: schema.entity.response },
      },
    },
    request.restricted(findById)
  )
  api.get(
    '/users',
    {
      schema: {
        params: schema.entity.find,
        response: { 200: schema.entity.response },
      },
    },
    request.restricted(find)
  )
  api.post(
    '/users/auth',
    { schema: { body: schema.auths.create } },
    request.noRestricted(createAuth)
  )
  api.post(
    '/users',
    {
      schema: {
        body: schema.entity.create,
        response: { 201: schema.entity.response },
      },
    },
    request.noRestricted(createUser)
  )
}
