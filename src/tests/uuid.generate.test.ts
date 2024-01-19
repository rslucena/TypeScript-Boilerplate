import { uuid } from '@shared/repositories/references'
import { describe, expect, it } from 'vitest'

describe('Test cache functions', () => {
  it('It should be possible to create a UUID', async () => {
    const uuid1 = uuid({ table: 'users', id: 1 })
    expect(uuid1).toBeTypeOf('string')
  })
})
