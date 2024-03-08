import { FastifyReply, FastifyRequest } from 'fastify'
import { guise } from './interface'

export class container {
  protected _status: guise['status']
  protected _raw: guise['raw']
  protected _session: guise['session']
  protected _headers: guise['headers']
  protected _query: guise['query']
  protected _body: guise['body']
  protected _params: guise['params']
  constructor({ status, raw, session, headers, query, body, params }: guise = {}) {
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
  notFound(resource?: string) {
    this._status = 404
    return {
      statusCode: 404,
      code: 'ERR_VALIDATION',
      error: `Not Found ${resource ?? ''}`,
      message: 'The requested resource was not found.',
    }
  }
  badRequest(resource?: string) {
    this._status = 400
    return {
      statusCode: 400,
      code: 'ERR_REQUEST',
      error: `Bad Request ${resource ?? ''}`,
      message: 'Do not repeat this request without modification.',
    }
  }
  unprocessableEntity(resource?: string) {
    this._status = 422
    return {
      statusCode: 422,
      code: 'UNPROCESSABLE_ENTITY',
      error: `Unprocessable Entity ${resource ?? ''}`,
      message: 'The request was well-formed but unable to be followed due to semantic errors.',
    }
  }
}

function execute(
  callback: CallableFunction,
  restricted = false
): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  return async (rq: FastifyRequest, rp: FastifyReply): Promise<void> => {
    const form = new container({
      raw: rq.raw,
      headers: rq.headers,
      query: rq.query,
      body: rq.body,
      params: rq.params,
      status: rp.statusCode,
    })
    let resp = form.badRequest()
    if (restricted) form.session({})
    try {
      resp = await callback(form)
    } catch (err: unknown | any) {
      console.log(err)
      if (typeof err === 'object') resp = err
      else resp.message = err
    }
    return rp
      .headers(form.headers() || rp.headers)
      .code(form.status())
      .send(resp)
  }
}

export default {
  restricted: (fn: CallableFunction) => execute(fn, true),
  noRestricted: (fn: CallableFunction) => execute(fn),
}
