// "8" -> "08:00", "830" -> "08:30", "1230" -> "12:30", "12:15" -> "12:15". Invalid -> undefined.
export function parseTime(input: string) {
  const digits = input.replace(/\D/g, '')
  if (!digits || digits.length > 4) return undefined
  const split = digits.length <= 2 ? digits.length : digits.length - 2
  const h = Number(digits.slice(0, split))
  const m = Number(digits.slice(split) || 0)
  if (h > 23 || m > 59) return undefined
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
