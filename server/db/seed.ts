// Dev only: inserts example data. Aborts if users table is not empty.
import { db } from '../utils/db.ts'
import { times, users } from './schema.ts'

if ((await db.select({ id: users.id }).from(users).limit(1)).length) {
  console.error('users table not empty, aborting seed')
  process.exit(1)
}

const [alice, bob] = await db.insert(users).values([
  { name: 'Alice', email: 'alice@example.com', password: 'not-a-real-hash' },
  { name: 'Bob', email: 'bob@example.com', password: 'not-a-real-hash' },
]).returning()

const entries: (typeof times.$inferInsert)[] = []
for (let d = new Date('2026-09-01'); d <= new Date('2026-10-31'); d.setUTCDate(d.getUTCDate() + 1)) {
  if (d.getUTCDay() % 6 === 0) continue
  const date = d.toISOString().slice(0, 10)
  entries.push(
    { userId: alice!.id, date, start: '08:00', end: '12:00' },
    { userId: alice!.id, date, start: '12:30', end: '16:30' },
    { userId: bob!.id, date, start: '09:00', end: '13:00' },
    { userId: bob!.id, date, start: '14:00', end: '17:30' },
  )
}
await db.insert(times).values(entries)

console.log(`Seeded 2 users, ${entries.length} times`)
