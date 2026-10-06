import { and, asc, between, eq } from 'drizzle-orm'
import { times } from '../db/schema'
import { type TimeEntry, timesQuery } from "~/shared/types/time-entry.ts";

export default defineEventHandler(async (event): Promise<TimeEntry[]> => {
  const { userId, from, to } = await getValidatedQuery(event, timesQuery.parse)
  console.log("args: ", userId, from, to, "")

  const res = await  db.select().from(times)
    .where(and(eq(times.userId, userId), between(times.date, from, to)))
    .orderBy(asc(times.date), asc(times.start))
  console.log(res)
  return res
})
