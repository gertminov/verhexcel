import { and, eq } from "drizzle-orm";
import { times } from "../db/schema";
import { type TimeEntry, saveDayBody } from "#shared/types/time-entry.ts";

export default defineEventHandler(async (event): Promise<TimeEntry[]> => {
  const { user } = await requireUserSession(event);
  const { date, entries } = await readValidatedBody(event, saveDayBody.parse);
  const wipe = db
    .delete(times)
    .where(and(eq(times.userId, user.id), eq(times.date, date)));
  if (!entries.length) {
    await wipe;
    return [];
  }
  const [, saved] = await db.batch([
    wipe,
    db
      .insert(times)
      .values(entries.map((e) => ({ ...e, userId: user.id, date })))
      .returning(),
  ]);
  return saved;
});
