import {
  FastifyInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { Logger } from 'pino'
import { z } from 'zod'

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

const errorSchema = (code: number) =>
  z.object({
    statusCode: z.number().default(code),
    code: z.string(),
    error: z.string(),
    message: z.string(),
  })

const replyErrorSchema = {
  schemas: {
    400: errorSchema(400),
    401: errorSchema(401),
    404: errorSchema(404),
    500: errorSchema(500),
    503: errorSchema(503),
  },
}

export { errorSchema, guise, replyErrorSchema, server }
