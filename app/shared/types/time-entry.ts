import type { times } from "~~/server/db/schema";
import { z } from "zod";

export type InsertTimeEntry = typeof times.$inferInsert
export type TimeEntry = typeof times.$inferSelect

export const timesQuery = z.object({
  userId: z.coerce.number().int(),
  from: z.iso.date(),
  to: z.iso.date(),
})
export type TimesQuery = z.input<typeof timesQuery>
