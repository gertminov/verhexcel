import type { SimpleTimeEntry } from "~~/utils/time.ts";

export function toISODate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function getNextWorkingDay(today: Date) {
  const d = new Date(today);
  // skip weekends
  if (d.getDay() == 5) d.setDate(d.getDate() + 3);
  else if (d.getDay() == 6)
    d.setDate(d.getDate() + 2);
  else d.setDate(d.getDate() + 1);
  return d;
}

export function filterByDay(date: Date, timesList: SimpleTimeEntry[]) {
  const dateString = toISODate(date);
  return timesList.filter((t) => t.date == dateString);
}
