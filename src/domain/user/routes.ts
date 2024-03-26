import request from '@infrastructure/server/request'
import { FastifyInstance } from 'fastify'
import GetById from './actions/GetById'
import GetFindByParams from './actions/GetFindByParams'
import PostNewAuth from './actions/PostNewAuth'
import PostNewEntity from './actions/PostNewEntity'
import schema from './schema'

export default async function userRoutes(api: FastifyInstance) {
  api.get('/ping', { schema: { tags: ['User'] } }, (_, reply) => reply.code(200).send())
  api.get(
    '/:id',
    {
      schema: {
        tags: ['User'],
        params: schema.actions.id,
        response: { 200: schema.entity, ...request.reply.schemas },
      },
    },
    request.restricted(GetById)
  )
  api.get(
    '/',
    {
      schema: {
        tags: ['User'],
        querystring: schema.actions.read,
        response: { 200: schema.entity, ...request.reply.schemas },
      },
    },
    request.restricted(GetFindByParams)
  )
  api.post(
    '/',
    {
      schema: {
        tags: ['User'],
        body: schema.actions.create.entity,
        response: { 201: schema.entity, ...request.reply.schemas },
      },
    },
    request.noRestricted(PostNewEntity)
  )
  api.post(
    '/auth',
    {
      schema: {
        tags: ['User'],
        body: schema.actions.create.auth,
        response: { 201: schema.auth, ...request.reply.schemas },
      },
    },
    request.noRestricted(PostNewAuth)
  )
}
