# Verhecxel

Time tracker which exports data to Excel.
I wanted to try out the sit-onyx UI library, and my mother has to track her times in the excel sheet of hell.
This is the solution to both of these problems.

## Setup

Requires Node ≥ 22.18 (`db:seed` runs TypeScript directly) and pnpm.

```bash
pnpm install
cp .env.example .env
```

### Environment Variables

- `NUXT_SESSION_PASSWORD`: random string, min 32 chars.
- `DEMO_TOKEN`: string that grants access to the demo account via `/demo/<DEMO_TOKEN>`.
- `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (optional): remote DB. Defaults to `file:local.db`.

### Database

```bash
pnpm db:push   # create schema
pnpm db:seed   # dev only: wipes all users and inserts example data
```

## Development Server

Start on `http://localhost:3000`:

```bash
pnpm dev
```
