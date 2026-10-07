import { absenceTypes, type absences } from "~~/server/db/schema";
import { z } from "zod";

export type Absence = typeof absences.$inferSelect;

export const absencesQuery = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
});
export type AbsencesQuery = z.input<typeof absencesQuery>;

// type null removes all absences in the range
export const saveAbsencesBody = z
  .object({
    from: z.iso.date(),
    to: z.iso.date(),
    type: z.enum(absenceTypes).nullable(),
  })
  .refine((b) => b.from <= b.to, "from must not be after to")
  .refine(
    (b) => Date.parse(b.to) - Date.parse(b.from) <= 366 * 864e5,
    "range must not exceed one year",
  );
export type SaveAbsencesBody = z.input<typeof saveAbsencesBody>;
