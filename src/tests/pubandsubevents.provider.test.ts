import queues from '@infrastructure/queues/actions'
import { hash } from '@infrastructure/repositories/references'
import { describe, expect, it } from 'vitest'

describe('Event trigger test', () => {
  it('It must be possible to send and sign', async () => {
    const Topic = hash({ table: 1, id: 1 })
    queues.events.sub(Topic, async () => {})
    expect(queues.events.pub(Topic, [1])).toBe(1)
  })
})
