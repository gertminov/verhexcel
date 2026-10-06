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

export const saveDayBody = z.object({
  userId: z.number().int(),
  date: z.iso.date(),
  entries: z.array(z.object({ start: z.string(), end: z.string() })),
})
export type SaveDayBody = z.input<typeof saveDayBody>
