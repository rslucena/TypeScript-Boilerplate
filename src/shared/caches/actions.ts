import { uuid } from '@shared/repositories/references'
import client from './connection'
import { actions } from './interfaces'

const caches: actions = {
  text: {
    del: (key) => client.del(key),
    get: (key) => client.get(key).catch(() => null),
    set: (key, vals, ttl) => set('text', key, vals, ttl),
  },
  json: {
    del: (key) => client.json.del(key),
    get: (key) => client.json.get(key).catch(() => null),
    set: (key, vals, ttl) => set('json', key, vals, ttl),
  }
}

async function set(
  type: 'json' | 'text',
  key: string,
  vals: any,
  ttl?: number
): Promise<string | null> {
  const actions = {
    text: () => client.set(key, vals),
    json: () => client.json.set(key, '$', vals),
  }
  if (ttl) client.expire(key, ttl)
  return actions[type]()
}

export default caches
