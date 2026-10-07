import { and, asc, between, eq } from "drizzle-orm";
import { absences } from "../db/schema";
import { type Absence, absencesQuery } from "~/shared/types/absence.ts";

export default defineEventHandler(async (event): Promise<Absence[]> => {
  const { user } = await requireUserSession(event);
  const { from, to } = await getValidatedQuery(event, absencesQuery.parse);

  return await db
    .select()
    .from(absences)
    .where(and(eq(absences.userId, user.id), between(absences.date, from, to)))
    .orderBy(asc(absences.date));
});
