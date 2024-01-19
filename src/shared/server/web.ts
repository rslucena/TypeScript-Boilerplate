import fastifyCors from '@fastify/cors'
import cors from '@shared/settings/cors'
import fastify, { FastifyInstance } from 'fastify'
import { IncomingMessage, Server, ServerResponse } from 'http'

export default async function (): Promise<FastifyInstance> {
  const web: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({
    caseSensitive: true,
    pluginTimeout: 20_000,
    disableRequestLogging: true,
    logger: { level: process.env.LOG_LEVEL },
  })

  web.register(fastifyCors, cors)

  web.get('/', (_request, reply) => reply.code(401).send())

  web.get<{ Querystring: { domain: string } }>('/ping/:domain', (_request, reply) => {
    reply.code(200).send({ pong: 'it worked!' })
  })

  web.listen({ port: Number(process.env.APP_PORT), host: '0.0.0.0' }, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.debug(`${web.printRoutes()}`)
  })

  process.on('SIGTERM', () => process.exit())
  process.on('SIGINT', () => process.exit())
  process.on('uncaughtException', (err) => web.log.error(err, 'Uncaught Exception thrown'))
  process.on('unhandledRejection', (reasons, p) =>
    web.log.error(reasons as any, 'Unhandled Rejection at Promise', p)
  )

  return web
}
