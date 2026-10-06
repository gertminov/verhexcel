// run: node utils/time.check.ts
import assert from 'node:assert/strict'
import { parseTime } from './time.ts'

const cases: [string, string | undefined][] = [
  ['8', '08:00'], ['12', '12:00'], ['830', '08:30'], ['1230', '12:30'],
  ['8:30', '08:30'], ['0', '00:00'], ['', undefined], ['24', undefined],
  ['860', undefined], ['12345', undefined], ['abc', undefined],
]
for (const [input, expected] of cases) assert.equal(parseTime(input), expected, input)
console.log('ok')
