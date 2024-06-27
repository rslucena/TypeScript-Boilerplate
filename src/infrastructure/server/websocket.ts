import Logs from '@infrastructure/logs/handler'
import { randomUUID } from 'crypto'
import { IncomingMessage } from 'http'
import { RawData, WebSocket, WebSocketServer } from 'ws'
import { authentication, container } from './request'
import { safeParse } from './transforms'

type messages = { action: string; session: string; context: string }
type client = { link: WebSocket; authenticated: boolean }

const topics: Map<string, Set<string>> = new Map()
const clients: Map<string, client> = new Map()
const logger = Logs.handler('websocket')

export default function websocket(Params: WebSocketServer['options']) {
  const ws = new WebSocketServer({ ...Params, host: '0.0.0.0' })
  ws.on('close', () => logger.error('websocket closed'))
  ws.on('error', (err) => logger.error('websocket error', err))
  ws.on('listening', () => logger.info(`websocket listening ${JSON.stringify(ws.address())}`))
  ws.on('connection', (link, request) => connection(link, request))
  return ws
}

function connection(link: WebSocket, request: IncomingMessage) {
  const ip = request.socket.remoteAddress ?? randomUUID()
  const id = Buffer.from(ip).toString('base64')
  clients.set(id, { link, authenticated: false })

  const heartbeat = setInterval(() => {
    const client = clients.get(id)
    const invalid = client === undefined || !client.authenticated
    if (invalid) return disconnect(id)
    client.link.ping()
  }, 30000)

  link.send(mstart)
  link.send(JSON.stringify({ ...msession, session: id }))

  link.on('error', () => disconnect(id))
  link.on('close', () => clearInterval(heartbeat))
  link.on('unexpected-response', () => disconnect(id))
  link.on('message', (data) => message(id, data))
}

function message(id: string, data: RawData) {
  const client = clients.get(id)
  const decoded = safeParse(data.toString())
  if (!decoded || !client) return disconnect(id)

  const { action, context, session } = decoded as messages
  if (!action || !context || !session) disconnect(id)
  if (session !== id) disconnect(id)

  switch (action) {
    case 'authorization':
      client.authenticated = credentials(context)
      if (!client.authenticated) return client.link.send(insession)
      return client.link.send(authenticated)

    case 'subscribe':
      const subscribed = subscribe(id, action, client.authenticated)
      if (subscribed) return client.link.send(msubscribe)
      client.link.send(insession)
      return disconnect(id)

    case 'unsubscribe':
      const deleted = unsubscribe(id, action, client.authenticated)
      if (deleted) return client.link.send(munsubscribe)
      client.link.send(insession)
      return disconnect(id)

    default:
      disconnect(id)
  }
}

function disconnect(id: string) {
  for (const [router, clients] of topics.entries()) {
    if (clients.has(id)) clients.delete(id)
    if (clients.size === 0) topics.delete(router)
  }
  const client = clients.get(id)
  if (!client) return
  client.link.send(mdisconnect)
  client.link.close()
  clients.delete(id)
}

function credentials(content: string) {
  const receiver = new container({ headers: { authorization: `Bearer ${content}` } })
  const authenticated = new authentication().session(receiver)
  if (!authenticated) return false
  return true
}

function subscribe(id: string, action: string, authenticated: boolean) {
  if (!authenticated) return undefined
  if (!topics.has(action)) topics.set(action, new Set<string>())
  return topics.get(action)?.add(id)
}

function unsubscribe(id: string, action: string, authenticated: boolean) {
  if (!authenticated) return undefined
  const subscribers = topics.get(action)
  if (!subscribers) return true
  return subscribers.size > 2 ? subscribers.delete(id) : topics.delete(action)
}

const mstart = JSON.stringify({ action: 'connect', message: 'connection established' })
const mdisconnect = JSON.stringify({ action: 'connect', message: 'client disconnect' })
const msession = { action: 'session', message: 'waiting for create session' }
const insession = JSON.stringify({ action: 'session', message: 'session unauthorized' })
const authenticated = JSON.stringify({ action: 'session', message: 'session authenticated' })
const msubscribe = JSON.stringify({ action: 'subscribe', message: 'context subscribed' })
const munsubscribe = JSON.stringify({ action: 'unsubscribe', message: 'context unsubscribed' })
