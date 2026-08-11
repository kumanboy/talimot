-- TA'LIMOT: real roadmap attempts + in-app notifications
-- Safe to run more than once.

create table if not exists public.student_test_attempts (
    id text primary key,
    user_id text not null references public.users(id) on delete cascade,
    test_id text not null,
    title text not null,
    category text not null,
    href text not null,
    format text,
    correct_count integer not null default 0,
    incorrect_count integer not null default 0,
    unanswered_count integer not null default 0,
    needs_review_count integer not null default 0,
    percentage integer not null check (percentage between 0 and 100),
    score text,
    maximum_score text,
    duration_seconds integer not null default 0 check (duration_seconds >= 0),
    completed_at bigint not null,
    created_at bigint not null
);

create index if not exists student_test_attempts_user_completed_idx
    on public.student_test_attempts(user_id, completed_at desc);
create index if not exists student_test_attempts_user_href_idx
    on public.student_test_attempts(user_id, href);
create index if not exists student_test_attempts_test_idx
    on public.student_test_attempts(test_id);

create table if not exists public.notifications (
    id text primary key,
    user_id text not null references public.users(id) on delete cascade,
    kind text not null default 'system',
    title text not null,
    message text not null,
    href text,
    is_read boolean not null default false,
    created_at bigint not null
);

create index if not exists notifications_user_created_idx
    on public.notifications(user_id, created_at desc);
create index if not exists notifications_user_read_idx
    on public.notifications(user_id, is_read);
