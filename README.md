# Verhexcel

time tracker which exports data to excel
I wanted to try out sit-onyx ui library, my mother has to track her times in the excel sheet of hell
this is the solution to both of these problems.


## Setup

install dependencies:

```bash
pnpm install
```

### Database

create an empty `local.db` file

push schema to database:
```bash
pnpm db:push
```

seed data
```bash
pnpm db:seed
```

### Environment Variables

- set `NUXT_SESSION_PASSWORD` environment variable to a random string.
- set `DEMO_TOKEN` to a string you can use to access the demo account
- 
## Development Server

Start the development server on `http://localhost:3000`:

```bash
# pnpm
pnpm dev

```
