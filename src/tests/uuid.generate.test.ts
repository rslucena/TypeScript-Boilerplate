import { hash } from '@infrastructure/repositories/references'
import { describe, expect, it } from 'vitest'

describe('Test cache functions', () => {
  it('It should be possible to create a hash', async () => {
    const hash1 = hash({ table: 'users', id: 1 })
    expect(hash1).toBeTypeOf('string')
  })
})
