import request from '@infrastructure/server/request'
import { FastifyInstance } from 'fastify'
import getById from './actions/get-by-id'
import getFindByParams from './actions/get-find-by-params'
import postNewAuth from './actions/post-new-auth'
import postNewEntity from './actions/post-new-entity'
import schema from './schema'

export default async function userRoutes(api: FastifyInstance) {
  api.get('/ping', { schema: { tags: ['User'] } }, (_, reply) => reply.code(200).send())
  api.get(
    '/:id',
    {
      schema: {
        tags: ['User'],
        summary: 'Find user by id',
        params: schema.actions.id,
        response: { 200: schema.entity, ...request.reply.schemas },
      },
    },
    request.restricted(getById)
  )
  api.get(
    '/',
    {
      schema: {
        tags: ['User'],
        summary: 'Find users',
        querystring: schema.actions.read,
        response: { 200: schema.entity, ...request.reply.schemas },
      },
    },
    request.restricted(getFindByParams)
  )
  api.post(
    '/',
    {
      schema: {
        tags: ['User'],
        summary: 'Create new user',
        body: schema.actions.create.entity,
        response: { 201: schema.entity, ...request.reply.schemas },
      },
    },
    request.noRestricted(postNewEntity)
  )
  api.post(
    '/auth',
    {
      schema: {
        tags: ['User'],
        summary: 'Create new authorization',
        body: schema.actions.create.auth,
        response: { 201: schema.auth, ...request.reply.schemas },
      },
    },
    request.noRestricted(postNewAuth)
  )
}
