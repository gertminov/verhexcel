# Code Review

Date: 2026-10-07. Commit: `6efcb2a`.

The main risk is lost time entries on the times page, from bugs 1 and 2. Fix those two together to close the data-loss paths.

## Bugs

### 1. Save across a month boundary deletes saved entries

File: `app/pages/times.vue:73-82`

`handleSave` sets `selectedDate` itself, so the calendar's `viewMonth` does not change. Clicking a day does update `viewMonth`, through onyx `goToDate`. After `handleSave`, `query` still points to the old month, and `serverTimes` has no entries for the new day.

Example:

1. Click Save on Fri 2026-10-30. The page jumps to Mon 2026-11-02.
2. The form for 2026-11-02 is empty, even if that day has saved entries.
3. The next date change runs `saveDay(2026-11-02, [])`.
4. The server deletes the saved entries for 2026-11-02.

Fix: set `viewMonth.value = next` in `handleSave`, or load the entries for that day from the server.

### 2. A failed save puts the previous day's entries on the new day

File: `app/pages/times.vue:79-82`

If `saveDay` throws, the watcher stops before `times.value = getTimesForDay(...)` runs. The form then shows the previous day's entries under the new date. The next date change saves them to the wrong day. The user sees no error.

`app/pages/absence.vue:44` `save()` also has no error handling.

### 3. Unsaved edits are lost

File: `app/pages/times.vue`

Times are saved only when the selected date changes. Edits are lost when the user goes to another page or closes the tab. `useState` keeps them in memory, but nothing writes them to the server.

### 4. `handleSave` can land on an absent day

`isAbsent` only knows the absences of the loaded month. When auto-advance moves into the next month, the absence check does not work.

### 5. `weekdays()` is off by one in timezones west of UTC

File: `utils/time.ts:35-39`

`weekdays()` creates dates at UTC midnight, then formats them with `toISODate`, which uses local getters. On a server or dev machine west of UTC, every date moves back one day.

Fix: use `d.toISOString().slice(0, 10)`, as `server/db/seed.ts:25` already does.

### 6. The server does not validate time entries

File: `app/shared/types/time-entry.ts:13-18`

- Nothing checks `end > start` or overlapping entries. Negative hours can reach the xlsx export.
- `z.iso.time()` also accepts seconds and fractions. `toHours` ignores the seconds.

### 7. Invalid ESLint directive

File: `app/middleware/auth.ts:1`

`// @eslint-disable-next-line` is not a valid ESLint directive. Use `// eslint-disable-next-line`, or remove the unused `to` parameter.

## Security and robustness

- **No rate limiting on login and register.** An attacker can brute-force passwords.
- **Login shows which emails exist** (`server/api/login.post.ts:10`). For an unknown email, the server skips `verifyPassword` and responds faster.
- **The demo route is slow and has a GET with side effects** (`server/routes/demo/[token].get.ts:19`). It runs the scrypt `hashPassword` on every request, even when the demo user already exists. Select the user first and insert only when it is missing.

## Improvements

- **Missing index:** add an index on `times(user_id, date)`. Every query filters on both columns. `absences` already has one through its unique constraint.
- **Slow absence export** (`server/utils/xlsx.ts:77-78`): the code decodes and re-encodes the whole month sheet once per absence. Group absences by month, like the times loop does.
- [x] **Project layout:** the types live in `app/shared/types`, and the server imports them via `~/`. As a result, server code depends on the `app/` folder. Nuxt 4's root `shared/` folder already exists (`shared/types/auth.d.ts`) and is auto-imported in both app and server. Move the types there.
- [x] **Dependencies:**
  - `@nuxtjs/tailwindcss` (the Tailwind v3 module) is installed but not used. Tailwind v4 runs through the Vite plugin.
  - `eslint`, `prettier`, `@nuxt/eslint`, `@types/node` and `tailwindcss` are in `dependencies`. Move them to `devDependencies`.
- **Small cleanups:**
  - `app/pages/login.vue:4` uses `useState` for `error`, so the message stays after navigation. `register.vue` uses `ref`. Use `ref` in both files.
  - `app/pages/times.vue:144`: `OnyxButton` has both a `label` prop and the slot text "Save".
  - The calendar props are inconsistent. `absence.vue` uses `small selectionMode`, and `times.vue` uses `size="small" selection-mode`.
  - `.gitignore:30` ignores one personal file. A pattern such as `/*.xlsx` covers all exports.
- **Unneeded saves:** the watcher in `times.vue` sends a PUT on every date change, even when nothing was edited.
