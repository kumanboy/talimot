-- TA'LIMOT manual payment requests foundation
-- Run once in Supabase SQL Editor before deploying v15.

create table if not exists public.manual_payments (
    id text primary key,
    user_id text references public.users(id) on delete set null,
    kind text not null check (kind in ('tanga', 'book', 'course')),
    item_key text not null,
    title text not null,
    quantity integer not null default 1 check (quantity > 0),
    amount_som integer not null check (amount_som > 0),
    payment_method text not null default 'UZCARD',
    status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected', 'cancelled')),
    full_name text,
    phone text,
    telegram_username text,
    metadata jsonb not null default '{}'::jsonb,
    receipt_reference text,
    admin_note text,
    processed_by text,
    created_at bigint not null,
    updated_at bigint not null,
    processed_at bigint
);

create index if not exists manual_payments_created_idx
    on public.manual_payments (created_at desc);

create index if not exists manual_payments_status_created_idx
    on public.manual_payments (status, created_at desc);

create index if not exists manual_payments_kind_created_idx
    on public.manual_payments (kind, created_at desc);

create index if not exists manual_payments_user_created_idx
    on public.manual_payments (user_id, created_at desc);

create index if not exists manual_payments_phone_idx
    on public.manual_payments (phone);
