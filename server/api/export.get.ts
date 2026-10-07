import { and, asc, between, eq } from "drizzle-orm";
import { z } from "zod";
import { absences, times } from "../db/schema";

const exportQuery = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
});

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { year } = await getValidatedQuery(event, exportQuery.parse);

  const entries = await db
    .select()
    .from(times)
    .where(
      and(
        eq(times.userId, user.id),
        between(times.date, `${year}-01-01`, `${year}-12-31`),
      ),
    )
    .orderBy(asc(times.date), asc(times.start));
  const absenceEntries = await db
    .select()
    .from(absences)
    .where(
      and(
        eq(absences.userId, user.id),
        between(absences.date, `${year}-01-01`, `${year}-12-31`),
      ),
    );

  const template =
    await useStorage("assets:server").getItemRaw<Uint8Array>(
      "stundenzettel.xlsx",
    );
  const file = fillTimesheet(
    new Uint8Array(template!),
    year,
    user.name,
    entries,
    absenceEntries,
  );

  const filename = encodeURIComponent(
    `Stundenzettel_${year}_${user.name}.xlsx`,
  );
  setResponseHeaders(event, {
    "Content-Type":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
  });
  return file;
});
