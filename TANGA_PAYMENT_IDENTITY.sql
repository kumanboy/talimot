-- TA'LIMOT — public numeric user number for manual Tanga payment matching
-- Safe to run after TANGA_FOUNDATION.sql.

begin;

-- Human-friendly user numbers begin at 5700.
do $$
begin
    if not exists (
        select 1
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where c.relkind = 'S'
          and n.nspname = 'public'
          and c.relname = 'talimot_user_number_seq'
    ) then
        create sequence public.talimot_user_number_seq start with 5700 increment by 1;
    end if;
end
$$;

alter table public.users
    add column if not exists user_number integer;

-- Assign a number to every existing user that does not have one yet.
update public.users
set user_number = nextval('public.talimot_user_number_seq')
where user_number is null;

-- Keep the sequence ahead of all assigned values.
select setval(
    'public.talimot_user_number_seq',
    greatest(
        coalesce((select max(user_number) from public.users), 5699),
        5699
    ),
    true
);

alter table public.users
    alter column user_number set default nextval('public.talimot_user_number_seq');

alter table public.users
    alter column user_number set not null;

create unique index if not exists users_user_number_unique
    on public.users(user_number);

commit;
