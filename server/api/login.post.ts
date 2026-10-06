import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { users } from '../db/schema'

const body = z.object({ email: z.email(), password: z.string().min(8) })

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, body.parse)
  const [user] = await db.select().from(users).where(eq(users.email, email))
  console.log(user)
  if (!user || !(await verifyPassword(user.password, password))){
    console.log("unsuccessful login: ", user)
    throw createError({ statusCode: 401, message: 'Bad credentials' })
  }
  await setUserSession(event, { user: { id: user.id, name: user.name, email: user.email } })
  return {}
})
