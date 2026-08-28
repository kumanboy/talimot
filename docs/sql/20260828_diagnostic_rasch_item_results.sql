-- TA’LIMOT Diagnostika item-level analytics / Rasch foundation
-- RUN THIS SQL BEFORE DEPLOYING THE matching application ZIP.

CREATE TABLE IF NOT EXISTS "diagnostic_attempt_item_results" (
    "id" text PRIMARY KEY NOT NULL,
    "attempt_id" text NOT NULL,
    "user_id" text NOT NULL,
    "test_id" text NOT NULL,
    "question_id" text NOT NULL,
    "question_order" integer NOT NULL,
    "item_key" text NOT NULL,
    "part_id" text,
    "section" text NOT NULL,
    "verdict" text NOT NULL,
    "is_correct" boolean NOT NULL,
    "is_answered" boolean NOT NULL,
    "awarded_score" numeric(7, 2) NOT NULL,
    "maximum_score" numeric(7, 2) NOT NULL,
    "answer_payload" jsonb,
    "completed_at" bigint NOT NULL,
    "created_at" bigint NOT NULL,
    CONSTRAINT "diagnostic_item_results_attempt_fk"
        FOREIGN KEY ("attempt_id")
        REFERENCES "student_test_attempts"("id")
        ON DELETE CASCADE,
    CONSTRAINT "diagnostic_item_results_user_fk"
        FOREIGN KEY ("user_id")
        REFERENCES "users"("id")
        ON DELETE CASCADE,
    CONSTRAINT "diagnostic_item_results_verdict_check"
        CHECK ("verdict" IN ('correct', 'incorrect', 'unanswered')),
    CONSTRAINT "diagnostic_item_results_score_check"
        CHECK ("awarded_score" >= 0 AND "maximum_score" >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS "diagnostic_item_results_attempt_item_unique"
    ON "diagnostic_attempt_item_results" ("attempt_id", "item_key");

CREATE INDEX IF NOT EXISTS "diagnostic_item_results_test_item_idx"
    ON "diagnostic_attempt_item_results" ("test_id", "item_key");

CREATE INDEX IF NOT EXISTS "diagnostic_item_results_test_user_idx"
    ON "diagnostic_attempt_item_results" ("test_id", "user_id");

CREATE INDEX IF NOT EXISTS "diagnostic_item_results_attempt_idx"
    ON "diagnostic_attempt_item_results" ("attempt_id");

CREATE INDEX IF NOT EXISTS "diagnostic_item_results_completed_idx"
    ON "diagnostic_attempt_item_results" ("test_id", "completed_at");
