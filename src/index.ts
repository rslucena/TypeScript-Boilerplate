import repository from '@shared/repositories/repository'
import { entity } from '@shared/schemas/users'
import { and, eq } from 'drizzle-orm'

repository
  .select()
  .from(entity)
  .where(and(eq(entity.id, 1), eq(entity.id, 2)))
