import cache from '@infrastructure/cache/actions'
import { hash } from '@infrastructure/repositories/references'
import { describe, expect, it } from 'vitest'

describe('Test cache functions', () => {
  it('Must be possible to open a connection to the server', async () => {
    expect(await cache.ping()).toBe('PONG')
  })

  it('Must be possible to insert content', async () => {
    const action = await cache.text.set('test-text-key', 'Single mode')
    expect(action).toBe('OK')
  })

  it('Must be possible to insert json content', async () => {
    const action = await cache.json.set('test-json-key', { test: 'test' })
    expect(action).toBe('OK')
  })

  it('Must be possible to get content', async () => {
    const action = await cache.text.get('test-text-key')
    expect(action).toEqual('Single mode')
  })

  it('Must be possible to get json content', async () => {
    const action = await cache.json.get('test-json-key')
    expect(action).toEqual({ test: 'test' })
  })

  it('Must be possible to update content', async () => {
    const action = await cache.text.set('test-text-key', 'Multi mode')
    expect(action).toBe('OK')
  })

  it('Must be possible to update json content', async () => {
    const action = await cache.json.set('test-json-key', { test: 'test2' })
    expect(action).toBe('OK')
  })

  it('Must be possible to delete content', async () => {
    const action = await cache.text.del('test-text-key')
    expect(action).toBe(1)
  })

  it('Must be possible to delete json content', async () => {
    const action = await cache.json.del('test-json-key')
    expect(action).toBe(1)
  })
})
