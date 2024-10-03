import { FastifyBaseLogger, FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { IncomingMessage, Server, ServerResponse } from 'http'
import { z } from 'zod'

interface guise {
  status?: number
  url?: string
  language?: string
  raw?: { [key: string]: any } | unknown
  session?: { [key: string]: any }
  headers?: { [key: string]: any }
  query?: { [key: string]: any } | unknown
  body?: { [key: string]: any } | unknown
  params?: { [key: string]: any } | unknown
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
}

const headers = z.object({
  'authorization': z
    .string()
    .startsWith('Bearer')
    .regex(/^Bearer [a-zA-Z0-9-._~+/]+=*$/),
  'accept-language': z.string().default('en'),
})

type server = FastifyInstance<
  Server<typeof IncomingMessage, typeof ServerResponse>,
  IncomingMessage,
  ServerResponse<IncomingMessage>,
  FastifyBaseLogger,
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

export { errorSchema, guise, headers, replyErrorSchema, server }
