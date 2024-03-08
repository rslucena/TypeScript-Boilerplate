import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import Logs from '@infrastructure/logs/handler'
import cors from '@infrastructure/settings/cors'
import helmet from '@infrastructure/settings/helmet'
import fastify from 'fastify'
import { server } from './interface'

async function webserver(): Promise<server> {
  const instance = fastify({
    logger: Logs.provider,
    caseSensitive: true,
    pluginTimeout: 20000,
    requestTimeout: 20000,
    disableRequestLogging: true,
  }).withTypeProvider<TypeBoxTypeProvider>()
  instance.register(fastifyCors, cors)
  instance.register(fastifyHelmet, helmet)
  instance.setNotFoundHandler((_request, reply) => reply.code(503).send())
  process.on('SIGTERM', () => instance.close())
  process.on('SIGINT', () => instance.close())
  process.on('uncaughtException', (err) => Logs.file.error('Uncaught Exception thrown', err))
  process.on('unhandledRejection', (reasons) => Logs.file.error('Unhandled Rejection', reasons))
  return instance
}

function start(instance: server): void {
  instance.ready((err) => {
    if (!err) return
    Logs.console.error(err.message, err, true)
  })

  instance.listen({ port: Number(process.env.PROCESS_PORT), host: '0.0.0.0' }, (err, address) => {
    if (err) Logs.file.error(err.message, err, true)
    Logs.console.info(`Server listening on ${address}`)
    Logs.console.info(`${instance.printRoutes({ commonPrefix: false })}`)
  })
}

export default {
  create: () => webserver(),
  start: (instance: server) => start(instance),
}
