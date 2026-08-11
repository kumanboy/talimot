-- TA’LIMOT roadmap onboarding branch persistence
-- "Ha, topshirganman" -> boost
-- "Yo‘q, birinchi marta topshiraman" -> from-zero
-- Existing users are backfilled from their completed registration challenge destination.

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS roadmap_mode text;

ALTER TABLE public.telegram_auth_challenges
    ADD COLUMN IF NOT EXISTS roadmap_mode text;

-- Recover old onboarding branches from the destination that was already saved
-- during registration before roadmap_mode existed.
UPDATE public.telegram_auth_challenges
SET roadmap_mode = CASE
    WHEN destination LIKE '%mode=boost%'
         OR destination = '/tests'
    THEN 'boost'
    ELSE 'from-zero'
END
WHERE roadmap_mode IS NULL;

-- Recover each already-registered user's latest completed onboarding branch.
UPDATE public.users AS u
SET roadmap_mode = COALESCE(
    (
        SELECT CASE
            WHEN c.destination LIKE '%mode=boost%'
                 OR c.destination = '/tests'
            THEN 'boost'
            ELSE 'from-zero'
        END
        FROM public.telegram_auth_challenges AS c
        WHERE c.telegram_user_id = u.telegram_user_id
          AND c.status = 'completed'
        ORDER BY c.completed_at DESC NULLS LAST, c.created_at DESC
        LIMIT 1
    ),
    'from-zero'
)
WHERE u.roadmap_mode IS NULL;

ALTER TABLE public.users
    ALTER COLUMN roadmap_mode SET DEFAULT 'from-zero',
    ALTER COLUMN roadmap_mode SET NOT NULL;

ALTER TABLE public.telegram_auth_challenges
    ALTER COLUMN roadmap_mode SET DEFAULT 'from-zero',
    ALTER COLUMN roadmap_mode SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_roadmap_mode_check'
    ) THEN
        ALTER TABLE public.users
            ADD CONSTRAINT users_roadmap_mode_check
            CHECK (roadmap_mode IN ('from-zero', 'boost'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'telegram_auth_challenges_roadmap_mode_check'
    ) THEN
        ALTER TABLE public.telegram_auth_challenges
            ADD CONSTRAINT telegram_auth_challenges_roadmap_mode_check
            CHECK (roadmap_mode IN ('from-zero', 'boost'));
    END IF;
END $$;
