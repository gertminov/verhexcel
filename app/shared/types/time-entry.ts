import type { times } from "~~/server/db/schema";

export type InsertTimeEntry = typeof times.$inferInsert
export type TimeEntry = typeof times.$inferSelect
