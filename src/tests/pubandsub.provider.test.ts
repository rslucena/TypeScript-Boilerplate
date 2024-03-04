import queues from '@infrastructure/queues/actions'
import { hash } from '@infrastructure/repositories/references'
import { describe, expect, it } from 'vitest'

describe('Messaging system testing', () => {
  it('Must be possible to open a connection to the server', async () => {
    expect(await queues.messages.ping()).toBe('PONG')
  })
  it('It must be possible to send', async () => {
    const Topic = hash({ table: 1, id: 1 })
    queues.messages.sub(Topic, async () => {})
    expect(await queues.messages.pub(Topic, [1])).toBeDefined()
  })
})
