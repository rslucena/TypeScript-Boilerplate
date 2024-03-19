import { FastifyReply, FastifyRequest } from 'fastify'
import { guise } from './interface'
import { z } from 'zod'

export class error {
  notFound(resource?: string) {
    return {
      statusCode: 404,
      code: 'ERR_VALIDATION',
      error: `Not Found ${resource || ''}`,
      message: 'The requested resource was not found.',
    }
  }
  badRequest(resource?: string) {
    return {
      statusCode: 400,
      code: 'ERR_REQUEST',
      error: `Bad Request ${resource ?? ''}`,
      message: 'Do not repeat this request without modification.',
    }
  }
  unprocessableEntity(resource?: string) {
    return {
      statusCode: 422,
      code: 'UNPROCESSABLE_ENTITY',
      error: `Unprocessable Entity ${resource ?? ''}`,
      message: 'The request was well-formed but unable to be followed due to semantic errors.',
    }
  }
}

export class container extends error {
  protected _status: guise['status']
  protected _raw: guise['raw']
  protected _session: guise['session']
  protected _headers: guise['headers']
  protected _query: guise['query']
  protected _body: guise['body']
  protected _params: guise['params']
  constructor({ status, raw, session, headers, query, body, params }: guise = {}) {
    super()
    this._status = status || 200
    this._raw = raw
    this._session = session
    this._headers = headers
    this._query = query
    this._body = body
    this._params = params
  }
  debug<T>(context?: guise['raw']) {
    this._raw = context || this._raw
    return this._raw as T
  }
  session<T>(context?: guise['session']) {
    this._session = context || this._session
    return this._session as T
  }
  headers<T>(context?: guise['headers']) {
    this._headers = { ...this._headers, ...context }
    return this._headers as T
  }
  query<T>(context?: guise['query']) {
    this._query = context || this._query
    return this._query as T
  }
  body<T>(context?: guise['body']) {
    this._body = context || this._body
    return this._body as T
  }
  params<T>(context?: guise['params']) {
    this._params = context || this._params
    return this._params as T
  }
  status(context?: guise['status']) {
    this._status = context || this._status
    return this._status ?? 200
  }
}

function execute(
  callback: CallableFunction,
  isRestricted = false
): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  return async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const form = new container({
      raw: req.raw,
      headers: req.headers,
      query: req.query,
      body: req.body,
      params: req.params,
      status: reply.statusCode,
    })

    let resp: any = form.badRequest()
    if (isRestricted) form.session({})

    try {
      resp = await callback(form)
    } catch (error) {
      if (typeof error === 'object') resp = error
      else resp.message = error
    }

    if (resp && resp.statusCode) form.status(resp.statusCode)

    return reply
      .headers(form.headers())
      .code(form.status())
      .send(resp ?? '')
  }
}

const errorSchema = (code: number) =>
  z.object({
    statusCoded: z.number().default(code),
    code: z.string(),
    error: z.string(),
    message: z.string(),
  })

export default {
  reply: {
    schemas: {
      400: errorSchema(400),
      401: errorSchema(401),
      404: errorSchema(404),
      500: errorSchema(500),
      503: errorSchema(503),
    },
  },
  restricted: (fn: CallableFunction) => execute(fn, true),
  noRestricted: (fn: CallableFunction) => execute(fn),
}
