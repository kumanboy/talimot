-- TA’LIMOT: Kurslar va kitoblar katalogi uchun database foundation.
-- Supabase SQL Editor orqali bir marta RUN qiling.

create table if not exists public.catalog_items (
    id text primary key,
    kind text not null check (kind in ('book', 'course')),
    slug text not null,
    title text not null,
    status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
    cover_image text,
    original_price integer not null default 0 check (original_price >= 0),
    sale_price integer not null default 0 check (sale_price >= 0),
    sale_ends_at text,
    sort_order integer not null default 0,
    payload jsonb not null default '{}'::jsonb,
    created_at bigint not null,
    updated_at bigint not null
);

create unique index if not exists catalog_items_kind_slug_unique
    on public.catalog_items(kind, slug);

create index if not exists catalog_items_kind_status_idx
    on public.catalog_items(kind, status);

create index if not exists catalog_items_sort_order_idx
    on public.catalog_items(kind, sort_order, updated_at desc);
