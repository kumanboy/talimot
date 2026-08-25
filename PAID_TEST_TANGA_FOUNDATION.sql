-- TA’LIMOT · Paid Test + Tanga foundation
-- Run this once in Supabase SQL Editor BEFORE deploying the matching code.

BEGIN;

ALTER TABLE public.admin_test_drafts
    ADD COLUMN IF NOT EXISTS tanga_price integer NOT NULL DEFAULT 0;

-- Preserve current access values and give existing paid tests sensible defaults.
UPDATE public.admin_test_drafts
SET tanga_price = CASE
    WHEN access = 'premium' AND format = 'diagnostic' THEN 2
    WHEN access = 'premium' THEN 1
    ELSE 0
END
WHERE
    (access = 'premium' AND tanga_price <= 0)
    OR (access = 'free' AND tanga_price <> 0);

-- Keep the JSONB draft payload in sync with the new indexed column.
UPDATE public.admin_test_drafts
SET payload = jsonb_set(
    payload,
    '{metadata,tangaPrice}',
    to_jsonb(tanga_price),
    true
)
WHERE payload IS NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'admin_test_drafts_tanga_price_check'
    ) THEN
        ALTER TABLE public.admin_test_drafts
            ADD CONSTRAINT admin_test_drafts_tanga_price_check
            CHECK (
                (access = 'free' AND tanga_price = 0)
                OR
                (access = 'premium' AND tanga_price BETWEEN 1 AND 1000)
            );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.test_purchases (
    id text PRIMARY KEY,
    user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    test_id text NOT NULL REFERENCES public.admin_test_drafts(id) ON DELETE CASCADE,
    price_paid integer NOT NULL CHECK (price_paid > 0),
    tanga_transaction_id text REFERENCES public.tanga_transactions(id) ON DELETE SET NULL,
    purchased_at bigint NOT NULL,
    CONSTRAINT test_purchases_user_test_unique UNIQUE (user_id, test_id),
    CONSTRAINT test_purchases_tanga_transaction_unique UNIQUE (tanga_transaction_id)
);

CREATE INDEX IF NOT EXISTS test_purchases_user_created_idx
    ON public.test_purchases (user_id, purchased_at);

CREATE INDEX IF NOT EXISTS test_purchases_test_idx
    ON public.test_purchases (test_id);

COMMIT;
