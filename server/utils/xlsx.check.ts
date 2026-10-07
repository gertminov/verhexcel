// Run: node server/utils/xlsx.check.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { strFromU8, unzipSync } from "fflate";
import { weekdays } from "../../utils/time.ts";
import { fillTimesheet, toDaySlots } from "./xlsx.ts";

// Fri 2026-10-02 to Tue 2026-10-06 skips the weekend
assert.deepEqual(weekdays("2026-10-02", "2026-10-06"), ["2026-10-02", "2026-10-05", "2026-10-06"]);

const date = "2026-10-05";
const slots = toDaySlots([
  { date, start: "08:00", end: "12:00" },
  { date, start: "12:30", end: "14:00" },
  { date, start: "15:00", end: "18:00" },
]);
assert.deepEqual(slots, { D: 8 / 24, E: 12 / 24, F: 12.5 / 24, G: 18 / 24, H: 1 / 24 });
assert.deepEqual(toDaySlots([{ date, start: "08:00", end: "12:00" }]), {
  D: 8 / 24, E: 12 / 24, F: null, G: null, H: null,
});

const files = unzipSync(
  fillTimesheet(readFileSync("server/assets/stundenzettel.xlsx"), 2027, "A & B", [
    { date, start: "09:00", end: "12:00" },
  ], [{ date: "2026-10-06", type: "U" }, { date: "2026-10-07", type: "K" }]),
);
const settings = strFromU8(files["xl/worksheets/sheet1.xml"]!);
assert.match(settings, /<c r="C2" s="\d+"><v>2027<\/v><\/c>/);
assert.match(settings, /<c r="C3" s="\d+" t="inlineStr"><is><t>A &amp; B<\/t><\/is><\/c>/);
const october = strFromU8(files["xl/worksheets/sheet12.xml"]!);
assert.match(october, new RegExp(`<c r="D8" s="\\d+"><v>${9 / 24}</v></c>`));
assert.match(october, /<c r="F8" s="\d+"\/>/);
assert.match(october, /<c r="J9" s="\d+" t="inlineStr"><is><t>U<\/t><\/is><\/c>/);
assert.match(october, /<c r="J10" s="\d+" t="inlineStr"><is><t>K<\/t><\/is><\/c>/);
console.log("ok");
