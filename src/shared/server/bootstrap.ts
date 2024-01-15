import fastify, { FastifyInstance } from 'fastify'
import { IncomingMessage, Server, ServerResponse } from 'http'

export default async function (): Promise<FastifyInstance> {
  
  const server: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({
    caseSensitive: true,
    pluginTimeout: 10_000,
    disableRequestLogging: true,
    logger: { level: process.env.LOG_LEVEL },
  })

  server.get('/', (_request, reply) => reply.code(401).send())

  server.get<{ Querystring: { domain: string } }>('/ping/:domain', (_request, reply) => {
    reply.code(200).send({ pong: 'it worked!' })
  })

  server.listen({ port: Number(process.env.APP_PORT), host: '0.0.0.0' }, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.debug(`Ready and listening for routes: \n  ${server.printRoutes()}`)
  })

  return server
}
