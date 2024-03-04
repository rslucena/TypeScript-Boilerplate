import client from './connection'
import { actions, setmode } from './interfaces'

const cache: actions = {
  text: {
    del: (hash) => client.del(hash),
    get: (hash) => client.get(hash).catch(() => null),
    set: (hash, vals, ttl) => set({ type: 'text', hash, vals, ttl }).catch(() => ''),
  },
  json: {
    del: (hash) => client.json.del(hash),
    get: (hash) => client.json.get(hash).catch(() => null),
    set: (hash, vals, ttl, key) => set({ type: 'json', hash, vals, ttl, key }).catch(() => ''),
  },
  ping: () => client.ping(),
}

async function set({ type, hash, vals, ttl, key }: setmode): Promise<string | null> {
  const actions = {
    text: () => client.set(hash, vals),
    json: () => client.json.set(hash, key ?? '$', vals),
  }
  if (ttl) client.expire(hash, ttl)
  return actions[type]()
}

export default cache
