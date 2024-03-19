import {
  FastifyInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { Logger } from 'pino'

interface guise {
  status?: number
  raw?: { [key: string]: any } | unknown
  session?: { [key: string]: any }
  headers?: { [key: string]: any }
  query?: { [key: string]: any } | unknown
  body?: { [key: string]: any } | unknown
  params?: { [key: string]: any } | unknown
}

type server = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  Logger<never>,
  ZodTypeProvider
>

export { guise, server }
