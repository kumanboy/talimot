# TA’LIMOT Admin — Step 4.3.2

## Install dependencies

Run from the project root:

```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit dotenv
```

## Add

- `src/lib/database/env.ts`
- `src/lib/database/db.ts`
- `src/lib/database/schema/admin-test-drafts.ts`
- `src/lib/database/schema/index.ts`
- `drizzle.config.ts`
- `.env.database.example`

## Existing secret

Your root `.env.local` must already contain:

```env
DATABASE_URL="postgresql://..."
```

Do not copy `.env.database.example` over `.env.local`.

## Important

This step does not apply a migration yet.

Do not run `drizzle-kit push`.

## Verify application

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

## Verify Drizzle configuration

Because Drizzle Kit loads `.env` by default while the project uses
`.env.local`, use one of these approaches before generating migrations:

### Windows PowerShell

```powershell
$env:DATABASE_URL=(Get-Content .env.local | Select-String '^DATABASE_URL=').ToString().Split('=',2)[1].Trim('"')
npx drizzle-kit check
```

### Recommended safer approach

Create a temporary root `.env` containing only `DATABASE_URL`,
run Drizzle commands, then delete `.env`.

Do not commit `.env`.
