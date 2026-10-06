import { z } from 'zod'
import { users } from '../db/schema'

const body = z.object({ name: z.string().min(1), email: z.email(), password: z.string().min(8) })

export default defineEventHandler(async (event) => {
  const { name, email, password } = await readValidatedBody(event, body.parse)
  const [user] = await db.insert(users)
    .values({ name, email, password: await hashPassword(password) })
    .onConflictDoNothing()
    .returning()
  if (!user) throw createError({ statusCode: 409, message: 'Email taken' })
  await setUserSession(event, { user: { id: user.id, name: user.name, email: user.email } })
  return {}
})
