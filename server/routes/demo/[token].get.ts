import { timingSafeEqual, randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { users } from "../../db/schema";

const email = "demo@verhexel.com";

export default defineEventHandler(async (event) => {
  const token = Buffer.from(getRouterParam(event, "token") ?? "");
  const expected = Buffer.from(process.env.DEMO_TOKEN ?? "");
  if (
    !expected.length ||
    token.length !== expected.length ||
    !timingSafeEqual(token, expected)
  )
    throw createError({ statusCode: 404 });

  await db
    .insert(users)
    .values({ name: "Demo", email, password: await hashPassword(randomUUID()) })
    .onConflictDoNothing();

  const [user] = await db.select().from(users).where(eq(users.email, email));
  await setUserSession(event, {
    user: { id: user!.id, name: user!.name, email: user!.email },
  });
  return sendRedirect(event, "/times");
});
