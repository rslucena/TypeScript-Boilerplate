import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import Logs from '@infrastructure/logs/handler'
import cors from '@infrastructure/settings/cors'
import helmet from '@infrastructure/settings/helmet'
import { SettingOptions, SettingOptionsUI } from '@infrastructure/settings/swagger'
import fastify from 'fastify'
import { ZodTypeProvider, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import { server } from './interface'
import { convertRequestTypes, err } from './request'

async function webserver(): Promise<server> {
  const instance = fastify({
    logger: Logs.provider,
    caseSensitive: true,
    pluginTimeout: 20000,
    requestTimeout: 20000,
    disableRequestLogging: true,
  }).withTypeProvider<ZodTypeProvider>()
  instance.removeContentTypeParser('text/plain')
  instance.addHook('onRequest', convertRequestTypes)
  instance.setValidatorCompiler(validatorCompiler)
  instance.setSerializerCompiler(serializerCompiler)
  instance.register(fastifyCors, cors)
  instance.register(fastifyHelmet, helmet)
  instance.setNotFoundHandler((_request, reply) => reply.code(418).send())
  instance.register(fastifySwagger, SettingOptions)
  instance.register(fastifySwaggerUi, SettingOptionsUI)
  instance.setErrorHandler(function (error, request, reply) {
    let er = new err().badRequest()
    if (error.message.startsWith('Unsupported Media Type')) {
      request.headers['content-type'] = 'application/json'
      error.message = error.message.split(';')[0]
    }
    er.message = error.message
    return reply.headers(request.headers).code(er.statusCode).send(er)
  })
  process.on('SIGTERM', () => {
    instance.close()
    process.exit(1)
  })
  process.on('SIGINT', () => {
    instance.close()
    process.exit(1)
  })
  process.on('uncaughtException', (err) => {
    Logs.file.error('Uncaught Exception thrown', err)
    process.exit(1)
  })
  process.on('unhandledRejection', (reasons) => {
    Logs.file.error('Unhandled Rejection', reasons)
    process.exit(1)
  })
  return instance
}

async function start(instance: server): Promise<void> {
  instance.ready((err) => {
    if (err) return Logs.console.error(err.message, err, true)
    instance.swagger()
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
