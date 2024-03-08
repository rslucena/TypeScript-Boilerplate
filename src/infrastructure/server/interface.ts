import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import {
  FastifyInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from 'fastify'
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
  TypeBoxTypeProvider
>

export { guise, server }
