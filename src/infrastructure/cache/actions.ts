import client from './connection'
import { actions, setmode } from './interfaces'

const cache: actions = {
  text: {
    del: (hash) => del({ type: 'text', hash } as setmode),
    get: <t>(hash: string, force?: boolean) => get<t>({ hash, type: 'text' } as setmode, force),
    set: (hash, vals, ttl) => set({ type: 'text', hash, vals, ttl }).catch(() => ''),
  },
  json: {
    del: (hash) => del({ type: 'json', hash } as setmode),
    get: <t>(hash: string, force?: boolean) => get<t>({ hash, type: 'json' } as setmode, force),
    set: (hash, vals, ttl, key) => set({ type: 'json', hash, vals, ttl, key }).catch(() => ''),
  },
  ping: () => client.ping(),
}

async function get<t>({ type, hash }: setmode, force: boolean = false): Promise<null | t> {
  if (force) return null
  const actions = {
    text: async () => await client.get(hash),
    json: async () => await client.json.get(hash),
  }
  const action = actions[type]()
  if (!action) return null
  return action as t
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

async function del({ type, hash }: setmode): Promise<number> {
  const keys = await client.keys(hash)
  if (!keys.length) return 0
  for (const key of keys) await client.del(key)
  return keys.length
}

export default cache
