import type { times } from "~~/server/db/schema";
import { z } from "zod";

export type InsertTimeEntry = typeof times.$inferInsert
export type TimeEntry = typeof times.$inferSelect

export const timesQuery = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
})
export type TimesQuery = z.input<typeof timesQuery>

export const saveDayBody = z.object({
  date: z.iso.date(),
  entries: z.array(z.object({ start: z.iso.time(), end: z.iso.time() })).max(50),
})
export type SaveDayBody = z.input<typeof saveDayBody>
