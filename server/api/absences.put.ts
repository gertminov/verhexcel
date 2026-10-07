import { and, between, eq } from "drizzle-orm";
import { absences } from "../db/schema";
import { type Absence, saveAbsencesBody } from "~/shared/types/absence.ts";
import { weekdays } from "../../utils/time.ts";

// Replaces all absences in from..to with one entry per weekday.
export default defineEventHandler(async (event): Promise<Absence[]> => {
  const { user } = await requireUserSession(event);
  const { from, to, type } = await readValidatedBody(
    event,
    saveAbsencesBody.parse,
  );
  const wipe = db
    .delete(absences)
    .where(and(eq(absences.userId, user.id), between(absences.date, from, to)));
  const dates = weekdays(from, to);
  if (!type || !dates.length) {
    await wipe;
    return [];
  }
  const [, saved] = await db.batch([
    wipe,
    db
      .insert(absences)
      .values(dates.map((date) => ({ userId: user.id, date, type })))
      .returning(),
  ]);
  return saved;
});
