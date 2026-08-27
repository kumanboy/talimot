-- TA’LIMOT Diagnostic Certificates Foundation
-- Run in Supabase SQL Editor BEFORE deploying Diagnostic v1.
-- Safe to re-run: it creates missing objects and upgrades an earlier beta table.

create table if not exists public.diagnostic_certificates (
    id text primary key,
    certificate_code text not null unique,
    user_id text not null references public.users(id) on delete cascade,
    attempt_id text not null unique references public.student_test_attempts(id) on delete cascade,
    test_id text not null,
    test_title text not null,
    subject text not null default 'Ona tili va adabiyot',
    first_name text not null,
    last_name text not null,
    father_name text not null default '',
    test_score numeric(7,2) not null,
    essay_score numeric(7,2),
    final_score numeric(7,2),
    percentage numeric(7,2),
    grade text,
    correct_count integer not null default 0,
    incorrect_count integer not null default 0,
    unanswered_count integer not null default 0,
    issued_at bigint not null,
    created_at bigint not null,
    constraint diagnostic_certificates_test_score_range check (test_score >= 0 and test_score <= 75),
    constraint diagnostic_certificates_essay_score_range check (essay_score is null or (essay_score >= 0 and essay_score <= 75)),
    constraint diagnostic_certificates_final_score_range check (final_score is null or (final_score >= 0 and final_score <= 75)),
    constraint diagnostic_certificates_percentage_range check (percentage is null or (percentage >= 0 and percentage <= 100)),
    constraint diagnostic_certificates_grade_value check (grade is null or grade in ('A+', 'A', 'B+', 'B', 'C+', 'C'))
);

-- Upgrade safety if an earlier beta version of this table already exists.
alter table public.diagnostic_certificates
    add column if not exists first_name text,
    add column if not exists last_name text,
    add column if not exists father_name text default '';

update public.diagnostic_certificates as certificate
set
    first_name = coalesce(certificate.first_name, users.first_name),
    last_name = coalesce(certificate.last_name, users.last_name),
    father_name = coalesce(certificate.father_name, users.father_name, '')
from public.users as users
where certificate.user_id = users.id
  and (certificate.first_name is null
       or certificate.last_name is null
       or certificate.father_name is null);

alter table public.diagnostic_certificates
    alter column first_name set not null,
    alter column last_name set not null,
    alter column father_name set default '',
    alter column father_name set not null;

create unique index if not exists diagnostic_certificates_code_unique
    on public.diagnostic_certificates(certificate_code);

create unique index if not exists diagnostic_certificates_attempt_unique
    on public.diagnostic_certificates(attempt_id);

create index if not exists diagnostic_certificates_user_issued_idx
    on public.diagnostic_certificates(user_id, issued_at desc);

create index if not exists diagnostic_certificates_test_idx
    on public.diagnostic_certificates(test_id);

-- Certificates are immutable result snapshots. The attempt foreign key guarantees
-- a certificate can only exist for a persisted diagnostic attempt. The student's
-- name is snapshotted at issue time, so old certificates do not change if profile
-- details are edited later.
