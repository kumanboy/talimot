-- TA’LIMOT: student registration + Telegram phone verification
-- Run this once in Supabase SQL Editor before testing registration.

create table if not exists public.users (
    id text primary key,
    first_name text not null,
    last_name text not null,
    father_name text not null,
    phone text not null,
    password_hash text not null,
    role text not null default 'student',
    status text not null default 'active',
    telegram_user_id bigint,
    telegram_chat_id bigint,
    telegram_username text,
    phone_verified_at bigint,
    created_at bigint not null,
    updated_at bigint not null
);

alter table public.users add column if not exists first_name text;
alter table public.users add column if not exists last_name text;
alter table public.users add column if not exists father_name text;
alter table public.users add column if not exists phone text;
alter table public.users add column if not exists password_hash text;
alter table public.users add column if not exists role text default 'student';
alter table public.users add column if not exists status text default 'active';
alter table public.users add column if not exists telegram_user_id bigint;
alter table public.users add column if not exists telegram_chat_id bigint;
alter table public.users add column if not exists telegram_username text;
alter table public.users add column if not exists phone_verified_at bigint;
alter table public.users add column if not exists created_at bigint;
alter table public.users add column if not exists updated_at bigint;

create unique index if not exists users_phone_unique
    on public.users (phone);
create unique index if not exists users_telegram_user_id_unique
    on public.users (telegram_user_id);
create index if not exists users_status_idx
    on public.users (status);
create index if not exists users_created_at_idx
    on public.users (created_at);

create table if not exists public.telegram_auth_challenges (
    id text primary key,
    telegram_user_id bigint not null,
    telegram_chat_id bigint,
    telegram_username text,
    first_name text not null,
    last_name text not null,
    father_name text not null,
    phone text not null,
    password_hash text not null,
    destination text not null,
    status text not null default 'pending_bot',
    code_hash text,
    code_expires_at bigint,
    attempts integer not null default 0,
    created_at bigint not null,
    updated_at bigint not null,
    expires_at bigint not null,
    completed_at bigint
);

create index if not exists telegram_auth_challenges_user_idx
    on public.telegram_auth_challenges (telegram_user_id);
create index if not exists telegram_auth_challenges_status_idx
    on public.telegram_auth_challenges (status);
create index if not exists telegram_auth_challenges_expires_idx
    on public.telegram_auth_challenges (expires_at);
