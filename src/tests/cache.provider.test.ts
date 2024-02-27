import cache from '@infrastructure/cache/actions'
import { uuid } from '@infrastructure/repositories/references'
import { describe, expect, it } from 'vitest'

describe('Test cache functions', () => {
  it('Must be possible to open a connection to the server', async () => {
    expect(await cache.ping()).toBe('PONG')
  })

  it('Must be possible to insert content', async () => {
    const ref = uuid({ table: 1, id: 1 })
    const action = await cache.text.set(ref, 'Single mode')
    expect(action).toBe('OK')
  })

  it('Must be possible to insert json content', async () => {
    const ref = uuid({ table: 1, id: 2 })
    const action = await cache.json.set(ref, { test: 'test' })
    expect(action).toBe('OK')
  })

  it('Must be possible to get content', async () => {
    const ref = uuid({ table: 1, id: 1 })
    const action = await cache.text.get(ref)
    expect(action).toEqual('Single mode')
  })

  it('Must be possible to get json content', async () => {
    const ref = uuid({ table: 1, id: 2 })
    const action = await cache.json.get(ref)
    expect(action).toEqual({ test: 'test' })
  })

  it('Must be possible to update content', async () => {
    const ref = uuid({ table: 1, id: 1 })
    const action = await cache.text.set(ref, 'Multi mode')
    expect(action).toBe('OK')
  })

  it('Must be possible to update json content', async () => {
    const ref = uuid({ table: 1, id: 2 })
    const action = await cache.json.set(ref, { test: 'test2' })
    expect(action).toBe('OK')
  })

  it('Must be possible to delete content', async () => {
    const ref = uuid({ table: 1, id: 1 })
    const action = await cache.text.del(ref)
    expect(action).toBe(1)
  })

  it('Must be possible to delete json content', async () => {
    const ref = uuid({ table: 1, id: 2 })
    const action = await cache.json.del(ref)
    expect(action).toBe(1)
  })
})
