//09:30 -> 9.5
export function toHours(value: string) {
  const [h, m = "0"] = value.split(":");
  return parseFloat(h!) + parseFloat(m) / 60;
}

export function parseHours(from: string, to: string) {
  const h = toHours(to) - toHours(from);
  return Number.isNaN(h) ? 0 : h;
}

export function sumHours(acc: number, hours: number) {
  return acc + hours;
}

export function calcBreaks(entries: SimpleTimeEntry[]) {
  const result: number[] = [];
  for (let i = 1; i < entries.length; i++) {
    const previous = entries[i - 1]!;
    const current = entries[i]!;
    result.push(parseHours(previous.end, current.start));
  }
  return result;
}

export type SimpleTimeEntry = { start: string; end: string; date: string };
