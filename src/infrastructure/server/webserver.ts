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

const logger = Logs.handler('webserver')

async function webserver(): Promise<server> {
  const instance = fastify({
    logger: logger,
    caseSensitive: false,
    pluginTimeout: 20000,
    requestTimeout: 20000,
    disableRequestLogging: true,
  }).withTypeProvider<ZodTypeProvider>()
  instance.addHook('onRequest', convertRequestTypes)
  instance.setValidatorCompiler(validatorCompiler)
  instance.setSerializerCompiler(serializerCompiler)
  instance.register(fastifyCors, cors)
  instance.register(fastifyHelmet, helmet)
  instance.setNotFoundHandler((_request, reply) => reply.code(510).send())
  instance.register(fastifySwagger, SettingOptions)
  instance.register(fastifySwaggerUi, SettingOptionsUI)
  instance.setErrorHandler(function (error, request, reply) {
    let er = new err().badRequest(request.headers['accept-language'])
    if (error.message.startsWith('Unsupported Media Type')) {
      request.headers['content-type'] = 'application/json'
      error.message = error.message.split(';')[0]
    }
    er.message = error.message
    return reply.headers(request.headers).code(er.statusCode).send(er)
  })

  const safeExit = (message: string, err?: any) => {
    logger.error(message, err ?? '')
    process.emit('SIGTERM')
    process.emit('SIGINT')
  }

  process.on('SIGTERM', () => process.exit(1))
  process.on('SIGINT', () => process.exit(1))
  process.on('SIGILL', (err) => safeExit('Illegal Instruction', err))
  process.on('SIGFPE', (err) => safeExit('Divided by 0', err))
  process.on('uncaughtException', (err) => safeExit('Uncaught Exception', err))
  process.on('unhandledRejection', (err) => safeExit('Unhandled Rejection', err))
  return instance
}

async function start(instance: server, port: number): Promise<void> {
  instance.ready((err) => {
    if (err) return logger.error(err.message, err)
    instance.swagger()
  })
  instance.listen({ port, host: '0.0.0.0' }, (err, address) => {
    if (err) return logger.error(err.message, err)
    Logs.console.info(`Server listening on ${address}`)
    Logs.console.info(`${instance.printRoutes({ commonPrefix: false })}`)
  })
}

export default {
  create: () => webserver(),
  start: (instance: server, port: number) => start(instance, port),
}
