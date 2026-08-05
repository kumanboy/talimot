# TA’LIMOT Admin — Step 4.3.3

## Replace

- `drizzle.config.ts`

This version loads `DATABASE_URL` directly from `.env.local`.

## 1. Check schema configuration

```bash
npx drizzle-kit check
```

Expected: no configuration or schema errors.

## 2. Generate the first migration

```bash
npx drizzle-kit generate --name=admin_test_drafts
```

Expected new folder:

```text
drizzle/
├── <timestamp>_admin_test_drafts.sql
└── meta/
```

Open the generated SQL before applying it.

It should create:

```text
admin_test_drafts
```

and indexes including:

```text
admin_test_drafts_route_unique
admin_test_drafts_status_idx
admin_test_drafts_updated_at_idx
admin_test_drafts_title_idx
```

Do not manually edit the generated metadata files.

## 3. Apply migration to Supabase

```bash
npx drizzle-kit migrate
```

Expected: migration applied successfully.

## 4. Verify in Supabase

Open:

```text
Supabase Dashboard
→ Table Editor
→ admin_test_drafts
```

The table should be empty and contain the expected columns.

Also check:

```text
Supabase Dashboard
→ SQL Editor
```

Run:

```sql
select
    table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

Expected table:

```text
admin_test_drafts
```

Drizzle will also create its migration tracking table.

## 5. Application checks

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

## Important

- Do not run `drizzle-kit push`.
- Do not paste `DATABASE_URL` into the terminal output or chat.
- Commit the generated `drizzle/` migration folder.
- Do not commit `.env.local`.
