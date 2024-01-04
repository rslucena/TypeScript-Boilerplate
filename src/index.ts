import caches from '@shared/cache/actions'
import { uuid } from '@shared/repositories/references'

const uuid1 = uuid({ table: 'users', id: 1 })
console.debug(uuid1)

const uuid2 = await caches.json.set(uuid1, { test: 2 }, 10000)
console.debug(uuid2)

const cac = await caches.json.get(uuid1)
console.debug(cac)

console.debug(await caches.text.get(uuid1))
