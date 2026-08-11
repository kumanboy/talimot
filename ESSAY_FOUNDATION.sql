-- TA'LIMOT essay review foundation
-- AI: text only / 3 Tanga
-- Teacher: text OR images / 6 Tanga, manual queue, written + audio feedback

begin;

create table if not exists public.essay_submissions (
    id text primary key,
    user_id text not null references public.users(id) on delete cascade,
    source_type text not null default 'standalone',
    diagnostic_attempt_id text references public.student_test_attempts(id) on delete set null,
    review_type text not null,
    submission_type text not null,
    topic text not null,
    essay_text text,
    tanga_cost integer not null,
    status text not null default 'pending',
    assigned_reviewer_id text,
    tanga_transaction_id text,
    submitted_at bigint not null,
    started_at bigint,
    completed_at bigint,
    cancelled_at bigint,
    created_at bigint not null,
    updated_at bigint not null,
    constraint essay_submissions_review_type_check
        check (review_type in ('ai', 'teacher')),
    constraint essay_submissions_submission_type_check
        check (submission_type in ('text', 'images')),
    constraint essay_submissions_source_type_check
        check (source_type in ('standalone', 'diagnostic')),
    constraint essay_submissions_status_check
        check (status in ('pending', 'processing', 'in_review', 'completed', 'failed', 'cancelled')),
    constraint essay_submissions_cost_check
        check ((review_type = 'ai' and tanga_cost = 3) or (review_type = 'teacher' and tanga_cost = 6)),
    constraint essay_submissions_ai_text_only_check
        check (review_type <> 'ai' or submission_type = 'text'),
    constraint essay_submissions_text_payload_check
        check (submission_type <> 'text' or nullif(btrim(essay_text), '') is not null)
);

create index if not exists essay_submissions_user_created_idx
    on public.essay_submissions(user_id, created_at desc);
create index if not exists essay_submissions_status_created_idx
    on public.essay_submissions(status, created_at asc);
create index if not exists essay_submissions_review_status_idx
    on public.essay_submissions(review_type, status, created_at asc);
create index if not exists essay_submissions_diagnostic_idx
    on public.essay_submissions(diagnostic_attempt_id)
    where diagnostic_attempt_id is not null;

create table if not exists public.essay_submission_files (
    id text primary key,
    submission_id text not null references public.essay_submissions(id) on delete cascade,
    storage_path text not null,
    original_name text not null,
    mime_type text not null,
    size_bytes integer not null,
    position integer not null,
    created_at bigint not null,
    constraint essay_submission_files_position_check check (position between 1 and 5),
    constraint essay_submission_files_size_check check (size_bytes > 0 and size_bytes <= 5242880),
    constraint essay_submission_files_mime_check check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
    unique (submission_id, position)
);

create index if not exists essay_submission_files_submission_idx
    on public.essay_submission_files(submission_id, position);

create table if not exists public.essay_reviews (
    id text primary key,
    submission_id text not null unique references public.essay_submissions(id) on delete cascade,
    reviewer_type text not null,
    reviewer_id text,
    rubric_version text,
    score numeric(6,2),
    rubric_result jsonb not null default '{}'::jsonb,
    summary text,
    strengths text,
    improvements text,
    written_feedback text,
    audio_storage_path text,
    audio_original_name text,
    audio_mime_type text,
    audio_size_bytes integer,
    created_at bigint not null,
    updated_at bigint not null,
    completed_at bigint,
    constraint essay_reviews_reviewer_type_check check (reviewer_type in ('ai', 'teacher')),
    constraint essay_reviews_score_check check (score is null or (score >= 0 and score <= 75)),
    constraint essay_reviews_audio_size_check check (audio_size_bytes is null or (audio_size_bytes > 0 and audio_size_bytes <= 26214400))
);

create index if not exists essay_reviews_reviewer_idx
    on public.essay_reviews(reviewer_type, completed_at desc);

commit;
