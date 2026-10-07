// One-off: imports times from a filled Stundenzettel into the DB for one user.
// Replaces existing times of that user on every day found in the file.
// Pause column H is ignored, it cannot be mapped back to a break position.
// Run: node server/db/import-xlsx.ts <file.xlsx> <userId>
import { readFileSync } from "node:fs";
import { and, eq, inArray } from "drizzle-orm";
import { strFromU8, unzipSync } from "fflate";
import { db } from "../utils/db.ts";
import { times, users } from "./schema.ts";

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
const year = Number(sheet(1).match(/<c r="C2"[^>]*><v>(\d+)<\/v>/)?.[1]);
if (!year) {
  console.error("year missing in Voreinstellungen!C2");
  process.exit(1);
}

const entries: (typeof times.$inferInsert)[] = [];
for (let month = 1; month <= 12; month++) {
  const cells: Record<string, number> = {};
  for (const [, ref, v] of sheet(month + 2).matchAll(
    /<c r="([D-G]\d+)"[^>]*><v>([^<]+)<\/v><\/c>/g,
  ))
    cells[ref!] = Number(v);
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  for (let day = 1; day <= days; day++) {
    const date = `${year}-${pad(month)}-${pad(day)}`;
    for (const [s, e] of [["D", "E"], ["F", "G"]]) {
      const start = cells[`${s}${3 + day}`];
      const end = cells[`${e}${3 + day}`];
      if (start !== undefined && end !== undefined)
        entries.push({ userId, date, start: toTime(start), end: toTime(end) });
    }
  }
}
if (!entries.length) {
  console.error("no times found");
  process.exit(1);
}

const dates = [...new Set(entries.map((e) => e.date))];
await db.batch([
  db
    .delete(times)
    .where(and(eq(times.userId, userId), inArray(times.date, dates))),
  db.insert(times).values(entries),
]);
console.log(
  `Imported ${entries.length} times on ${dates.length} days of ${year} for ${user.name}`,
);
