import { timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import { users } from '../db/schema'

const body = z.object({ name: z.string().min(1), email: z.email(), password: z.string().min(8), invite: z.string() })

export default defineEventHandler(async (event) => {
  const { name, email, password, invite } = await readValidatedBody(event, body.parse)
  const given = Buffer.from(invite)
  const expected = Buffer.from(process.env.INVITE_CODE ?? '')
  if (!expected.length || given.length !== expected.length || !timingSafeEqual(given, expected))
    throw createError({ statusCode: 403, message: 'Invalid invite code' })
  const [user] = await db.insert(users)
    .values({ name, email, password: await hashPassword(password) })
    .onConflictDoNothing()
    .returning()
  if (!user) throw createError({ statusCode: 409, message: 'Email taken' })
  await setUserSession(event, { user: { id: user.id, name: user.name, email: user.email } })
  return {}
})
