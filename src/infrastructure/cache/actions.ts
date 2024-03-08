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
    text: async () => await client.set(hash, vals),
    json: async () => await client.json.set(hash, key ?? '$', vals),
  }
  const action = actions[type]()
  if (ttl) await client.expire(hash, ttl)
  return action
}

export default cache
