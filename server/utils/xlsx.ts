import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import {
  calcBreaks,
  type SimpleTimeEntry,
  sumHours,
  toHours,
} from "../../utils/time.ts";

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Replaces the content of an existing <c> element, keeping its style.
// The template has an element for every input cell, so no row/cell insertion is needed.
export function setCell(
  xml: string,
  ref: string,
  value: number | string | null,
) {
  const re = new RegExp(`<c r="${ref}"( s="\\d+")?[^>/]*(?:/>|>[\\s\\S]*?</c>)`);
  if (!re.test(xml)) throw new Error(`cell ${ref} missing in template`);
  return xml.replace(re, (_, style = "") => {
    if (value === null) return `<c r="${ref}"${style}/>`;
    if (typeof value === "number")
      return `<c r="${ref}"${style}><v>${value}</v></c>`;
    return `<c r="${ref}"${style} t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`;
  });
}

// Excel stores times as fraction of a day
const dayFraction = (time?: string) => (time ? toHours(time) / 24 : null);

// Sheet has two in/out pairs per day. Pair 1 = first entry,
// pair 2 = second start to last end, gaps in between go into the pause column.
export function toDaySlots(entries: SimpleTimeEntry[]) {
  const [first, second] = entries;
  const pause = calcBreaks(entries).slice(1).reduce(sumHours, 0);
  return {
    D: dayFraction(first!.start),
    E: dayFraction(first!.end),
    F: dayFraction(second?.start),
    G: second ? dayFraction(entries.at(-1)!.end) : null,
    H: pause ? pause / 24 : null,
  };
}

// Month sheets are sheet3.xml (Januar) to sheet14.xml (Dezember), day N is row 3+N.
export function fillTimesheet(
  template: Uint8Array,
  year: number,
  name: string,
  entries: SimpleTimeEntry[],
) {
  const files = unzipSync(template);
  const edit = (sheet: number, fn: (xml: string) => string) => {
    const path = `xl/worksheets/sheet${sheet}.xml`;
    files[path] = strToU8(fn(strFromU8(files[path]!)));
  };

  edit(1, (xml) => setCell(setCell(xml, "C2", year), "C3", name));

  const byMonth = Object.groupBy(entries, (e) => Number(e.date.slice(5, 7)));
  for (const [month, monthEntries] of Object.entries(byMonth)) {
    edit(Number(month) + 2, (xml) => {
      const byDay = Object.groupBy(monthEntries!, (e) => e.date);
      for (const [date, dayEntries] of Object.entries(byDay)) {
        const row = 3 + Number(date.slice(8, 10));
        for (const [col, value] of Object.entries(toDaySlots(dayEntries!)))
          xml = setCell(xml, `${col}${row}`, value);
      }
      return xml;
    });
  }
  return zipSync(files);
}
