import { and, asc, between, eq } from "drizzle-orm";
import { times } from "../db/schema";
import { type TimeEntry, timesQuery } from "~/shared/types/time-entry.ts";

export default defineEventHandler(async (event): Promise<TimeEntry[]> => {
  const { user } = await requireUserSession(event);
  const { from, to } = await getValidatedQuery(event, timesQuery.parse);

  return await db
    .select()
    .from(times)
    .where(and(eq(times.userId, user.id), between(times.date, from, to)))
    .orderBy(asc(times.date), asc(times.start));
});
