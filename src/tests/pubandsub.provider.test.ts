import queues from '@infrastructure/queues/actions'
import { hash } from '@infrastructure/repositories/references'
import { describe, expect, it } from 'vitest'

describe('Test cache functions', () => {
  it('Must be possible to open a connection to the server', async () => {
    expect(await queues.ping()).toBe('PONG')
  })
  it('It must be possible to send', async () => {
    const Topic = hash({ table: 1, id: 1 })
    expect(await queues.pub(Topic, [1])).toBe(1)
  })
})
