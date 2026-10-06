import { and, asc, between, eq } from 'drizzle-orm'
import { z } from 'zod'
import { times,  } from '../db/schema'
import {TimeEntry} from "~/shared/types/time-entry.ts";

const query = z.object({
  userId: z.coerce.number().int(),
  from: z.iso.date(),
  to: z.iso.date(),
})

export default defineEventHandler(async (event): Promise<TimeEntry[]> => {
  const { userId, from, to } = await getValidatedQuery(event, query.parse)
  console.log("args: ", userId, from, to, "")

  const res = await  db.select().from(times)
    .where(and(eq(times.userId, userId), between(times.date, from, to)))
    .orderBy(asc(times.date), asc(times.start))
  console.log(res)
  return res
})
