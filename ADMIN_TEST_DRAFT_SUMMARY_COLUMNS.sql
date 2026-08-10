-- TA’LIMOT: lightweight test-summary columns
-- Run once in Supabase SQL Editor BEFORE deploying this code.

alter table public.admin_test_drafts
    add column if not exists description text not null default '',
    add column if not exists category text not null default '',
    add column if not exists difficulty text not null default 'medium',
    add column if not exists estimated_minutes integer not null default 0;

-- One-time backfill from the existing JSONB payload.
update public.admin_test_drafts
set
    description = coalesce(payload->'metadata'->>'description', ''),
    category = coalesce(payload->'metadata'->>'category', ''),
    difficulty = case
        when payload->'metadata'->>'difficulty' in ('easy', 'medium', 'hard')
            then payload->'metadata'->>'difficulty'
        else 'medium'
    end,
    estimated_minutes = case
        when coalesce(payload->'metadata'->>'estimatedMinutes', '') ~ '^[0-9]+$'
            then (payload->'metadata'->>'estimatedMinutes')::integer
        else 0
    end;

create index if not exists admin_test_drafts_listing_idx
on public.admin_test_drafts
    (status, group_name, topic_slug, format, updated_at desc);

analyze public.admin_test_drafts;
