// One-off: imports times and absences from a filled Stundenzettel into the DB for one user.
// Replaces existing times and absences of that user on every day found in the file.
// Pause column H is ignored, it cannot be mapped back to a break position.
// Run: node server/db/import-xlsx.ts <file.xlsx> <userId>
import { readFileSync } from "node:fs";
import { and, eq, inArray } from "drizzle-orm";
import { strFromU8, unzipSync } from "fflate";
import { db } from "../utils/db.ts";
import { absences, absenceTypes, times, users } from "./schema.ts";

const [file, id] = process.argv.slice(2);
const userId = Number(id);
if (!file || !Number.isInteger(userId)) {
  console.error("usage: node server/db/import-xlsx.ts <file.xlsx> <userId>");
  process.exit(1);
}
const [user] = await db.select().from(users).where(eq(users.id, userId));
if (!user) {
  console.error(`user ${userId} not found`);
  process.exit(1);
}

const pad = (n: number) => String(n).padStart(2, "0");
// Excel stores times as fraction of a day
const toTime = (fraction: number) => {
  const minutes = Math.round(fraction * 24 * 60);
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
};

// Month sheets are sheet3.xml (Januar) to sheet14.xml (Dezember), day N is row 3+N.
const files = unzipSync(readFileSync(file));
const sheet = (n: number) => strFromU8(files[`xl/worksheets/sheet${n}.xml`]!);
// Codes in column J are mostly shared strings, our own export writes inline strings.
const shared = [
  ...strFromU8(files["xl/sharedStrings.xml"] ?? new Uint8Array()).matchAll(
    /<si>([\s\S]*?)<\/si>/g,
  ),
].map((m) => m[1]!.replace(/<[^>]+>/g, ""));
const year = Number(sheet(1).match(/<c r="C2"[^>]*><v>(\d+)<\/v>/)?.[1]);
if (!year) {
  console.error("year missing in Voreinstellungen!C2");
  process.exit(1);
}

const entries: (typeof times.$inferInsert)[] = [];
const absenceEntries: (typeof absences.$inferInsert)[] = [];
for (let month = 1; month <= 12; month++) {
  const xml = sheet(month + 2);
  const cells: Record<string, number> = {};
  for (const [, ref, v] of xml.matchAll(
    /<c r="([D-G]\d+)"[^>]*><v>([^<]+)<\/v><\/c>/g,
  ))
    cells[ref!] = Number(v);
  const codes: Record<string, string> = {};
  for (const [, row, attrs, inner] of xml.matchAll(
    /<c r="J(\d+)"([^>/]*)>([\s\S]*?)<\/c>/g,
  ))
    codes[row!] = (
      attrs!.includes('t="s"')
        ? shared[Number(inner!.replace(/<[^>]+>/g, ""))]!
        : inner!.replace(/<[^>]+>/g, "")
    )
      .trim()
      .toUpperCase();
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  for (let day = 1; day <= days; day++) {
    const date = `${year}-${pad(month)}-${pad(day)}`;
    for (const [s, e] of [
      ["D", "E"],
      ["F", "G"],
    ]) {
      const start = cells[`${s}${3 + day}`];
      const end = cells[`${e}${3 + day}`];
      if (start !== undefined && end !== undefined)
        entries.push({ userId, date, start: toTime(start), end: toTime(end) });
    }
    const code = codes[3 + day];
    if (!code) continue;
    const type = absenceTypes.find((t) => t === code);
    if (type) absenceEntries.push({ userId, date, type });
    else console.warn(`${date}: unknown code "${code}" skipped`);
  }
}
if (!entries.length && !absenceEntries.length) {
  console.error("no times or absences found");
  process.exit(1);
}

const dates = [...new Set([...entries, ...absenceEntries].map((e) => e.date))];
await db.batch([
  db
    .delete(times)
    .where(and(eq(times.userId, userId), inArray(times.date, dates))),
  db
    .delete(absences)
    .where(and(eq(absences.userId, userId), inArray(absences.date, dates))),
  ...(entries.length ? [db.insert(times).values(entries)] : []),
  ...(absenceEntries.length
    ? [db.insert(absences).values(absenceEntries)]
    : []),
]);
console.log(
  `Imported ${entries.length} times and ${absenceEntries.length} absences on ${dates.length} days of ${year} for ${user.name}`,
);
