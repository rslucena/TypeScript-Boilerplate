import request from '@infrastructure/server/request'
import { FastifyInstance } from 'fastify'
import createAuth from './actions/createAuth'
import createUser from './actions/createUser'
import find from './actions/find'
import findById from './actions/findById'
import schema from './schema'

export default async function users(api: FastifyInstance) {
  api.get('/user/ping', (_, reply) => reply.code(200).send())
  api.get(
    '/user/find/:id',
    {
      schema: {
        params: schema.entity.id,
        response: {
          200: schema.entity.response,
          ...request.reply.schemas,
        },
      },
    },
    request.restricted(findById)
  )
  api.get(
    '/user/find',
    {
      schema: {
        params: schema.entity.find,
        response: {
          200: schema.entity.response,
          ...request.reply.schemas,
        },
      },
    },
    request.restricted(find)
  )
  api.post(
    '/user/auth',
    {
      schema: {
        body: schema.auths.create,
        response: {
          201: schema.entity.response,
          ...request.reply.schemas,
        },
      },
    },
    request.noRestricted(createAuth)
  )
  api.post(
    '/user',
    {
      schema: {
        body: schema.entity.create,
        response: {
          201: schema.entity.response,
          ...request.reply.schemas,
        },
      },
    },
    request.noRestricted(createUser)
  )
}
