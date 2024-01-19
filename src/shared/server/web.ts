import fastifyCors from '@fastify/cors'
import Logs, { loghandler } from '@shared/logs/handler'
import cors from '@shared/settings/cors'
import fastify from 'fastify'

export default async function () {
  //
  const web = fastify({
    logger: loghandler,
    caseSensitive: true,
    pluginTimeout: 20_000,
    requestTimeout: 20_000,
    disableRequestLogging: true,
  })

  web.register(fastifyCors, cors)

  web.get('/', (_request, reply) => reply.code(401).send())

  web.get<{ Querystring: { domain: string } }>('/ping/:domain', (_request, reply) => {
    reply.code(200).send({ pong: 'it worked!' })
  })

  web.listen({ port: Number(process.env.APP_PORT), host: '0.0.0.0' }, (err, anddress) => {
    if (err) Logs.file.error(err.message, err, true)
    Logs.console.info(`Server listening on ${anddress}`)
    Logs.console.info(`${web.printRoutes()}`)
  })

  process.on('SIGTERM', () => process.exit())
  process.on('SIGINT', () => process.exit())
  process.on('uncaughtException', (err) => Logs.file.error('Uncaught Exception thrown', err))
  process.on('unhandledRejection', (reasons) => Logs.file.error('Unhandled Rejection', reasons))
}
