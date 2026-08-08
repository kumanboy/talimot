-- Run this once in Supabase SQL Editor if the users table does not exist yet.
-- It gives the Telegram /start flow a reliable way to distinguish
-- first-time users from already registered users.

create table if not exists public.users (
  id text primary key,
  first_name text not null,
  last_name text not null,
  father_name text not null,
  phone text not null unique,
  password_hash text not null,
  role text not null default 'student',
  status text not null default 'active',
  telegram_user_id bigint unique,
  telegram_chat_id bigint,
  telegram_username text,
  phone_verified_at bigint,
  created_at bigint not null,
  updated_at bigint not null
);

create index if not exists users_status_idx
  on public.users(status);

create index if not exists users_created_at_idx
  on public.users(created_at);
